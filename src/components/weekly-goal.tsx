"use client";

// "This week" — a goal the learner sets themselves, the labs they have
// already done in the last seven days, and the XP they earned doing them.

import { useProgress, setWeeklyGoal, weekCompletions, XP_PER_TASK } from "@/lib/progress";

const GOALS = [3, 5, 10, 20];

export function WeeklyGoal() {
  const state = useProgress();
  const week = weekCompletions(state);
  const goal = state.weeklyGoal ?? 0;
  const xp = week.length * XP_PER_TASK;
  const pct = goal > 0 ? Math.min(100, Math.round((week.length / goal) * 100)) : 0;
  const hit = goal > 0 && week.length >= goal;

  return (
    <section className="rounded-none border border-ink/80 bg-eggshell p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-label text-ash">This week</p>
          <h2 className="mt-2 text-heading-sm font-light tracking-[-0.03em] text-ink">
            {goal > 0 ? `${week.length} of ${goal} labs` : "No goal set"}
          </h2>
          <p className="mt-2 text-body-sm text-smoke">
            {goal === 0
              ? "Pick a weekly target — three labs a week is enough to keep a streak alive."
              : hit
                ? "Target hit. Anything more this week is a bonus."
                : `${goal - week.length} to go. ${xp} XP earned in the last seven days.`}
          </p>
        </div>
        {goal > 0 && (
          <span className="font-mono text-caption text-smoke">{xp} XP · 7 days</span>
        )}
      </div>

      <div className="mt-6 h-2 w-full overflow-hidden rounded-none bg-stone/80">
        <div
          className="h-full rounded-none bg-ink transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-ink/20 pt-5">
        <span className="text-label text-ash">Weekly target</span>
        {GOALS.map((g) => (
          <button
            key={g}
            onClick={() => setWeeklyGoal(goal === g ? 0 : g)}
            aria-pressed={goal === g}
            className={`rounded-none border px-3 py-1.5 font-mono text-caption uppercase transition-colors ${
              goal === g
                ? "border-ink bg-ink text-eggshell"
                : "border-ink/50 bg-eggshell text-graphite hover:border-ink hover:text-ink"
            }`}
          >
            {g}
          </button>
        ))}
        {goal > 0 && (
          <button
            onClick={() => setWeeklyGoal(0)}
            className="ml-auto font-mono text-caption uppercase text-ash underline underline-offset-4 transition-colors hover:text-ink"
          >
            Clear
          </button>
        )}
      </div>
    </section>
  );
}
