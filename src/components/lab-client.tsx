"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { LabShell, type CheckResult } from "@/lib/shell";
import { LabTerminal, type CommandRunner } from "@/components/terminal";
import { Badge } from "@/components/ui";
import { CompletedBadge } from "@/components/progress";
import { markCompleted, useProgress, XP_PER_TASK } from "@/lib/progress";
import { BookmarkButton } from "@/components/bookmark-button";
import { taskTypeLabel, type Task, type Skill, type Topic, type LearningPath } from "@/lib/data";

// Offline fallback when no AI provider is configured (see .env.example).
const TUTOR_REPLIES = [
  "Good start. What does `ls` show you right now?",
  "Before trying another command, check the state: what actually changed?",
  "Think about what the validator is looking for. Which requirement is still open?",
  "That direction looks reasonable. Run it and show me the output.",
  "Close. Inspect the result of your last command — did it do what you expected?",
];

const QUICK_ASKS = [
  "I'm stuck — where do I start?",
  "Explain the failing check",
  "What should I inspect next?",
];

interface TutorTurn {
  role: "you" | "tutor";
  text: string;
}

// Task types whose walkthrough is fully visible up front. For the rest, step 1
// is shown and further steps reveal per failed submit (or on demand) — struggle
// first is the point.
const OPEN_WALKTHROUGH: Task["type"][] = ["concept", "guided", "project"];

export function LabClient({
  task,
  path,
  skill,
  topic,
}: {
  task: Task;
  path: LearningPath;
  skill: Skill;
  topic: Topic;
}) {
  const [results, setResults] = useState<CheckResult[] | null>(null);
  const [tutor, setTutor] = useState<TutorTurn[]>([
    {
      role: "tutor",
      text: "Tell me what you're stuck on — I'll nudge, not solve. Which requirement are you looking at?",
    },
  ]);
  const [tutorBusy, setTutorBusy] = useState(false);
  const [tutorInput, setTutorInput] = useState("");
  const [shell, setShell] = useState(() => new LabShell());
  const [runner, setRunner] = useState<CommandRunner>(() => () => {});
  const { completed } = useProgress();
  const doneAt = completed[task.slug];

  const bindRunner = useCallback((fn: CommandRunner) => setRunner(() => fn), []);

  const hasRuntimeChecks = task.checks.length > 0;
  const passed = results !== null && results.every((r) => r.pass);
  const passedCount = results ? results.filter((r) => r.pass).length : 0;
  const passPct =
    results && results.length > 0 ? Math.round((passedCount / results.length) * 100) : 0;

  const openWalkthrough = OPEN_WALKTHROUGH.includes(task.type);
  const [revealedSteps, setRevealedSteps] = useState(() =>
    openWalkthrough ? task.steps.length : Math.min(1, task.steps.length),
  );

  const submit = () => {
    if (!hasRuntimeChecks) {
      setResults(null);
      return;
    }
    const checkResults = shell.validate(task.checks);
    setResults(checkResults);
    if (checkResults.every((r) => r.pass)) {
      markCompleted(task.slug);
    } else if (!openWalkthrough) {
      // A failed attempt earns the next walkthrough step.
      setRevealedSteps((n) => Math.min(n + 1, task.steps.length));
    }
  };

  const reset = () => {
    setResults(null);
    setShell(new LabShell());
  };

  const askTutor = async (override?: string) => {
    const text = (override ?? tutorInput).trim();
    if (!text || tutorBusy) return;
    if (!override) setTutorInput("");
    const withUserTurn = [...tutor, { role: "you" as const, text }];
    setTutor([...withUserTurn, { role: "tutor", text: "…" }]);
    setTutorBusy(true);

    let streamed = "";
    const replaceLast = (reply: string) =>
      setTutor((turns) => {
        const next = [...turns];
        next[next.length - 1] = { role: "tutor", text: reply };
        return next;
      });

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: withUserTurn
            .filter((turn) => turn.text.trim())
            .slice(-8)
            .map((turn) => ({ role: turn.role === "you" ? "user" : "assistant", content: turn.text })),
          context: {
            taskTitle: task.title,
            taskDescription: task.description,
            requirements: task.requirements,
            recentCommands: shell.history.slice(-15),
            failingChecks: (results ?? [])
              .filter((r) => !r.pass)
              .map((r) => ({ label: r.label, detail: r.detail })),
            allPassed: passed,
          },
        }),
      });
      if (!res.ok || !res.body) throw new Error(`tutor-http-${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        streamed += decoder.decode(value, { stream: true });
        replaceLast(streamed);
      }
      if (!streamed.trim()) throw new Error("tutor-empty");
    } catch {
      // No provider configured or connection failed: canned Socratic replies.
      const tutorTurns = withUserTurn.filter((t) => t.role === "tutor").length;
      replaceLast(TUTOR_REPLIES[tutorTurns % TUTOR_REPLIES.length]);
    } finally {
      setTutorBusy(false);
    }
  };

  const showQuickAsks = !tutorBusy && tutor.length <= 2;

  return (
    <div className="min-h-[calc(100vh-60px)] bg-gradient-to-b from-warm-taupe/70 via-eggshell to-eggshell">
      <div className="mx-auto max-w-[1280px] px-6 py-8 lg:px-16 lg:py-10">
        {/* Breadcrumb */}
        <p className="font-mono text-caption uppercase text-ash">
          <Link href="/paths" className="transition-colors hover:text-ink">Paths</Link>
          <span className="mx-2 text-stone">/</span>
          <Link href={`/paths/${path.slug}`} className="transition-colors hover:text-ink">{path.title}</Link>
          <span className="mx-2 text-stone">/</span>
          <span className="text-graphite">{skill.title} / {topic.title}</span>
        </p>

        {/* Task header + validator summary */}
        <div className="mt-6 grid gap-8 border-b border-stone pb-10 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="ink">{taskTypeLabel[task.type]}</Badge>
              <Badge>{task.difficulty}</Badge>
              <Badge variant="outline">{task.env}</Badge>
              {doneAt && <CompletedBadge slug={task.slug} />}
              <BookmarkButton slug={task.slug} />
            </div>
            <h1 className="mt-4 text-heading font-light tracking-[-0.02em] text-ink">
              {task.title}
            </h1>
            <p className="mt-3 max-w-2xl text-body text-smoke">{task.description}</p>
          </div>

          {hasRuntimeChecks ? (
            <div className="w-full shrink-0 rounded-[20px] border border-stone bg-eggshell p-5 shadow-[var(--shadow-subtle)] lg:w-72">
              <div className="flex items-center justify-between">
                <p className="font-mono text-caption uppercase tracking-wider text-ash">Validator</p>
                {results && (
                  <span className="font-mono text-mono-xs text-smoke">
                    {passedCount}/{results.length} checks
                  </span>
                )}
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-stone/70">
                <div
                  className="h-full rounded-full bg-ink transition-all duration-500"
                  style={{ width: `${passPct}%` }}
                />
              </div>
              {results === null ? (
                <p className="mt-3 font-mono text-mono-xs text-smoke">
                  IDLE — submit when you believe the task is done
                </p>
              ) : passed ? (
                <p className="mt-3 flex items-center gap-2 font-mono text-mono-xs">
                  <span className="size-2 rounded-full bg-ember-orange" aria-hidden />
                  <span className="text-graphite">
                    PASS · +{XP_PER_TASK} XP
                    {doneAt && " · saved"}
                  </span>
                </p>
              ) : (
                <p className="mt-3 font-mono text-mono-xs text-smoke">
                  FAIL — {results!.length - passedCount} of {results!.length} failing (details below)
                </p>
              )}
            </div>
          ) : (
            <div className="w-full shrink-0 rounded-[20px] border border-dashed border-stone bg-warm-taupe/50 p-5 lg:w-72">
              <p className="font-mono text-caption uppercase tracking-wider text-ash">Validator</p>
              <p className="mt-3 font-mono text-mono-xs text-smoke">
                PENDING RUNTIME — this task needs the full container/Kubernetes lab runtime
              </p>
            </div>
          )}
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-16">
          {/* Task brief */}
          <div>
            {/* 01 — Requirements */}
            <section>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-mono text-caption uppercase tracking-wider text-ash">
                  <span className="mr-2 text-stone">01</span>Requirements
                </h2>
                <span className="font-mono text-caption uppercase text-ash">live checks</span>
              </div>
              <ul className="mt-4 divide-y divide-stone rounded-[20px] border border-stone bg-eggshell shadow-[var(--shadow-subtle)]">
                {results
                  ? results.map((r, i) => (
                      <li key={i} className="px-5 py-3.5 text-body-sm">
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-3">
                            <span
                              className={`flex size-5 shrink-0 items-center justify-center rounded-full font-mono text-mono-xs ${
                                r.pass ? "bg-ink text-eggshell" : "border border-stone text-smoke"
                              }`}
                              aria-hidden
                            >
                              {r.pass ? "✓" : "✗"}
                            </span>
                            <span className={r.pass ? "text-graphite" : "text-ink"}>{r.label}</span>
                          </span>
                        </div>
                        {!r.pass && r.detail !== "ok" && (
                          <p className="ml-8 mt-1 font-mono text-caption text-smoke">
                            validator: {r.detail}
                          </p>
                        )}
                      </li>
                    ))
                  : task.requirements.map((req, i) => (
                      <li key={i} className="flex items-center justify-between gap-4 px-5 py-3.5 text-body-sm">
                        <span className="text-graphite">{req}</span>
                        <span className="font-mono text-mono-xs text-ash">○</span>
                      </li>
                    ))}
              </ul>
            </section>

            {/* 02 — Walkthrough */}
            <section className="mt-12">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-mono text-caption uppercase tracking-wider text-ash">
                  <span className="mr-2 text-stone">02</span>Walkthrough
                </h2>
                <span className="font-mono text-caption uppercase text-ash">
                  {openWalkthrough
                    ? `${task.steps.length} steps`
                    : `${revealedSteps} of ${task.steps.length} revealed`}
                </span>
              </div>
              <ol className="mt-4 space-y-6">
                {task.steps.slice(0, revealedSteps).map((step, i) => {
                  const cmd = step.command;
                  return (
                    <li key={i} className="flex items-baseline gap-4">
                      <span className="font-mono text-mono-xs text-ash">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-body-sm font-medium">{step.title}</p>
                        <p className="mt-1 text-body-sm text-smoke">{step.detail}</p>
                        {cmd ? (
                          <div className="mt-3 flex items-center justify-between gap-4 rounded-[10px] border border-stone bg-warm-taupe py-2 pl-4 pr-2">
                            <code className="overflow-x-auto whitespace-nowrap font-mono text-mono-sm text-graphite">
                              {cmd}
                            </code>
                            <button
                              onClick={() => runner(cmd)}
                              className="shrink-0 rounded-full border border-stone bg-ink px-3 py-1 font-mono text-caption uppercase text-eggshell transition-opacity hover:opacity-80"
                              title={`Runs "${cmd}" in the terminal`}
                            >
                              Run ↘
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
                {revealedSteps < task.steps.length && (
                  <li className="flex flex-wrap items-center justify-between gap-4 rounded-[10px] border border-dashed border-stone bg-warm-taupe/50 px-4 py-3">
                    <span className="font-mono text-mono-xs uppercase text-smoke">
                      {task.steps.length - revealedSteps} locked · each failed submit reveals one
                    </span>
                    <button
                      onClick={() => setRevealedSteps((n) => Math.min(n + 1, task.steps.length))}
                      className="rounded-full border border-stone bg-eggshell px-3.5 py-1.5 font-mono text-caption uppercase text-graphite transition-colors hover:border-ink hover:text-ink"
                    >
                      Reveal next step
                    </button>
                  </li>
                )}
              </ol>
            </section>

            {/* 03 — AI Tutor */}
            <section className="mt-12">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-mono text-caption uppercase tracking-wider text-ash">
                  <span className="mr-2 text-stone">03</span>AI Tutor
                </h2>
                <span className="font-mono text-caption uppercase text-ash">guides, never solves</span>
              </div>

              <div className="mt-4 space-y-3">
                {tutor.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "you" ? "justify-end" : "justify-start"}`}>
                    {m.role === "tutor" && (
                      <span
                        className="mr-2.5 mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-[10px] font-bold text-eggshell"
                        aria-hidden
                      >
                        T
                      </span>
                    )}
                    <p
                      className={`max-w-[85%] px-4 py-2.5 text-body-sm ${
                        m.role === "you"
                          ? "rounded-[14px] rounded-br-[4px] bg-stone/60 text-graphite"
                          : "rounded-[14px] rounded-bl-[4px] bg-warm-taupe text-ink"
                      }`}
                    >
                      {m.text || "…"}
                    </p>
                  </div>
                ))}
              </div>

              {showQuickAsks && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {QUICK_ASKS.map((ask) => (
                    <button
                      key={ask}
                      onClick={() => askTutor(ask)}
                      className="rounded-full border border-stone bg-eggshell px-3.5 py-1.5 font-mono text-caption text-graphite transition-colors hover:border-ink hover:text-ink"
                    >
                      {ask}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <input
                  value={tutorInput}
                  onChange={(e) => setTutorInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && askTutor()}
                  placeholder="Describe what you tried…"
                  disabled={tutorBusy}
                  className="w-full rounded-full border border-stone bg-eggshell px-4 py-2.5 text-body-sm outline-none placeholder:text-ash focus:border-ink disabled:opacity-60"
                />
                <button
                  onClick={() => askTutor()}
                  disabled={tutorBusy}
                  className="shrink-0 rounded-full border border-stone bg-ink px-5 py-2.5 text-body-sm font-medium text-eggshell transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {tutorBusy ? "…" : "Ask"}
                </button>
              </div>
            </section>
          </div>

          {/* Terminal */}
          <div className="lg:sticky lg:top-[84px] lg:self-start">
            <div
              className={`overflow-hidden rounded-[20px] border bg-[#191918] shadow-[var(--shadow-subtle)] transition-shadow ${
                passed ? "border-emerald-400/40" : "border-stone"
              }`}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-ash" />
                  <span className="size-2 rounded-full bg-smoke" />
                  <span className="size-2 rounded-full bg-[#ebe8e4]" />
                </div>
                <p className="font-mono text-caption uppercase text-ash">
                  learner@lab — {task.env}
                </p>
              </div>
              <LabTerminal shell={shell} bindRunner={bindRunner} />
              {passed && (
                <div className="flex items-center gap-2 border-t border-emerald-400/20 bg-emerald-400/10 px-5 py-2.5">
                  <span className="size-2 rounded-full bg-emerald-400" aria-hidden />
                  <p className="font-mono text-mono-xs text-emerald-200">
                    All checks passed — task complete · +{XP_PER_TASK} XP
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
                <button
                  onClick={reset}
                  className="rounded-full border border-white/20 px-4 py-1.5 font-mono text-caption uppercase text-ash transition-colors hover:border-[#ebe8e4] hover:text-[#ebe8e4]"
                >
                  Reset Lab
                </button>
                <p className="hidden font-mono text-caption uppercase text-smoke sm:block">
                  Session is disposable
                </p>
                <button
                  onClick={submit}
                  disabled={!hasRuntimeChecks}
                  className={`rounded-full px-5 py-1.5 font-mono text-caption uppercase transition-opacity disabled:cursor-not-allowed disabled:opacity-40 ${
                    passed
                      ? "bg-emerald-400 text-[#191918] hover:opacity-85"
                      : "bg-[#fdfcfc] text-[#191918] hover:opacity-80"
                  }`}
                >
                  {passed ? "Passed ✓" : "Submit"}
                </button>
              </div>
            </div>
            <p className="mt-4 text-center font-mono text-caption uppercase text-ash">
              ↑/↓ recalls previous commands · type <span className="text-graphite">help</span> for the command list
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
