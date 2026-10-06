// Gamification rules: learner levels and achievements. Pure functions over the
// progress state plus the curriculum index — no storage, no React, so both the
// dashboard and any future surfaces can reuse them.

import type { ProgressState } from "./progress";
import type { CurriculumIndex } from "./curriculum-index";

// XP thresholds for named levels (50 XP per validated lab).
export const LEVELS = [
  { xp: 0, name: "Novice" },
  { xp: 200, name: "Apprentice" },
  { xp: 500, name: "Operator" },
  { xp: 1000, name: "Practitioner" },
  { xp: 1500, name: "Engineer" },
  { xp: 2000, name: "Senior" },
  { xp: 2500, name: "Architect" },
] as const;

export function levelForXp(xp: number) {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xp) index = i;
  }
  const current = LEVELS[index];
  const next = LEVELS[index + 1] ?? null;
  return {
    level: index + 1,
    name: current.name,
    next,
    into: xp - current.xp,
    span: next ? next.xp - current.xp : 0,
  };
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  glyph: string;
}

export interface AchievementView extends AchievementDef {
  unlocked: boolean;
  /** Short progress note shown on locked badges, e.g. "3 / 5 labs". */
  hint: string;
}

export function evaluateAchievements(
  state: ProgressState,
  index: CurriculumIndex,
): AchievementView[] {
  const completedSlugs = Object.keys(state.completed);
  const n = completedSlugs.length;
  const total = index.tasks.length;
  const completedSet = new Set(completedSlugs);
  const doneTasks = index.tasks.filter((t) => completedSet.has(t.slug));
  const pathsTouched = new Set(doneTasks.map((t) => t.pathSlug));
  const typesDone = new Set(doneTasks.map((t) => t.type));
  const streakBest = Math.max(state.streak?.count ?? 0, state.streak?.best ?? 0);

  const milestone = (threshold: number, unit = "labs") =>
    n >= threshold ? "" : `${Math.min(n, threshold)} / ${threshold} ${unit}`;

  const defs: (AchievementDef & { unlocked: boolean; hint: string })[] = [
    {
      id: "first-lab",
      title: "First Contact",
      description: "Validate your first hands-on lab.",
      glyph: "⚡",
      unlocked: n >= 1,
      hint: milestone(1),
    },
    {
      id: "five-labs",
      title: "Warming Up",
      description: "Validate 5 labs.",
      glyph: "✦",
      unlocked: n >= 5,
      hint: milestone(5),
    },
    {
      id: "ten-labs",
      title: "Getting Serious",
      description: "Validate 10 labs.",
      glyph: "★",
      unlocked: n >= 10,
      hint: milestone(10),
    },
    {
      id: "twenty-labs",
      title: "Grinder",
      description: "Validate 20 labs.",
      glyph: "✪",
      unlocked: n >= 20,
      hint: milestone(20),
    },
    {
      id: "completionist",
      title: "Completionist",
      description: `Validate every lab on the platform (${total}).`,
      glyph: "♛",
      unlocked: total > 0 && n >= total,
      hint: milestone(total),
    },
    {
      id: "streak-3",
      title: "Habit Forming",
      description: "Keep a 3-day learning streak.",
      glyph: "🔥",
      unlocked: streakBest >= 3,
      hint: streakBest >= 3 ? "" : `best streak: ${streakBest}d`,
    },
    {
      id: "streak-7",
      title: "Week of reps",
      description: "Keep a 7-day learning streak.",
      glyph: "🏆",
      unlocked: streakBest >= 7,
      hint: streakBest >= 7 ? "" : `best streak: ${streakBest}d`,
    },
    {
      id: "explorer",
      title: "Explorer",
      description: "Complete labs in 2 different paths.",
      glyph: "◆",
      unlocked: pathsTouched.size >= 2,
      hint: pathsTouched.size >= 2 ? "" : `${pathsTouched.size} / 2 paths`,
    },
    {
      id: "polyglot",
      title: "Polyglot",
      description: "Complete labs in all 3 paths.",
      glyph: "❖",
      unlocked: index.paths.length > 0 && pathsTouched.size >= index.paths.length,
      hint: `${pathsTouched.size} / ${index.paths.length} paths`,
    },
    {
      id: "challenger",
      title: "Challenger",
      description: "Pass a challenge-type lab.",
      glyph: "⚔️",
      unlocked: typesDone.has("challenge"),
      hint: typesDone.has("challenge") ? "" : "pass any challenge",
    },
    {
      id: "scenario",
      title: "Incident Commander",
      description: "Pass a scenario-type lab.",
      glyph: "🧭",
      unlocked: typesDone.has("scenario"),
      hint: typesDone.has("scenario") ? "" : "pass any scenario",
    },
    {
      id: "shipper",
      title: "Shipper",
      description: "Complete a project-type lab.",
      glyph: "🏗️",
      unlocked: typesDone.has("project"),
      hint: typesDone.has("project") ? "" : "finish a project lab",
    },
  ];

  // One badge per path, unlocked by finishing every lab the path offers.
  for (const path of index.paths) {
    if (path.taskSlugs.length === 0) continue;
    const done = path.taskSlugs.filter((s) => completedSet.has(s)).length;
    defs.push({
      id: `path-${path.slug}`,
      title: `${path.title} — Clear`,
      description: `Complete all ${path.taskSlugs.length} labs in the ${path.title} path.`,
      glyph: "⚑",
      unlocked: done >= path.taskSlugs.length,
      hint: `${done} / ${path.taskSlugs.length} labs`,
    });
  }

  return defs;
}
