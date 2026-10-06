"use client";

// Learner dashboard: level + XP, streak, per-path progress, achievements and
// recent activity, all derived client-side from the progress store. The server
// page only supplies the lightweight curriculum index.

import Link from "next/link";
import { useProgress, totalXp, toggleBookmark, XP_PER_TASK } from "@/lib/progress";
import { evaluateAchievements, levelForXp } from "@/lib/achievements";
import type { CurriculumIndex, TaskIndexEntry } from "@/lib/curriculum-index";

const TYPE_GLYPHS: Record<string, string> = {
  concept: "◦",
  guided: "→",
  practice: "⟳",
  challenge: "★",
  scenario: "⚑",
  project: "◆",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function DashboardClient({ index }: { index: CurriculumIndex }) {
  const state = useProgress();
  const xp = totalXp(state);
  const completedSlugs = Object.keys(state.completed);
  const completedSet = new Set(completedSlugs);
  const lvl = levelForXp(xp);
  const achievements = evaluateAchievements(state, index);
  const unlockedAchievements = achievements.filter((a) => a.unlocked).length;
  const streak = state.streak;
  const streakBest = Math.max(streak?.count ?? 0, streak?.best ?? 0);

  const nextUp = index.tasks.filter((t) => !completedSet.has(t.slug)).slice(0, 3);
  const bookmarked = index.tasks.filter((t) => state.bookmarks && t.slug in state.bookmarks);
  const recent = [...completedSlugs]
    .sort((a, b) => (state.completed[a] < state.completed[b] ? 1 : -1))
    .slice(0, 8)
    .map((slug) => ({ slug, ts: state.completed[slug], entry: index.tasks.find((t) => t.slug === slug) }))
    .filter((r) => r.entry);

  const levelPct = lvl.next ? Math.min(100, Math.round((lvl.into / lvl.span) * 100)) : 100;

  return (
    <div className="mx-auto max-w-[1280px] space-y-14 px-6 pb-24 pt-12 lg:px-16 lg:pt-16">
      {/* Heading */}
      <section className="space-y-3">
        <p className="font-mono text-caption uppercase tracking-wider text-ash">
          Progress Dashboard
        </p>
        <h1 className="text-4xl font-light tracking-[-0.03em] text-ink sm:text-5xl">
          {completedSlugs.length === 0
            ? "Your journey starts here."
            : `${lvl.name}, level ${lvl.level}.`}
        </h1>
        <p className="max-w-xl text-body text-smoke">
          {completedSlugs.length === 0
            ? "Validate your first hands-on lab to earn XP, build a streak, and unlock achievements. Everything is tracked right here."
            : `${completedSlugs.length} of ${index.tasks.length} labs validated — every completion is checked by the automated validator, not self-reported.`}
        </p>
      </section>

      {/* Stat row */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-[20px] border border-stone/80 bg-warm-taupe/70 p-6">
          <p className="text-3xl font-light tracking-[-0.03em] text-ink">{lvl.level}</p>
          <p className="mt-2 text-body-sm font-medium text-graphite">{lvl.name}</p>
          <p className="mt-1 font-mono text-caption text-smoke">current level</p>
        </div>
        <div className="rounded-[20px] border border-stone/80 bg-warm-taupe/70 p-6">
          <p className="text-3xl font-light tracking-[-0.03em] text-ink">{xp}</p>
          <p className="mt-2 text-body-sm font-medium text-graphite">XP earned</p>
          <p className="mt-1 font-mono text-caption text-smoke">{XP_PER_TASK} per lab</p>
        </div>
        <div className="rounded-[20px] border border-stone/80 bg-warm-taupe/70 p-6">
          <p className="text-3xl font-light tracking-[-0.03em] text-ink">
            {streak?.count ?? 0}
            <span className="text-base text-ember-orange"> d</span>
          </p>
          <p className="mt-2 text-body-sm font-medium text-graphite">Current streak</p>
          <p className="mt-1 font-mono text-caption text-smoke">best {streakBest}d</p>
        </div>
        <div className="rounded-[20px] border border-stone/80 bg-warm-taupe/70 p-6">
          <p className="text-3xl font-light tracking-[-0.03em] text-ink">
            {unlockedAchievements}
            <span className="text-base text-ash"> / {achievements.length}</span>
          </p>
          <p className="mt-2 text-body-sm font-medium text-graphite">Achievements</p>
          <p className="mt-1 font-mono text-caption text-smoke">unlocked</p>
        </div>
      </section>

      {/* Level progress */}
      <section className="rounded-[24px] border border-stone/80 bg-warm-taupe/70 p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-caption uppercase tracking-wider text-ash">
              Level progress
            </p>
            <h2 className="mt-2 text-2xl font-light tracking-tight text-ink">
              {lvl.next
                ? `${lvl.into} / ${lvl.span} XP toward ${lvl.next.name}`
                : "Top level reached — Architect"}
            </h2>
          </div>
          <span className="font-mono text-caption text-smoke">
            level {lvl.level} of {levelForXp(Infinity).level}
          </span>
        </div>
        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-stone/80">
          <div
            className="h-full rounded-full bg-ink transition-all duration-500"
            style={{ width: `${levelPct}%` }}
          />
        </div>
      </section>

      {/* Paths + continue learning */}
      <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-[24px] border border-stone/80 bg-warm-taupe/70 p-8">
          <p className="font-mono text-caption uppercase tracking-wider text-ash">
            Path progress
          </p>
          <div className="mt-6 space-y-6">
            {index.paths.map((path) => {
              const done = path.taskSlugs.filter((s) => completedSet.has(s)).length;
              const pct =
                path.taskSlugs.length === 0
                  ? 0
                  : Math.round((done / path.taskSlugs.length) * 100);
              const cleared = path.taskSlugs.length > 0 && done === path.taskSlugs.length;
              return (
                <div key={path.slug}>
                  <Link href={`/paths/${path.slug}`} className="group block">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-body-sm font-medium text-ink group-hover:underline">
                        {path.title}
                      </p>
                      <span className="font-mono text-caption text-smoke">
                        {done}/{path.taskSlugs.length} labs · {pct}%
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone/80">
                      <div
                        className="h-full rounded-full bg-ink transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </Link>
                  {cleared && (
                    <Link
                      href={`/certificates/${path.slug}`}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                    >
                      🏅 View your certificate
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-8 border-t border-stone/70 pt-4 font-mono text-caption leading-relaxed text-ash">
            Progress lives in your browser and syncs to your account when signed in.
          </p>
        </div>

        <div className="rounded-[24px] border border-stone/80 bg-warm-taupe/70 p-8">
          <p className="font-mono text-caption uppercase tracking-wider text-ash">
            Continue learning
          </p>
          <div className="mt-6 space-y-3">
            {nextUp.length === 0 ? (
              <p className="text-body-sm text-smoke">
                Every lab validated — you&apos;ve cleared the whole curriculum. 🎉
              </p>
            ) : (
              nextUp.map((t) => <MiniTaskCard key={t.slug} task={t} done={false} />)
            )}
          </div>
          <Link
            href="/paths"
            className="mt-6 inline-flex rounded-full border border-stone bg-eggshell px-4 py-2 text-xs font-medium text-graphite transition-colors hover:bg-stone hover:text-ink"
          >
            Browse all paths →
          </Link>
        </div>
      </section>

      {/* Bookmarks */}
      {bookmarked.length > 0 && (
        <section className="space-y-6">
          <div>
            <p className="font-mono text-caption uppercase tracking-wider text-ash">
              Saved labs
            </p>
            <h2 className="mt-2 text-3xl font-light tracking-[-0.02em] text-ink">
              Bookmarked for later
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bookmarked.map((t) => (
              <div
                key={t.slug}
                className="flex items-center justify-between gap-3 rounded-[16px] border border-stone/80 bg-warm-taupe/70 px-5 py-4"
              >
                <Link href={`/lab/${t.slug}`} className="min-w-0 group">
                  <p className="truncate text-body-sm font-medium text-ink group-hover:underline">
                    {t.title}
                  </p>
                  <p className="truncate font-mono text-caption text-ash">
                    {t.skillTitle} · {t.difficulty}
                  </p>
                </Link>
                <button
                  onClick={() => toggleBookmark(t.slug)}
                  aria-label={`Remove ${t.title} from saved labs`}
                  title="Remove bookmark"
                  className="shrink-0 rounded-full border border-amber-300/80 bg-amber-50 px-2.5 py-1 font-mono text-caption text-amber-800 transition-colors hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                >
                  ★
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Achievements */}
      <section className="space-y-6">
        <div>
          <p className="font-mono text-caption uppercase tracking-wider text-ash">
            Achievements
          </p>
          <h2 className="mt-2 text-3xl font-light tracking-[-0.02em] text-ink">
            {unlockedAchievements} of {achievements.length} unlocked
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`rounded-[20px] border p-6 transition-all ${
                a.unlocked
                  ? "border-ink/25 bg-warm-taupe shadow-xs"
                  : "border-stone/60 bg-eggshell opacity-70"
              }`}
            >
              <div className="flex items-start justify-between">
                <span
                  className={`flex size-10 items-center justify-center rounded-xl border text-lg ${
                    a.unlocked
                      ? "border-stone/60 bg-eggshell"
                      : "border-stone/50 bg-warm-taupe/60 grayscale"
                  }`}
                >
                  {a.glyph}
                </span>
                {a.unlocked && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] uppercase text-emerald-700 border border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30">
                    ✓
                  </span>
                )}
              </div>
              <h3 className={`mt-4 text-base font-medium ${a.unlocked ? "text-ink" : "text-graphite"}`}>
                {a.title}
              </h3>
              <p className="mt-1.5 text-body-sm leading-relaxed text-smoke">{a.description}</p>
              {!a.unlocked && a.hint && (
                <p className="mt-3 font-mono text-caption text-ash">{a.hint}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section className="space-y-6">
        <p className="font-mono text-caption uppercase tracking-wider text-ash">
          Recent activity
        </p>
        {recent.length === 0 ? (
          <div className="rounded-[22px] border border-stone/80 bg-warm-taupe/70 p-8 text-center">
            <p className="text-body text-smoke">No completions yet.</p>
            {index.tasks[0] && (
              <Link
                href={`/lab/${index.tasks[0].slug}`}
                className="mt-4 inline-flex rounded-full bg-ink px-5 py-2.5 text-body-sm font-medium text-eggshell transition-opacity hover:opacity-85"
              >
                Launch your first lab ⚡
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-[22px] border border-stone/80 bg-warm-taupe/70">
            {recent.map((r, i) => (
              <Link
                key={r.slug}
                href={`/lab/${r.slug}`}
                className={`flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-stone/40 ${
                  i > 0 ? "border-t border-stone/70" : ""
                }`}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-emerald-200/80 bg-emerald-50 font-mono text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                    ✓
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-body-sm font-medium text-ink">
                      {TYPE_GLYPHS[r.entry!.type] ?? "◦"} {r.entry!.title}
                    </p>
                    <p className="truncate font-mono text-caption text-ash">
                      {r.entry!.skillTitle} · {r.entry!.pathTitle}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-caption text-smoke">
                  {formatDate(r.ts)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MiniTaskCard({ task, done }: { task: TaskIndexEntry; done: boolean }) {
  return (
    <Link
      href={`/lab/${task.slug}`}
      className="group flex items-center justify-between gap-3 rounded-[14px] border border-stone/70 bg-eggshell px-4 py-3 transition-colors hover:border-ink/25"
    >
      <div className="min-w-0">
        <p className="truncate text-body-sm font-medium text-ink">{task.title}</p>
        <p className="truncate font-mono text-caption text-ash">
          {task.skillTitle} · {task.difficulty}
        </p>
      </div>
      <span className="shrink-0 text-xs font-semibold text-ink group-hover:underline">
        {done ? "Revisit" : "Launch ⚡"}
      </span>
    </Link>
  );
}
