"use client";

// "Continue learning" strip for the homepage: shows the learner's next
// unvalidated labs in curriculum order, with checkmarks on completed ones.
// Falls back to the earliest labs for brand-new visitors.

import Link from "next/link";
import { useProgress } from "@/lib/progress";
import type { TaskIndexEntry } from "@/lib/curriculum-index";

export function ContinueLearning({ order }: { order: TaskIndexEntry[] }) {
  const { completed } = useProgress();
  const doneCount = order.reduce((n, t) => n + (t.slug in completed ? 1 : 0), 0);
  const allDone = order.length > 0 && doneCount === order.length;

  const items: TaskIndexEntry[] = allDone
    ? order.slice(-4).reverse()
    : order.filter((t) => !(t.slug in completed)).slice(0, 4);

  if (order.length === 0) return null;

  return (
    <>
      {allDone && (
        <div className="rounded-[22px] border border-emerald-200/80 bg-emerald-50/60 p-6 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10 sm:col-span-2 lg:col-span-4">
          <p className="text-body font-medium text-emerald-800 dark:text-emerald-300">
            🎉 Curriculum cleared — all {order.length} labs validated.
          </p>
          <p className="mt-1 font-mono text-caption text-emerald-700/80 dark:text-emerald-300/70">
            Revisit any lab below to keep the streak alive.
          </p>
        </div>
      )}
      {items.map((task) => {
        const done = task.slug in completed;
        return (
          <Link
            key={task.slug}
            href={`/lab/${task.slug}`}
            className="group flex flex-col justify-between rounded-[22px] border border-stone/80 bg-warm-taupe/70 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-ink/25 hover:bg-warm-taupe hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-ash">
                  {task.skillTitle}
                </span>
                {done ? (
                  <span className="rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                    ✓ Done
                  </span>
                ) : (
                  <span className="rounded-full border border-stone/60 bg-eggshell px-2 py-0.5 text-[10px] font-medium capitalize text-graphite">
                    {task.difficulty}
                  </span>
                )}
              </div>

              <h3 className="mt-3 text-base font-medium text-ink">{task.title}</h3>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-smoke">
                {task.description}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-stone/60 pt-3">
              <span className="font-mono text-[10px] text-ash">Env: {task.env}</span>
              <span className="text-xs font-semibold text-ink group-hover:underline">
                {done ? "Revisit ↗" : "Launch ⚡"}
              </span>
            </div>
          </Link>
        );
      })}
    </>
  );
}
