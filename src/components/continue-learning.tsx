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
        <div className="border border-ink/70 p-6 text-center sm:col-span-2 lg:col-span-4">
          <p className="text-body-sm font-medium text-ink">
            Curriculum cleared — all {order.length} labs validated.
          </p>
          <p className="mt-2 text-label uppercase tracking-[1px] text-smoke">
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
            className="group flex flex-col justify-between border border-ink/70 p-6 transition-colors hover:border-ink"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-label uppercase tracking-[1px] text-smoke">
                  {task.skillTitle}
                </span>
                {done ? (
                  <span className="rounded-full border border-ink/40 px-2.5 py-0.5 text-label uppercase tracking-[1px] text-graphite">
                    ✓ Done
                  </span>
                ) : (
                  <span className="rounded-full border border-ink/25 px-2.5 py-0.5 text-label uppercase tracking-[1px] text-smoke">
                    {task.difficulty}
                  </span>
                )}
              </div>

              <h3 className="mt-4 text-body-sm font-medium text-ink group-hover:opacity-70">
                {task.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-body-sm leading-[1.5] text-graphite">
                {task.description}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-ink/25 pt-4">
              <span className="text-label uppercase tracking-[1px] text-smoke">
                Env: {task.env}
              </span>
              <span className="text-body-sm text-ink">{done ? "Revisit →" : "Launch →"}</span>
            </div>
          </Link>
        );
      })}
    </>
  );
}
