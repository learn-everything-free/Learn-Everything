"use client";

// Client-side progress indicators rendered inside otherwise-static pages.
// Each subscribes to the progress store so completions reflect immediately.

import { useProgress, totalXp, XP_PER_TASK } from "@/lib/progress";

/** Green "Completed" pill; renders nothing when the task isn't done yet. */
export function CompletedBadge({ slug }: { slug: string }) {
  const { completed } = useProgress();
  if (!(slug in completed)) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-medium tracking-tight text-emerald-700 border border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30">
      ✓ Completed
    </span>
  );
}

/** Compact "done/total" meter for a set of task slugs. */
export function TaskProgressMeter({
  slugs,
  label = "tasks completed",
}: {
  slugs: string[];
  label?: string;
}) {
  const { completed } = useProgress();
  const done = slugs.reduce((n, s) => n + (s in completed ? 1 : 0), 0);
  const pct = slugs.length === 0 ? 0 : Math.round((done / slugs.length) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-stone/80">
        <div
          className="h-full rounded-full bg-ink transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-caption text-smoke">
        {done}/{slugs.length} {label}
      </span>
    </div>
  );
}

/** Learner XP + streak, driven by validated task completions. */
export function XpCounter() {
  const state = useProgress();
  const xp = totalXp(state);
  const streak = state.streak;
  const streakText =
    streak && streak.count > 0
      ? ` · ${streak.count}-day streak (best ${Math.max(streak.best, streak.count)})`
      : "";
  return (
    <span className="font-mono text-caption uppercase text-smoke">
      {xp > 0 ? `${xp} XP earned · ${XP_PER_TASK} per task${streakText}` : "0 XP — pass a lab to start"}
    </span>
  );
}
