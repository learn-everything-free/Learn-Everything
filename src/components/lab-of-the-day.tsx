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
    <div className="flex flex-col gap-8 border border-ink/70 p-7 lg:flex-row lg:items-center lg:justify-between lg:p-9">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-3">
          <span className="le-label text-smoke">Lab of the day</span>
          <span className="rounded-full border border-ink/40 px-3 py-1 text-label uppercase tracking-[1px] text-graphite">
            {pick.skillTitle}
          </span>
          {done && (
            <span className="rounded-full border border-ink/40 px-3 py-1 text-label uppercase tracking-[1px] text-graphite">
              ✓ Validated
            </span>
          )}
        </p>
        <h3 className="mt-5 text-body font-medium tracking-[-0.08px] text-ink">{pick.title}</h3>
        <p className="mt-3 max-w-2xl text-body-sm leading-[1.5] text-graphite">
          {pick.description}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
        <span className="text-label uppercase tracking-[1px] text-smoke">
          {pick.type} · {pick.difficulty} · {pick.env}
        </span>
        <Link href={`/lab/${pick.slug}`} className="le-action">
          {done ? "Revisit today's lab" : "Take today's lab"}
        </Link>
        <span className="text-label uppercase tracking-[1px] text-smoke">
          a new one drops every midnight
        </span>
      </div>
    </div>
  );
}
