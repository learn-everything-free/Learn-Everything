import type { CurriculumIndex, TaskIndexEntry } from "./curriculum-index";

// A recommendation engine: given what a learner has finished and where they
// have been recently, what should they do next? Three picks, each with a
// reason the learner can read:
//
//   next  — the next lab in the track they are already working in
//   weak  — a lab in the skill they have started but barely finished
//   quick — a short beginner lab, for a win when nothing is going well

export type RecommendationKind = "next" | "weak" | "quick";

export interface Recommendation {
  slug: string;
  title: string;
  pathTitle: string;
  skillTitle: string;
  kind: RecommendationKind;
  reason: string;
}

const KIND_LABEL: Record<RecommendationKind, string> = {
  next: "Next in your track",
  weak: "Weak spot",
  quick: "Quick win",
};

export function recommendationLabel(kind: RecommendationKind): string {
  return KIND_LABEL[kind];
}

function groupBySkill(tasks: TaskIndexEntry[]): Map<string, TaskIndexEntry[]> {
  const map = new Map<string, TaskIndexEntry[]>();
  for (const task of tasks) {
    const list = map.get(task.skillSlug) ?? [];
    list.push(task);
    map.set(task.skillSlug, list);
  }
  return map;
}

/** The path the learner is working in: the one they visited most recently. */
function focusPathSlug(
  index: CurriculumIndex,
  recentSlugs: string[],
): string | null {
  for (const slug of recentSlugs) {
    const task = index.tasks.find((t) => t.slug === slug);
    if (task) return task.pathSlug;
  }
  // No visits yet: fall back to the path with the most completions.
  let best: { slug: string; count: number } | null = null;
  for (const path of index.paths) {
    const count = path.taskSlugs.length;
    if (!best || count > best.count) best = { slug: path.slug, count };
  }
  return best?.slug ?? null;
}

/**
 * Build the recommendation queue. Pure: the caller passes the completed set
 * and the recent visit list, so it works on the server and in the browser.
 */
export function buildRecommendations(
  index: CurriculumIndex,
  completed: Record<string, string>,
  recentSlugs: string[] = [],
): Recommendation[] {
  const done = new Set(Object.keys(completed));
  const bySkill = groupBySkill(index.tasks);
  const picks: Recommendation[] = [];
  const seen = new Set<string>();

  const push = (task: TaskIndexEntry | undefined, kind: RecommendationKind, reason: string) => {
    if (!task || seen.has(task.slug)) return;
    seen.add(task.slug);
    picks.push({
      slug: task.slug,
      title: task.title,
      pathTitle: task.pathTitle,
      skillTitle: task.skillTitle,
      kind,
      reason,
    });
  };

  // 1 — the next unfinished lab in the track they are working in
  const focus = focusPathSlug(index, recentSlugs);
  if (focus) {
    const path = index.paths.find((p) => p.slug === focus);
    const pathTasks = index.tasks.filter((t) => t.pathSlug === focus);
    const nextTask = pathTasks.find((t) => !done.has(t.slug));
    push(
      nextTask,
      "next",
      path
        ? `Next in ${path.title} — ${nextTask?.topicTitle ?? "the next topic"}`
        : "Next in your current track",
    );
  }

  // 2 — the skill they have started but barely finished
  let weakest: { skillTitle: string; ratio: number; task: TaskIndexEntry | undefined } | null = null;
  for (const [skillSlug, tasks] of bySkill) {
    const finished = tasks.filter((t) => done.has(t.slug)).length;
    if (finished === 0) continue;
    const ratio = finished / tasks.length;
    if (!weakest || ratio < weakest.ratio) {
      weakest = {
        skillTitle: tasks[0].skillTitle,
        ratio,
        task: tasks.find((t) => !done.has(t.slug)),
      };
    }
    void skillSlug;
  }
  push(
    weakest?.task,
    "weak",
    weakest
      ? `You are ${Math.round(weakest.ratio * 100)}% through ${weakest.skillTitle}`
      : "",
  );

  // 3 — a short beginner lab for a win
  const quick = index.tasks.find((t) => !done.has(t.slug) && t.difficulty === "beginner");
  push(quick, "quick", "A short beginner lab — good for a five-minute win");

  return picks.slice(0, 3);
}
