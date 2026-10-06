import { paths } from "./data";

// A flat, serializable snapshot of the curriculum. Server pages build it once
// and hand it to client components (dashboard, continue-learning, search) so
// they can reason about progress without pulling lesson markdown into the
// client bundle.

export interface TaskIndexEntry {
  slug: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  env: string;
  pathSlug: string;
  pathTitle: string;
  skillSlug: string;
  skillTitle: string;
  topicSlug: string;
  topicTitle: string;
}

export interface PathStats {
  slug: string;
  title: string;
  role: string;
  tagline: string;
  taskSlugs: string[];
}

export interface CurriculumIndex {
  tasks: TaskIndexEntry[];
  paths: PathStats[];
}

export function buildCurriculumIndex(): CurriculumIndex {
  const tasks: TaskIndexEntry[] = [];
  const taskSlugsSeen = new Set<string>();
  const pathStats: PathStats[] = [];

  for (const path of paths) {
    const pathTaskSlugs: string[] = [];
    for (const skill of path.skills) {
      for (const topic of skill.topics) {
        for (const task of topic.tasks) {
          if (!pathTaskSlugs.includes(task.slug)) pathTaskSlugs.push(task.slug);
          if (taskSlugsSeen.has(task.slug)) continue;
          taskSlugsSeen.add(task.slug);
          tasks.push({
            slug: task.slug,
            title: task.title,
            description: task.description,
            type: task.type,
            difficulty: task.difficulty,
            env: task.env,
            pathSlug: path.slug,
            pathTitle: path.title,
            skillSlug: skill.slug,
            skillTitle: skill.title,
            topicSlug: topic.slug,
            topicTitle: topic.title,
          });
        }
      }
    }
    pathStats.push({
      slug: path.slug,
      title: path.title,
      role: path.role,
      tagline: path.tagline,
      taskSlugs: pathTaskSlugs,
    });
  }

  return { tasks, paths: pathStats };
}
