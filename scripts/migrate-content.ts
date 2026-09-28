/**
 * One-off migration: TS content modules -> content/ YAML + Markdown.
 * Run with: pnpm tsx scripts/migrate-content.ts
 */
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { stringify } from "yaml";
import { paths } from "../src/lib/data";
import type { Task, LearningPath } from "../src/lib/data";

const ROOT = join(__dirname, "..", "content");
if (existsSync(ROOT)) rmSync(ROOT, { recursive: true });
mkdirSync(join(ROOT, "validators"), { recursive: true });

// ---------- validator registry ----------

interface RegistryEntry {
  id: string;
  kind: string;
  description: string;
  params: string[];
  fields: Record<string, string>;
}

const registry: RegistryEntry[] = [
  { id: "file_exists", kind: "file", description: "A file exists at the given path.", params: ["path"], fields: { path: "{{path}}" } },
  { id: "file_contains", kind: "filecontains", description: "A file exists and contains the expected content.", params: ["path", "value"], fields: { path: "{{path}}", value: "{{value}}" } },
  { id: "directory_exists", kind: "directory", description: "A directory exists at the given path.", params: ["path"], fields: { path: "{{path}}" } },
  { id: "file_mode", kind: "filemode", description: "A file has the expected octal permission mode.", params: ["path", "mode"], fields: { path: "{{path}}", value: "{{mode}}" } },
  { id: "container_running", kind: "container", description: "A container built from the image is running.", params: ["image"], fields: { path: "{{image}}" } },
  { id: "port_mapped", kind: "port", description: "A running container maps the given host port.", params: ["port"], fields: { port: "{{port}}" } },
  { id: "http_status", kind: "http", description: "Something serves HTTP on the given port (expected 200).", params: ["port"], fields: { port: "{{port}}" } },
  { id: "no_container_running", kind: "nocontainer", description: "No container from the image is running.", params: ["image"], fields: { path: "{{image}}" } },
  { id: "image_removed", kind: "noimage", description: "The image no longer exists locally.", params: ["image"], fields: { path: "{{image}}" } },
  { id: "git_repo", kind: "gitrepo", description: "A git repository is initialized at the path.", params: ["path"], fields: { path: "{{path}}" } },
  { id: "git_commit", kind: "gitcommit", description: "A commit with the given message exists in the repository.", params: ["path", "message"], fields: { path: "{{path}}", value: "{{message}}" } },
  { id: "git_branch", kind: "gitbranch", description: "The branch exists (and was merged, for merge tasks).", params: ["path", "branch"], fields: { path: "{{path}}", value: "{{branch}}" } },
  { id: "git_remote", kind: "gitremote", description: "A remote with the given URL is configured.", params: ["path", "url"], fields: { path: "{{path}}", value: "{{url}}" } },
  { id: "k8s_pod_running", kind: "k8spod", description: "The pod exists in the namespace and is Running.", params: ["namespace", "name"], fields: { path: "{{namespace}}/{{name}}" } },
  { id: "k8s_deployment_replicas", kind: "k8sdeployment", description: "The deployment exists with the expected replica count.", params: ["namespace", "name", "replicas"], fields: { value: "{{namespace}}/{{name}}:{{replicas}}" } },
  { id: "k8s_service_exists", kind: "k8sservice", description: "The service exists in the namespace.", params: ["namespace", "name"], fields: { path: "{{namespace}}/{{name}}" } },
  { id: "terraform_initialized", kind: "tfinit", description: "terraform init has been run in the directory.", params: ["path"], fields: { path: "{{path}}" } },
  { id: "terraform_resource_in_state", kind: "tfresource", description: "The resource exists in the terraform state of the directory.", params: ["path", "resource"], fields: { path: "{{path}}", value: "{{resource}}" } },
  { id: "terraform_state_empty", kind: "tfempty", description: "The terraform state of the directory holds no resources.", params: ["path"], fields: { path: "{{path}}" } },
  { id: "aws_s3_bucket_exists", kind: "awss3", description: "The S3 bucket exists.", params: ["bucket"], fields: { value: "{{bucket}}" } },
  { id: "aws_s3_object_exists", kind: "awss3object", description: "The object exists in the S3 bucket.", params: ["bucket", "key"], fields: { value: "{{bucket}}/{{key}}" } },
  { id: "aws_ec2_instance_running", kind: "awsec2", description: "An EC2 instance from the image is running.", params: ["image"], fields: { value: "{{image}}" } },
];

writeFileSync(
  join(ROOT, "validators", "registry.yaml"),
  stringify({ version: 1, validators: registry }, { lineWidth: 100 }),
);

// ---------- check -> (validator id, params) ----------

function checkToValidation(check: Task["checks"][number]): Record<string, unknown> {
  const k = check.kind;
  switch (k) {
    case "file": return { validator: "file_exists", path: check.path, label: check.label };
    case "filecontains": return { validator: "file_contains", path: check.path, value: check.value, label: check.label };
    case "directory": return { validator: "directory_exists", path: check.path, label: check.label };
    case "filemode": return { validator: "file_mode", path: check.path, mode: check.value, label: check.label };
    case "container": return { validator: "container_running", image: check.path, label: check.label };
    case "port": return { validator: "port_mapped", port: check.port, label: check.label };
    case "http": return { validator: "http_status", port: check.port, label: check.label };
    case "nocontainer": return { validator: "no_container_running", image: check.path, label: check.label };
    case "noimage": return { validator: "image_removed", image: check.path, label: check.label };
    case "gitrepo": return { validator: "git_repo", path: check.path, label: check.label };
    case "gitcommit": return { validator: "git_commit", path: check.path, message: check.value, label: check.label };
    case "gitbranch": return { validator: "git_branch", path: check.path, branch: check.value, label: check.label };
    case "gitremote": return { validator: "git_remote", path: check.path, url: check.value, label: check.label };
    case "k8spod": {
      const [namespace, name] = (check.path ?? "/").split("/");
      return { validator: "k8s_pod_running", namespace, name, label: check.label };
    }
    case "k8sdeployment": {
      const [nsName, replicas] = (check.value ?? ":").split(":");
      const [namespace, name] = nsName.split("/");
      return { validator: "k8s_deployment_replicas", namespace, name, replicas: Number(replicas), label: check.label };
    }
    case "k8sservice": {
      const [namespace, name] = (check.path ?? "/").split("/");
      return { validator: "k8s_service_exists", namespace, name, label: check.label };
    }
    case "tfinit": return { validator: "terraform_initialized", path: check.path, label: check.label };
    case "tfresource": return { validator: "terraform_resource_in_state", path: check.path, resource: check.value, label: check.label };
    case "tfempty": return { validator: "terraform_state_empty", path: check.path, label: check.label };
    case "awss3": return { validator: "aws_s3_bucket_exists", bucket: check.value, label: check.label };
    case "awss3object": {
      const [bucket, key] = (check.value ?? "/").split("/");
      return { validator: "aws_s3_object_exists", bucket, key, label: check.label };
    }
    case "awsec2": return { validator: "aws_ec2_instance_running", image: check.value, label: check.label };
    default: throw new Error(`unknown check kind: ${k}`);
  }
}

// ---------- emit content tree ----------

function taskYaml(task: Task): object {
  return {
    slug: task.slug,
    title: task.title,
    type: task.type,
    difficulty: task.difficulty,
    description: task.description,
    requirements: task.requirements,
    environment: task.env,
    validation: task.checks.map(checkToValidation),
    steps: task.steps.map((s) => ({
      title: s.title,
      detail: s.detail,
      ...(s.command ? { command: s.command } : {}),
    })),
  };
}

function lessonMarkdown(topic: { title: string; summary: string }, tasks: Task[]): string {
  const example = tasks.flatMap((t) => t.steps.map((s) => s.command)).find(Boolean);
  const lines: string[] = [
    "## What you'll practice",
    "",
    ...tasks.map((t) => `- **${t.title}** — ${t.type} · ${t.difficulty}`),
  ];
  if (example) {
    lines.push(
      "",
      "## A command you'll meet",
      "",
      "```bash",
      example,
      "```",
    );
  }
  lines.push(
    "",
    "Open any task below to get the full step-by-step walkthrough — every command is explained, and the lab validator checks what you actually built.",
  );
  return lines.join("\n") + "\n";
}

const emittedTasks = new Set<string>();

function emitPath(path: LearningPath) {
  const pathDir = join(ROOT, path.slug);
  mkdirSync(pathDir, { recursive: true });
  writeFileSync(
    join(pathDir, "path.yaml"),
    stringify(
      { slug: path.slug, title: path.title, role: path.role, tagline: path.tagline, order: paths.indexOf(path) + 1 },
      { lineWidth: 100 },
    ),
  );
  for (const skill of path.skills) {
    const skillDir = join(ROOT, path.slug, skill.slug);
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(
      join(skillDir, "skill.yaml"),
      stringify(
        {
          slug: skill.slug,
          title: skill.title,
          summary: skill.summary,
          path: path.slug,
          order: path.skills.indexOf(skill) + 1,
        },
        { lineWidth: 100 },
      ),
    );
    let topicOrder = 0;
    for (const topic of skill.topics) {
      topicOrder += 1;
      const topicDir = join(skillDir, topic.slug);
      mkdirSync(topicDir, { recursive: true });
      writeFileSync(join(topicDir, "lesson.md"), lessonMarkdown(topic, topic.tasks));
      const taskSlugs: string[] = [];
      for (const task of topic.tasks) {
        taskSlugs.push(task.slug);
        if (emittedTasks.has(task.slug)) continue; // task exists once, referenced by many topics
        emittedTasks.add(task.slug);
        const taskDir = join(topicDir, "tasks", task.slug);
        mkdirSync(taskDir, { recursive: true });
        writeFileSync(join(taskDir, "task.yaml"), stringify(taskYaml(task), { lineWidth: 100 }));
      }
      writeFileSync(
        join(topicDir, "topic.yaml"),
        stringify(
          { slug: topic.slug, title: topic.title, summary: topic.summary, order: topicOrder, tasks: taskSlugs },
          { lineWidth: 100 },
        ),
      );
    }
  }
}

paths.forEach(emitPath);
console.log("content/ generated:", registry.length, "validators registered");
