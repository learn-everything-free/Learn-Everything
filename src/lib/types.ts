export type TaskType =
  | "concept"
  | "guided"
  | "practice"
  | "challenge"
  | "scenario"
  | "project";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Step {
  title: string;
  detail: string;
  command?: string;
}

export interface Task {
  slug: string;
  title: string;
  type: TaskType;
  difficulty: Difficulty;
  description: string;
  requirements: string[];
  env: string;
  checks: import("./shell").ValidatorCheck[];
  steps: Step[];
}

export interface Topic {
  slug: string;
  title: string;
  summary: string;
  tasks: Task[];
}

export interface Skill {
  slug: string;
  title: string;
  summary: string;
  topics: Topic[];
}

export interface LearningPath {
  slug: string;
  title: string;
  role: string;
  tagline: string;
  skills: Skill[];
}
