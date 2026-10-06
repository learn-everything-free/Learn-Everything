"use client";

// "Lab of the Day" — a deterministic daily pick. The seed is the UTC day
// number, so every learner worldwide sees the same lab each day; learners
// with progress get a pick from their remaining labs instead.

import Link from "next/link";
import { useProgress } from "@/lib/progress";
import type { TaskIndexEntry } from "@/lib/curriculum-index";

// UTC day number, computed once per page load — keeps the pick stable within
// a day and identical on server and client.
const TODAY = Math.floor(Date.now() / 86_400_000);

export function LabOfTheDay({ tasks }: { tasks: TaskIndexEntry[] }) {
  const { completed } = useProgress();
  if (tasks.length === 0) return null;

  const remaining = tasks.filter((t) => !(t.slug in completed));
  const pool = remaining.length > 0 ? remaining : tasks;
  const pick = pool[TODAY % pool.length];
  const done = pick.slug in completed;

  return (
    <div className="rounded-[24px] border border-stone/80 bg-eggshell p-8 shadow-[var(--shadow-subtle)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-3 font-mono text-caption uppercase tracking-wider text-ash">
            Lab of the Day
            <span className="rounded-full border border-stone/70 bg-warm-taupe px-2.5 py-0.5 text-graphite">
              {pick.skillTitle}
            </span>
            {done && (
              <span className="rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                ✓ already validated
              </span>
            )}
          </p>
          <h3 className="mt-3 text-2xl font-light tracking-[-0.02em] text-ink">{pick.title}</h3>
          <p className="mt-2 max-w-2xl text-body-sm leading-relaxed text-smoke">
            {pick.description}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
          <span className="font-mono text-caption uppercase text-ash">
            {pick.type} · {pick.difficulty} · {pick.env}
          </span>
          <Link
            href={`/lab/${pick.slug}`}
            className="rounded-full bg-ink px-6 py-3 text-body-sm font-medium text-eggshell transition-opacity hover:opacity-85"
          >
            {done ? "Revisit today's lab ↗" : "Take today's lab ⚡"}
          </Link>
          <span className="font-mono text-caption text-ash">a new one drops every midnight</span>
        </div>
      </div>
    </div>
  );
}
