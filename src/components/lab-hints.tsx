"use client";

// "Stuck?" — progressive hints for a lab. Each click reveals one more level:
// what the validator wants, where to start, which check is still open, and
// where the walkthrough ends. Hints point at the thing to look at; they
// never contain the answer.

import { useState } from "react";
import { buildHints } from "@/lib/hints";
import type { CheckResult } from "@/lib/shell";
import type { Task } from "@/lib/data";

export function LabHints({
  task,
  results,
  liveChecks,
}: {
  task: Task;
  results: CheckResult[] | null;
  liveChecks: CheckResult[] | null;
}) {
  const [revealed, setRevealed] = useState(0);
  const hints = buildHints(task, results, liveChecks);

  if (hints.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-label text-ash">
          <span className="mr-2 text-stone">03</span>Stuck?
        </h2>
        <span className="font-mono text-caption uppercase text-ash">
          {revealed} of {hints.length} revealed
        </span>
      </div>

      <div className="mt-4 rounded-none border border-ink/80 bg-eggshell p-5">
        {revealed === 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-md text-body-sm text-smoke">
              Take a hint without losing the lab — each one points at the thing to look at, not
              at the answer.
            </p>
            <button
              onClick={() => setRevealed(1)}
              className="rounded-none border border-ink bg-ink px-4 py-2 font-mono text-caption uppercase text-eggshell transition-opacity hover:opacity-85"
            >
              Reveal a hint
            </button>
          </div>
        ) : (
          <>
            <ol className="space-y-4">
              {hints.slice(0, revealed).map((hint, i) => (
                <li key={hint.label} className="flex gap-4">
                  <span className="font-mono text-mono-xs text-ash">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block text-body-sm font-medium text-ink">{hint.label}</span>
                    <span className="mt-1 block text-body-sm text-smoke">{hint.body}</span>
                  </span>
                </li>
              ))}
            </ol>
            {revealed < hints.length && (
              <button
                onClick={() => setRevealed((n) => Math.min(n + 1, hints.length))}
                className="mt-5 rounded-none border border-ink bg-eggshell px-3.5 py-1.5 font-mono text-caption uppercase text-graphite transition-colors hover:border-ink hover:text-ink"
              >
                One more hint
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
