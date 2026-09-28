"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { LabShell, type CheckResult } from "@/lib/shell";
import { LabTerminal, type CommandRunner } from "@/components/terminal";
import { Badge } from "@/components/ui";
import { taskTypeLabel, type Task, type Skill, type Topic, type LearningPath } from "@/lib/data";

const TUTOR_REPLIES = [
  "Good start. What does `ls` show you right now?",
  "Before trying another command, check the state: what actually changed?",
  "Think about what the validator is looking for. Which requirement is still open?",
  "That direction looks reasonable. Run it and show me the output.",
  "Close. Inspect the result of your last command — did it do what you expected?",
];

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
  const [tutor, setTutor] = useState<{ role: "you" | "tutor"; text: string }[]>([
    { role: "tutor", text: "The walkthrough below has every command — but run each step and watch what actually changes. Where are you stuck?" },
  ]);
  const [tutorInput, setTutorInput] = useState("");
  const [shell, setShell] = useState(() => new LabShell());
  const [runner, setRunner] = useState<CommandRunner>(() => () => {});

  const bindRunner = useCallback((fn: CommandRunner) => setRunner(() => fn), []);

  const hasRuntimeChecks = task.checks.length > 0;
  const passed = results !== null && results.every((r) => r.pass);

  const submit = () => {
    if (!hasRuntimeChecks) {
      setResults(null);
      return;
    }
    setResults(shell.validate(task.checks));
  };

  const reset = () => {
    setResults(null);
    setShell(new LabShell());
  };

  const askTutor = () => {
    const text = tutorInput.trim();
    if (!text) return;
    setTutorInput("");
    const reply = TUTOR_REPLIES[tutor.filter((m) => m.role === "tutor").length % TUTOR_REPLIES.length];
    setTutor((t) => [...t, { role: "you", text }, { role: "tutor", text: reply }]);
  };

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-12 lg:px-16">
      <p className="font-mono text-caption uppercase text-ash">
        <Link href="/paths" className="hover:text-ink">Paths</Link>
        {" / "}
        <Link href={`/paths/${path.slug}`} className="hover:text-ink">{path.title}</Link>
        {" / "}
        <span>{skill.title} / {topic.title}</span>
      </p>

      <div className="mt-8 grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-16">
        {/* Task brief */}
        <div>
          <h1 className="text-heading font-light tracking-[-0.02em]">{task.title}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="ink">{taskTypeLabel[task.type]}</Badge>
            <Badge>{task.difficulty}</Badge>
            <Badge variant="outline">{task.env}</Badge>
          </div>
          <p className="mt-6 text-body text-smoke">{task.description}</p>

          <h2 className="mt-10 border-t border-stone pt-8 font-mono text-caption uppercase text-ash">
            Requirements
          </h2>
          <ul className="mt-4 divide-y divide-stone border-y border-stone">
            {(results ? task.checks.map((c) => c.label) : task.requirements).map((req, i) => {
              const result = results?.[i];
              return (
                <li key={i} className="flex items-center justify-between gap-4 py-3 text-body-sm">
                  <span>{req}</span>
                  <span className="font-mono text-mono-xs">
                    {result ? (result.pass ? "✓" : "✗") : "○"}
                  </span>
                </li>
              );
            })}
          </ul>

          {hasRuntimeChecks ? (
            <div className="mt-6">
              {results === null ? (
                <p className="font-mono text-mono-xs text-smoke">
                  VALIDATOR: IDLE — run Submit when you believe the task is done
                </p>
              ) : passed ? (
                <p className="flex items-center gap-2 font-mono text-mono-xs">
                  <span className="size-2 rounded-full bg-ember-orange" aria-hidden />
                  <span>PASS — all checks passed against environment state · +50 XP</span>
                </p>
              ) : (
                <p className="font-mono text-mono-xs text-smoke">
                  FAIL — {results.filter((r) => !r.pass).length} check(s) failing:
                </p>
              )}
              {results && !passed && (
                <ul className="mt-3 space-y-1">
                  {results.filter((r) => !r.pass).map((r) => (
                    <li key={r.label} className="font-mono text-mono-xs text-smoke">
                      ✗ {r.label} — {r.detail}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="mt-6 font-mono text-mono-xs text-smoke">
              VALIDATOR: PENDING RUNTIME — this task needs the full container/Kubernetes lab runtime (not part of the browser preview).
            </p>
          )}

          {/* Walkthrough — every step explained, nothing hidden */}
          <h2 className="mt-10 border-t border-stone pt-8 font-mono text-caption uppercase text-ash">
            Walkthrough <span className="text-ash">— {task.steps.length} steps</span>
          </h2>
          <ol className="mt-6 space-y-8">
            {task.steps.map((step, i) => {
              const cmd = step.command;
              return (
                <li key={i} className="flex items-baseline gap-4">
                  <span className="font-mono text-mono-xs text-ash">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-body-sm font-medium">{step.title}</p>
                    <p className="mt-1.5 text-body-sm text-smoke">{step.detail}</p>
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
          </ol>
          <p className="mt-4 font-mono text-caption uppercase text-ash">
            Run sends the command straight into the lab terminal — or type it yourself
          </p>

          {/* AI tutor */}
          <h2 className="mt-10 border-t border-stone pt-8 font-mono text-caption uppercase text-ash">
            AI Tutor
          </h2>
          <div className="mt-4 space-y-3">
            {tutor.map((m, i) => (
              <p
                key={i}
                className={
                  m.role === "you"
                    ? "text-body-sm text-smoke"
                    : "rounded-[10px] bg-warm-taupe px-4 py-2.5 text-body-sm"
                }
              >
                {m.role === "you" ? "You: " : "Tutor: "}
                {m.text}
              </p>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <input
              value={tutorInput}
              onChange={(e) => setTutorInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askTutor()}
              placeholder="Describe what you tried…"
              className="w-full rounded-[4px] border border-stone bg-eggshell px-4 py-2.5 text-body-sm outline-none placeholder:text-ash focus:border-ink"
            />
            <button
              onClick={askTutor}
              className="rounded-full border border-stone bg-ink px-5 py-2.5 text-body-sm font-medium text-eggshell transition-opacity hover:opacity-80"
            >
              Ask
            </button>
          </div>
          <p className="mt-3 font-mono text-caption uppercase text-ash">
            Tutor guides debugging — it does not generate answers
          </p>
        </div>

        {/* Terminal */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <div className="overflow-hidden rounded-[20px] border border-stone bg-[#191918] shadow-[var(--shadow-subtle)]">
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
                className="rounded-full bg-eggshell px-5 py-1.5 font-mono text-caption uppercase text-ink transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
