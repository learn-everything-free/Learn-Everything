import type { ValidatorCheck } from "./shell";

export type { ValidatorCheck };

export type TaskType =
  | "concept"
  | "guided"
  | "practice"
  | "challenge"
  | "scenario"
  | "project";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Task {
  slug: string;
  title: string;
  type: TaskType;
  difficulty: Difficulty;
  description: string;
  requirements: string[];
  env: string;
  checks: ValidatorCheck[];
  hints: string[];
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

const linuxCreateProject: Task = {
  slug: "linux-create-project",
  title: "Create a Project Structure",
  type: "practice",
  difficulty: "beginner",
  description:
    "Create a project directory containing a src folder, a tests folder and a README.md. Figure out the commands yourself — the validator checks real environment state, not answers.",
  requirements: [
    "Directory ~/project exists",
    "Directory ~/project/src exists",
    "Directory ~/project/tests exists",
    "File ~/project/README.md exists",
  ],
  env: "ubuntu:24.04",
  hints: [
    "mkdir creates directories. Can it create more than one at a time?",
    "Directories and files both start from ~/project. Create the parent first.",
    "touch creates an empty file. Then use ls -R ~/project to confirm.",
  ],
  checks: [
    { kind: "directory", path: "/home/learner/project", label: "~/project" },
    { kind: "directory", path: "/home/learner/project/src", label: "~/project/src" },
    { kind: "directory", path: "/home/learner/project/tests", label: "~/project/tests" },
    { kind: "file", path: "/home/learner/project/README.md", label: "~/project/README.md" },
  ],
};

const linuxInspectFiles: Task = {
  slug: "linux-inspect-files",
  title: "Find the Largest Log",
  type: "challenge",
  difficulty: "beginner",
  description:
    "Something is writing huge log files to /var/log/app. Inspect the filesystem, find the largest .log file in that directory and create a file ~/report/largest.txt containing its name.",
  requirements: [
    "Directory ~/report exists",
    "File ~/report/largest.txt exists and names the largest log file",
  ],
  env: "ubuntu:24.04",
  hints: [
    "ls -lhS sorts by size. Which file is on top?",
    "You only need the file name, not its size.",
    "echo 'name' > ~/report/largest.txt writes the name into the file.",
  ],
  checks: [
    { kind: "directory", path: "/home/learner/report", label: "~/report" },
    { kind: "file", path: "/home/learner/report/largest.txt", label: "~/report/largest.txt" },
    { kind: "filecontains", path: "/home/learner/report/largest.txt", value: "app-2026-09-26.log", label: "largest.txt names the largest log" },
  ],
};

const gitFirstCommit: Task = {
  slug: "git-first-commit",
  title: "Your First Commit",
  type: "guided",
  difficulty: "beginner",
  description:
    "Initialize a Git repository in ~/project, stage every file and create the initial commit with the message 'init'. Then confirm the history with git log.",
  requirements: ["~/project is a Git repository", "One commit with message 'init' exists"],
  env: "ubuntu:24.04 + git",
  hints: [
    "git init turns a directory into a repository.",
    "git add . stages everything in the working tree.",
    "git commit -m 'init' records the staged snapshot.",
  ],
  checks: [
    { kind: "gitrepo", path: "/home/learner/project", label: "~/project is a Git repository" },
    { kind: "gitcommit", path: "/home/learner/project", value: "init", label: "commit 'init' exists" },
  ],
};

const dockerChallenge: Task = {
  slug: "docker-run-app",
  title: "Deploy the Application as a Container",
  type: "challenge",
  difficulty: "intermediate",
  description:
    "A simple HTTP application image (app:latest) is already pulled on this machine. Deploy it as a container so it is reachable on port 8080. The validator inspects container state and port mappings — not your commands.",
  requirements: [
    "A container built from app:latest is running",
    "Port 8080 is exposed and mapped",
    "The application answers with HTTP 200",
  ],
  env: "docker:24",
  hints: [
    "docker ps -a shows containers in every state — what does yours say?",
    "If the container exits immediately, inspect the logs: docker logs <id>.",
    "docker run -d -p 8080:80 app:latest publishes the container on the host.",
  ],
  checks: [
    { kind: "container", path: "app:latest", label: "container from app:latest running" },
    { kind: "port", port: 8080, label: "port 8080 mapped" },
  ],
};

const k8sPods: Task = {
  slug: "k8s-first-pod",
  title: "Run Your First Pod",
  type: "guided",
  difficulty: "beginner",
  description:
    "Create a Pod named web running nginx:1.27 in the default namespace and confirm it reaches the Running state.",
  requirements: ["Pod web exists", "Pod web is Running"],
  env: "kubernetes 1.30 (kind)",
  hints: [
    "kubectl run web --image=nginx:1.27 is the fastest path.",
    "kubectl get pods shows the current state.",
    "If it is stuck in ContainerCreating, check kubectl describe pod web.",
  ],
  checks: [],
};

const linuxIntro: Topic = {
  slug: "01-introduction",
  title: "Introduction",
  summary: "The shell, the filesystem and why Linux runs the world's infrastructure.",
  tasks: [linuxCreateProject, linuxInspectFiles],
};

const linuxFs: Topic = {
  slug: "02-filesystems",
  title: "Filesystems & Permissions",
  summary: "Everything is a file: paths, modes, owners and the tools that inspect them.",
  tasks: [linuxInspectFiles],
};

const gitBasics: Topic = {
  slug: "01-basics",
  title: "Git Basics",
  summary: "Repositories, staging, commits and reading history.",
  tasks: [gitFirstCommit],
};

const dockerBasics: Topic = {
  slug: "01-basics",
  title: "Containers & Images",
  summary: "Images, layers, running containers and inspecting what they do.",
  tasks: [dockerChallenge],
};

const k8sFundamentals: Topic = {
  slug: "01-fundamentals",
  title: "Fundamentals",
  summary: "What Kubernetes is and how Pods, the smallest deployable units, work.",
  tasks: [k8sPods],
};

const devopsPath: LearningPath = {
  slug: "devops-engineer",
  title: "DevOps Engineer",
  role: "PATH 01",
  tagline:
    "From the Linux shell to production Kubernetes — the full infrastructure toolchain, learned by operating it.",
  skills: [
    {
      slug: "linux",
      title: "Linux",
      summary: "The foundation everything else runs on.",
      topics: [linuxIntro, linuxFs],
    },
    {
      slug: "networking",
      title: "Networking",
      summary: "IPs, ports, DNS and the paths packets actually take.",
      topics: [],
    },
    {
      slug: "git",
      title: "Git",
      summary: "Version control as a way of working, not a memorized command list.",
      topics: [gitBasics],
    },
    {
      slug: "docker",
      title: "Docker",
      summary: "Build, run, inspect and debug containers.",
      topics: [dockerBasics],
    },
    {
      slug: "cicd",
      title: "CI/CD",
      summary: "Pipelines that test, build and ship on every change.",
      topics: [],
    },
    {
      slug: "kubernetes",
      title: "Kubernetes",
      summary: "Pods, deployments, services and debugging workloads in cluster.",
      topics: [k8sFundamentals],
    },
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

export const taskTypeLabel: Record<TaskType, string> = {
  concept: "Concept",
  guided: "Guided Task",
  practice: "Practice Task",
  challenge: "Challenge",
  scenario: "Scenario",
  project: "Project",
};
