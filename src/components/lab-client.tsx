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
    <div className="mx-auto max-w-[1200px] px-6 py-12 lg:px-10">
      <p className="font-mono text-mono-xs uppercase text-stone">
        <Link href="/paths" className="hover:text-ink">Paths</Link>
        {" / "}
        <Link href={`/paths/${path.slug}`} className="hover:text-ink">{path.title}</Link>
        {" / "}
        <span>{skill.title} / {topic.title}</span>
      </p>

      <div className="mt-8 grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-16">
        {/* Task brief */}
        <div>
          <h1 className="text-heading tracking-[-0.05em]">{task.title}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="amber">{taskTypeLabel[task.type]}</Badge>
            <Badge>{task.difficulty}</Badge>
            <Badge variant="ink">{task.env}</Badge>
          </div>
          <p className="mt-6 text-body tracking-[-0.04em] text-stone">{task.description}</p>

          <h2 className="mt-10 border-t border-rule pt-8 font-mono text-mono-sm uppercase">Requirements</h2>
          <ul className="mt-4 divide-y divide-rule border-y border-rule">
            {(results ? task.checks.map((c) => c.label) : task.requirements).map((req, i) => {
              const result = results?.[i];
              return (
                <li key={i} className="flex items-center justify-between gap-4 py-3 text-body-sm tracking-[-0.04em]">
                  <span>{req}</span>
                  <span className="font-mono text-mono-sm">
                    {result ? (result.pass ? "✓" : "✗") : "○"}
                  </span>
                </li>
              );
            })}
          </ul>

          {hasRuntimeChecks ? (
            <div className="mt-6">
              {results === null ? (
                <p className="font-mono text-mono-sm text-stone">
                  VALIDATOR: IDLE — run <span className="text-amber">Submit</span> when you believe the task is done
                </p>
              ) : passed ? (
                <p className="font-mono text-mono-sm">
                  <span className="text-amber">PASS</span>
                  <span className="text-stone"> — all checks passed against environment state · +50 XP</span>
                </p>
              ) : (
                <p className="font-mono text-mono-sm">
                  <span className="text-stone">FAIL</span> — {results.filter((r) => !r.pass).length} check(s) failing:
                </p>
              )}
              {results && !passed && (
                <ul className="mt-3 space-y-1">
                  {results.filter((r) => !r.pass).map((r) => (
                    <li key={r.label} className="font-mono text-mono-sm text-stone">
                      ✗ {r.label} — {r.detail}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="mt-6 font-mono text-mono-sm text-stone">
              VALIDATOR: PENDING RUNTIME — this task needs the full container/Kubernetes lab runtime (not part of the browser preview).
            </p>
          )}

          {/* Walkthrough — every step explained, nothing hidden */}
          <h2 className="mt-10 border-t border-rule pt-8 font-mono text-mono-sm uppercase">
            Walkthrough <span className="text-stone">— {task.steps.length} steps</span>
          </h2>
          <ol className="mt-6 divide-y divide-rule border-y border-rule">
            {task.steps.map((step, i) => {
              const cmd = step.command;
              return (
              <li key={i} className="py-6">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-mono-sm text-stone">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-body tracking-[-0.04em]">{step.title}</p>
                    <p className="mt-2 text-body-sm tracking-[-0.04em] text-stone">{step.detail}</p>
                    {cmd ? (
                      <div className="mt-4 flex items-center justify-between gap-4 rounded-[2px] border border-rule bg-ink py-2.5 pl-4 pr-2.5">
                        <code className="overflow-x-auto whitespace-nowrap font-mono text-mono-sm text-linen">
                          {cmd}
                        </code>
                        <button
                          onClick={() => runner(cmd)}
                          className="shrink-0 rounded-[2px] bg-amber px-3 py-1.5 font-mono text-mono-xs uppercase text-ink transition-opacity hover:opacity-80"
                          title={`Runs "${cmd}" in the terminal`}
                        >
                          Run ↘
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
              );
            })}
          </ol>
          <p className="mt-4 font-mono text-mono-xs uppercase text-stone">
            Run sends the command straight into the lab terminal — or type it yourself
          </p>

          {/* AI tutor */}
          <h2 className="mt-10 border-t border-rule pt-8 font-mono text-mono-sm uppercase">AI Tutor</h2>
          <div className="mt-4 space-y-3">
            {tutor.map((m, i) => (
              <p
                key={i}
                className={
                  m.role === "you"
                    ? "text-body-sm tracking-[-0.04em] text-stone"
                    : "border-l-2 border-amber px-5 py-2 text-body-sm tracking-[-0.04em]"
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
              className="w-full rounded-[2px] border border-rule bg-cream px-4 py-2.5 text-body-sm tracking-[-0.04em] outline-none placeholder:text-ash focus:border-amber"
            />
            <button
              onClick={askTutor}
              className="rounded-[2px] bg-ink px-5 py-2.5 text-caption tracking-[-0.03em] text-cream transition-colors hover:bg-stone"
            >
              Ask
            </button>
          </div>
          <p className="mt-3 font-mono text-mono-xs uppercase text-stone">
            Tutor guides debugging — it does not generate answers
          </p>
        </div>

        {/* Terminal */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-[2px] border border-rule bg-ink">
            <div className="flex items-center justify-between border-b border-stone/40 px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-ash" />
                <span className="size-2 rounded-full bg-stone" />
                <span className="size-2 rounded-full bg-linen" />
              </div>
              <p className="font-mono text-mono-xs uppercase text-ash">
                learner@lab — {task.env}
              </p>
            </div>
            <LabTerminal shell={shell} bindRunner={bindRunner} />
            <div className="flex items-center justify-between border-t border-stone/40 px-4 py-3">
              <button
                onClick={reset}
                className="rounded-[2px] border border-ash px-4 py-2 font-mono text-mono-sm uppercase text-ash transition-colors hover:border-linen hover:text-linen"
              >
                Reset Lab
              </button>
              <p className="hidden font-mono text-mono-xs uppercase text-stone sm:block">
                Session is disposable — destroy to start fresh
              </p>
              <button
                onClick={submit}
                disabled={!hasRuntimeChecks}
                className="rounded-[2px] bg-amber px-5 py-2 font-mono text-mono-sm uppercase text-ink transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
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
