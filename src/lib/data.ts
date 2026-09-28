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
  checks: ValidatorCheck[];
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

const linuxCreateProject: Task = {
  slug: "linux-create-project",
  title: "Create a Project Structure",
  type: "practice",
  difficulty: "beginner",
  description:
    "Create a project directory containing a src folder, a tests folder and a README.md. Follow the walkthrough below — every command is explained, and the validator checks what you actually built.",
  requirements: [
    "Directory ~/project exists",
    "Directory ~/project/src exists",
    "Directory ~/project/tests exists",
    "File ~/project/README.md exists",
  ],
  env: "ubuntu:24.04",
  steps: [
    {
      title: "Check where you are",
      detail:
        "pwd prints your working directory. You should be in /home/learner — the ~ character is shell shorthand for your home directory, so ~/project means /home/learner/project.",
      command: "pwd",
    },
    {
      title: "Create the project directory",
      detail:
        "mkdir makes a new directory. With no arguments it operates relative to where you are, but giving the full ~/project path works from anywhere.",
      command: "mkdir ~/project",
    },
    {
      title: "Create the src and tests folders",
      detail:
        "mkdir accepts several arguments at once, so one command creates both folders. This is why we made the parent first — mkdir does not create missing parents by default.",
      command: "mkdir ~/project/src ~/project/tests",
    },
    {
      title: "Create the README file",
      detail:
        "touch creates an empty file (or updates its timestamp if the file already exists). It creates the file but leaves it empty.",
      command: "touch ~/project/README.md",
    },
    {
      title: "Verify the structure",
      detail:
        "ls lists directory contents; -R makes it recursive, printing every subfolder. You should see project/ containing src/, tests/ and README.md.",
      command: "ls -R ~",
    },
    {
      title: "Submit for validation",
      detail:
        "The validator re-checks the real state of the environment: the three directories and the README file. If everything exists, you pass.",
      command: "",
    },
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
    "Something is writing huge log files to /var/log/app. Inspect the filesystem, find the largest .log file in that directory and record it in ~/report/largest.txt. The walkthrough shows every command.",
  requirements: [
    "Directory ~/report exists",
    "File ~/report/largest.txt exists and names the largest log file",
  ],
  env: "ubuntu:24.04",
  steps: [
    {
      title: "Inspect the log directory",
      detail:
        "cd changes your current directory. /var/log/app is where the application writes its logs — you cannot create the report until you know which file is the problem.",
      command: "cd /var/log/app",
    },
    {
      title: "List files sorted by size",
      detail:
        "ls with three useful flags: -l long format, -h human-readable sizes (K/M/G instead of raw bytes), and -S sort largest first. The biggest file is on top.",
      command: "ls -lhS",
    },
    {
      title: "Go back home and create the report folder",
      detail:
        "cd with no arguments returns to your home directory. Then create the folder the report will live in.",
      command: "cd ~",
    },
    {
      title: "Create the report directory",
      detail: "mkdir ~/report creates the directory in your home folder.",
      command: "mkdir ~/report",
    },
    {
      title: "Write the largest log file's name into the report",
      detail:
        "echo prints text; the > redirect writes that text into a file, creating it if needed (and overwriting if it exists). The largest file from step 2 was app-2026-09-26.log.",
      command: "echo app-2026-09-26.log > ~/report/largest.txt",
    },
    {
      title: "Verify the report contents",
      detail:
        "cat prints a file's contents. If it shows app-2026-09-26.log, you're done.",
      command: "cat ~/report/largest.txt",
    },
    {
      title: "Submit for validation",
      detail:
        "The validator checks that ~/report exists, that largest.txt exists, and that its content names the correct file.",
      command: "",
    },
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
    "Initialize a Git repository in ~/project, stage every file and create the initial commit with the message 'init'. Every command is explained in the walkthrough.",
  requirements: ["~/project is a Git repository", "One commit with message 'init' exists"],
  env: "ubuntu:24.04 + git",
  steps: [
    {
      title: "Create and enter the project folder",
      detail:
        "If you already created ~/project in the previous task, just run the cd. mkdir is safe to re-run: it will simply report the directory exists.",
      command: "cd ~/project",
    },
    {
      title: "Initialize the repository",
      detail:
        "git init turns the current directory into a Git repository by creating a hidden .git folder. Run this inside ~/project, not your home directory.",
      command: "git init",
    },
    {
      title: "Add a file to commit",
      detail:
        "An empty repository has nothing to commit. Create a README so the first commit has content.",
      command: "touch README.md",
    },
    {
      title: "Stage everything",
      detail:
        "git add . stages every new or changed file in the current directory. Staging is Git's staging area: you pick what goes into the next commit.",
      command: "git add .",
    },
    {
      title: "Check the status",
      detail:
        "git status shows the branch you're on and what's staged. README.md should be listed as a change to be committed.",
      command: "git status",
    },
    {
      title: "Create the commit",
      detail:
        "git commit records the staged snapshot permanently. The -m flag supplies the message inline — 'init' is the convention for a first commit.",
      command: "git commit -m \"init\"",
    },
    {
      title: "Verify the history",
      detail:
        "git log lists the commit history newest first. You should see one commit with the message 'init'.",
      command: "git log",
    },
    {
      title: "Submit for validation",
      detail:
        "The validator checks that ~/project is a Git repository and that a commit with the message 'init' exists in it.",
      command: "",
    },
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
    "A simple HTTP application image (app:latest) is already pulled on this machine. Deploy it as a container so it is reachable on port 8080. The walkthrough shows the exact commands and what every flag does.",
  requirements: [
    "A container built from app:latest is running",
    "Port 8080 is exposed and mapped",
    "The application answers with HTTP 200",
  ],
  env: "docker:24",
  steps: [
    {
      title: "Confirm the image is available",
      detail:
        "docker images lists every image stored locally. You should see app with the tag latest — that's the application you need to deploy.",
      command: "docker images",
    },
    {
      title: "Run the container",
      detail:
        "docker run starts a container from an image. -d runs it detached (in the background) and prints the container ID. -p 8080:80 publishes ports: host 8080 forwards to the container's port 80, where the app listens. The order is host:container.",
      command: "docker run -d -p 8080:80 app:latest",
    },
    {
      title: "Verify the container is running",
      detail:
        "docker ps lists running containers. Check STATUS is Up and PORTS shows 0.0.0.0:8080->80/tcp. If your container is missing, run docker ps -a — it lists stopped ones too, which usually means the app crashed on start.",
      command: "docker ps",
    },
    {
      title: "Inspect the application logs",
      detail:
        "docker logs prints everything the process wrote to stdout — with no argument it uses the latest container (in a real shell you pass the container ID). You should see 'listening on 0.0.0.0:80'. If a container exits immediately, this is the first place to look — the log tells you why it crashed.",
      command: "docker logs",
    },
    {
      title: "Submit for validation",
      detail:
        "The validator inspects container state and port mappings: a running container from app:latest with port 8080 mapped.",
      command: "",
    },
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
    "Create a Pod named web running nginx:1.27 in the default namespace and confirm it reaches the Running state. These commands need the full Kubernetes lab runtime — the browser preview terminal does not include kubectl.",
  requirements: ["Pod web exists", "Pod web is Running"],
  env: "kubernetes 1.30 (kind)",
  steps: [
    {
      title: "Create the Pod",
      detail:
        "kubectl run creates a single Pod imperatively. --image specifies the container image. This is the fastest way to get a Pod running; in real projects you will usually write YAML manifests instead.",
      command: "kubectl run web --image=nginx:1.27",
    },
    {
      title: "Watch the Pod status",
      detail:
        "kubectl get pods lists Pods in the current namespace. Freshly created Pods sit in ContainerCreating while the image is pulled, then flip to Running. Re-run the command until STATUS shows Running.",
      command: "kubectl get pods",
    },
    {
      title: "Inspect the Pod in detail",
      detail:
        "kubectl describe prints the full picture of one object: events, container statuses, restarts. If the Pod is stuck in ContainerCreating or CrashLoopBackOff, the events at the bottom tell you why.",
      command: "kubectl describe pod web",
    },
    {
      title: "Submit for validation",
      detail:
        "The validator checks that Pod web exists in the default namespace and has reached the Running state. Requires the full lab runtime.",
      command: "",
    },
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
