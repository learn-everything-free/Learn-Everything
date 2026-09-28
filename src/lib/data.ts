import {
  paths as pathRecords,
  skills as skillRecords,
  topics as topicRecords,
  tasks as taskRecords,
  lessons as lessonRecords,
  validators as validatorRegistry,
} from "#content";
import type { LearningPath, Skill, Topic, Task, Step } from "./types";
import type { ValidatorCheck } from "./shell";

export type { TaskType, Difficulty, Step, Task, Topic, Skill, LearningPath } from "./types";
export type { ValidatorCheck };

type VeliteTask = (typeof taskRecords)[number];
type VeliteRegistry = (typeof validatorRegistry)["validators"][number];


const dirOf = (file: string) => file.split("/").slice(0, -1).join("/");

// ---------- validator registry resolution ----------

function resolveValidation(task: VeliteTask, registry: VeliteRegistry[]): ValidatorCheck[] {
  return task.validation.map((entry) => {
    const def = registry.find((v) => v.id === entry.validator);
    if (!def) {
      throw new Error(
        `${task.file}: unknown validator '${entry.validator}' (registered: ${registry.map((v) => v.id).join(", ")})`,
      );
    }
    const params = entry as Record<string, unknown>;
    const missing = def.params.filter((p) => params[p] === undefined);
    if (missing.length) {
      throw new Error(`${task.file}: validator '${entry.validator}' missing params: ${missing.join(", ")}`);
    }
    const unknown = Object.keys(params).filter(
      (k) => !["validator", "label", ...def.params].includes(k),
    );
    if (unknown.length) {
      throw new Error(`${task.file}: validator '${entry.validator}' has unknown params: ${unknown.join(", ")}`);
    }
    const check = {
      kind: def.kind as ValidatorCheck["kind"],
      label: entry.label,
    } as ValidatorCheck;
    for (const [field, template] of Object.entries(def.fields)) {
      const match = template.match(/^\{\{(\w+)\}\}$/);
      if (match) {
        const value = params[match[1]];
        (check as unknown as Record<string, unknown>)[field] =
          typeof value === "number" ? value : String(value);
      } else {
        (check as unknown as Record<string, unknown>)[field] = template.replace(
          /\{\{(\w+)\}\}/g,
          (_m: string, p: string) => String(params[p]),
        );
      }
    }
    return check;
  });
}

function toTask(task: VeliteTask, registry: VeliteRegistry[]): Task {
  return {
    slug: task.slug,
    title: task.title,
    type: task.type as Task["type"],
    difficulty: task.difficulty as Task["difficulty"],
    description: task.description,
    requirements: task.requirements,
    env: task.environment,
    checks: resolveValidation(task, registry),
    steps: task.steps as Step[],
  };
}

// ---------- joins ----------

const taskBySlug = new Map<string, Task>(
  taskRecords.map((t) => [t.slug, toTask(t, validatorRegistry.validators)]),
);

const lessonByDir = new Map<string, string>(
  lessonRecords.map((l) => [dirOf(l.file), l.content]),
);

const topicsBySkillDir = new Map<string, Topic[]>();
for (const topic of [...topicRecords].sort((a, b) => a.order - b.order)) {
  const skillDir = dirOf(dirOf(topic.file)); // strip topic/ dir
  const topics = topicsBySkillDir.get(skillDir) ?? [];
  topics.push({
    slug: topic.slug,
    title: topic.title,
    summary: topic.summary,
    tasks: topic.tasks
      .map((slug) => taskBySlug.get(slug))
      .filter((t): t is Task => !!t),
    lesson: lessonByDir.get(dirOf(topic.file)),
  });
  topicsBySkillDir.set(skillDir, topics);
}

const skillsByPathSlug = new Map<string, Skill[]>();
for (const skill of [...skillRecords].sort((a, b) => a.order - b.order)) {
  const skillDir = dirOf(skill.file);
  const list = skillsByPathSlug.get(skill.path) ?? [];
  list.push({
    slug: skill.slug,
    title: skill.title,
    summary: skill.summary,
    topics: topicsBySkillDir.get(skillDir) ?? [],
  });
  skillsByPathSlug.set(skill.path, list);
}

const builtPaths: LearningPath[] = [...pathRecords]
  .sort((a, b) => a.order - b.order)
  .map((p) => ({
    slug: p.slug,
    title: p.title,
    role: p.role,
    tagline: p.tagline,
    skills: skillsByPathSlug.get(p.slug) ?? [],
  }));

// ---------- public API (unchanged for the app) ----------

export const paths: LearningPath[] = builtPaths;

export function getPath(slug: string): LearningPath | undefined {
  return paths.find((p) => p.slug === slug);
}

export function getSkill(
  pathSlug: string,
  skillSlug: string,
): { path: LearningPath; skill: Skill } | undefined {
  const path = getPath(pathSlug);
  const skill = path?.skills.find((s) => s.slug === skillSlug);
  return path && skill ? { path, skill } : undefined;
}

export function getTask(
  taskSlug: string,
): { task: Task; path: LearningPath; skill: Skill; topic: Topic } | undefined {
  for (const path of paths) {
    for (const skill of path.skills) {
      for (const topic of skill.topics) {
        const task = topic.tasks.find((t) => t.slug === taskSlug);
        if (task) return { task, path, skill, topic };
      }
    }
  }
  return undefined;
}

export function countTasks(path: LearningPath): number {
  return path.skills.reduce(
    (n, s) => n + s.topics.reduce((m, t) => m + t.tasks.length, 0),
    0,
  );
}

export function getTasksBySkillSlug(
  skillSlug: string,
): { task: Task; path: LearningPath; skill: Skill; topic: Topic }[] {
  const result: { task: Task; path: LearningPath; skill: Skill; topic: Topic }[] = [];
  for (const path of paths) {
    for (const skill of path.skills) {
      if (skill.slug === skillSlug) {
        for (const topic of skill.topics) {
          for (const task of topic.tasks) {
            result.push({ task, path, skill, topic });
          }
        }
      }
    }
  }
  return result;
}

export function getAllTasks(): { task: Task; path: LearningPath; skill: Skill; topic: Topic }[] {
  const result: { task: Task; path: LearningPath; skill: Skill; topic: Topic }[] = [];
  for (const path of paths) {
    for (const skill of path.skills) {
      for (const topic of skill.topics) {
        for (const task of topic.tasks) {
          result.push({ task, path, skill, topic });
        }
      }
    }
  }
  return result;
}

export const taskTypeLabel: Record<Task["type"], string> = {
  concept: "Concept",
  guided: "Guided Task",
  practice: "Practice Task",
  challenge: "Challenge",
  scenario: "Scenario",
  project: "Project",
};

