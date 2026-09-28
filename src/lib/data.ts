import type { LearningPath, Skill, Topic, Task } from "./types";

export type { TaskType, Difficulty, Step, Task, Topic, Skill, LearningPath } from "./types";
export type { ValidatorCheck } from "./shell";

import { linuxSkill } from "./content/linux";
import { networkingSkill } from "./content/networking";
import { gitSkill } from "./content/git";
import { dockerSkill } from "./content/docker";
import { cicdSkill } from "./content/cicd";
import { awsSkill } from "./content/aws";
import { terraformSkill } from "./content/terraform";
import { kubernetesSkill } from "./content/kubernetes";
import { observabilitySkill } from "./content/observability";
import { platformSkill } from "./content/platform";

const devopsPath: LearningPath = {
  slug: "devops-engineer",
  title: "DevOps Engineer",
  role: "PATH 01",
  tagline:
    "From the Linux shell to production Kubernetes — the full infrastructure toolchain, learned by operating it.",
  skills: [
    linuxSkill,
    networkingSkill,
    gitSkill,
    dockerSkill,
    cicdSkill,
    awsSkill,
    terraformSkill,
    kubernetesSkill,
    observabilitySkill,
    platformSkill,
  ],
};

const aiEngineerPath: LearningPath = {
  slug: "ai-engineer",
  title: "AI Engineer",
  role: "PATH 02",
  tagline:
    "From Python fundamentals to RAG, agents, MCP and LLMOps — building AI systems that actually run.",
  skills: [
    { slug: "python", title: "Python", summary: "The working language of AI engineering.", topics: [] },
    { slug: "llm-fundamentals", title: "LLM Fundamentals", summary: "Tokens, context windows and inference.", topics: [] },
    { slug: "prompt-engineering", title: "Prompt Engineering", summary: "Structured outputs and reliable instructions.", topics: [] },
    { slug: "rag", title: "RAG", summary: "Retrieval-augmented generation end to end.", topics: [] },
    { slug: "agents", title: "Agents & MCP", summary: "Tool use, agent loops and the Model Context Protocol.", topics: [] },
    { slug: "llmops", title: "LLMOps", summary: "Evaluation, observability and serving in production.", topics: [] },
  ],
};

const mlopsPath: LearningPath = {
  slug: "mlops-engineer",
  title: "MLOps Engineer",
  role: "PATH 03",
  tagline:
    "Pipelines, tracking, registries and serving — the infrastructure discipline behind machine learning in production.",
  skills: [
    { slug: "python", title: "Python", summary: "The working language of ML engineering.", topics: [] },
    { slug: "ml-pipelines", title: "ML Pipelines", summary: "Data and training pipelines that rerun reliably.", topics: [] },
    { slug: "model-tracking", title: "Model Tracking", summary: "Experiments, metrics and reproducibility.", topics: [] },
    { slug: "model-serving", title: "Model Serving", summary: "Serving models as dependable APIs.", topics: [] },
    { slug: "monitoring", title: "Monitoring", summary: "Drift, latency and the health of ML systems.", topics: [] },
  ],
};

export const paths: LearningPath[] = [devopsPath, aiEngineerPath, mlopsPath];

export function getPath(slug: string): LearningPath | undefined {
  return paths.find((p) => p.slug === slug);
}

export function getSkill(pathSlug: string, skillSlug: string): { path: LearningPath; skill: Skill } | undefined {
  const path = getPath(pathSlug);
  const skill = path?.skills.find((s) => s.slug === skillSlug);
  return path && skill ? { path, skill } : undefined;
}

export function getTask(taskSlug: string): { task: Task; path: LearningPath; skill: Skill; topic: Topic } | undefined {
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

export const taskTypeLabel: Record<Task["type"], string> = {
  concept: "Concept",
  guided: "Guided Task",
  practice: "Practice Task",
  challenge: "Challenge",
  scenario: "Scenario",
  project: "Project",
};
