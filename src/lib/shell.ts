// Virtual lab shell: a small in-browser Linux-ish environment the terminal and
// the validator both operate on. State is real enough that validators pass or
// fail on what the learner actually did.

export type FsNode =
  | { type: "dir"; children: Map<string, FsNode> }
  | { type: "file"; content: string; size: number };

export interface Container {
  id: string;
  image: string;
  running: boolean;
  ports: { host: number; ctr: number }[];
  logs: string;
}

export interface ValidatorCheck {
  kind:
    | "file"
    | "directory"
    | "container"
    | "port"
    | "gitrepo"
    | "gitcommit"
    | "filecontains";
  path?: string;
  port?: number;
  value?: string;
  label: string;
}

export interface CheckResult {
  label: string;
  pass: boolean;
  detail: string;
}

type DirNode = Extract<FsNode, { type: "dir" }>;

function dir(): DirNode {
  return { type: "dir", children: new Map() };
}

function file(content = "", size?: number): FsNode {
  return { type: "file", content, size: size ?? content.length };
}

function seed(): FsNode {
  const root = dir();
  const mk = (path: string[], node: FsNode) => {
    let cur = root as Extract<FsNode, { type: "dir" }>;
    for (const part of path.slice(0, -1)) {
      let next = cur.children.get(part);
      if (!next || next.type !== "dir") {
        next = dir();
        cur.children.set(part, next);
      }
      cur = next;
    }
    cur.children.set(path[path.length - 1], node);
  };
  mk(["home", "learner"], dir());
  mk(["home", "learner", ".bashrc"], file("# ~/.bashrc\nexport PS1='learner@lab'\n"));
  mk(["etc"], dir());
  mk(["etc", "hostname"], file("lab\n"));
  mk(["var", "log"], dir());
  mk(["var", "log", "syslog"], file("Sep 28 09:00:00 lab systemd[1]: Started.\n", 1024));
  mk(["var", "log", "kern.log"], file("Sep 28 09:00:01 lab kernel: boot ok\n", 2048));
  mk(["var", "log", "app"], dir());
  mk(["var", "log", "app", "app-2026-09-26.log"], file("... 2.3 GB of application output ...\n", 2_469_609_472));
  mk(["var", "log", "app", "app-2026-09-27.log"], file("... 412 MB of application output ...\n", 432_013_312));
  mk(["var", "log", "app", "debug.log"], file("debug level tracing\n", 12_582_912));
  return root;
}

const HOME = ["home", "learner"];

function humanSize(bytes: number): string {
  if (bytes >= 1 << 30) return `${(bytes / (1 << 30)).toFixed(1)}G`;
  if (bytes >= 1 << 20) return `${(bytes / (1 << 20)).toFixed(1)}M`;
  if (bytes >= 1 << 10) return `${(bytes / (1 << 10)).toFixed(1)}K`;
  return `${bytes}`;
}

export class LabShell {
  root = seed();
  cwd: string[] = [...HOME];
  containers: Container[] = [];
  gitRepos = new Set<string>(); // absolute paths
  staged = new Set<string>();
  commits: { repo: string; message: string }[] = [];
  history: string[] = [];

  private abs(components: string[]): string {
    return "/" + components.join("/");
  }

  resolve(arg: string): string[] | null {
    let base: string[];
    if (arg === "~" || arg.startsWith("~/")) {
      base = [...HOME];
      arg = arg.slice(1).replace(/^\//, "");
    } else if (arg.startsWith("/")) {
      base = [];
      arg = arg.slice(1);
    } else {
      base = [...this.cwd];
    }
    const out = [...base];
    for (const part of arg.split("/").filter(Boolean)) {
      if (part === ".") continue;
      if (part === "..") {
        out.pop();
        continue;
      }
      out.push(part);
    }
    return out;
  }

  nodeAt(components: string[]): FsNode | null {
    let cur: FsNode = this.root;
    for (const part of components) {
      if (cur.type !== "dir") return null;
      const next = cur.children.get(part);
      if (!next) return null;
      cur = next;
    }
    return cur;
  }

  private mkdirp(components: string[]): void {
    let cur = this.root as Extract<FsNode, { type: "dir" }>;
    for (const part of components) {
      let next = cur.children.get(part);
      if (!next || next.type !== "dir") {
        next = dir();
        cur.children.set(part, next);
      }
      cur = next;
    }
  }

  private parentAndName(components: string[]): { parent: Extract<FsNode, { type: "dir" }>; name: string } | null {
    const parent = this.nodeAt(components.slice(0, -1));
    if (!parent || parent.type !== "dir" || components.length === 0) return null;
    return { parent, name: components[components.length - 1] };
  }

  run(line: string): string[] {
    const trimmed = line.trim();
    if (!trimmed) return [];
    this.history.push(trimmed);
    const [cmd, ...args] = trimmed.split(/\s+/);
    switch (cmd) {
      case "help":
        return [
          "Built-in commands:",
          "  ls [-lRhS] [path]   list directory contents",
          "  cd <path>           change directory",
          "  pwd                 print working directory",
          "  mkdir <dir>...      create directories",
          "  touch <file>...     create empty files",
          "  echo <text> [> f]   print text / write to file",
          "  cat <file>          print file contents",
          "  rm [-r] <path>      remove files or directories",
          "  docker <cmd>        container runtime (run, ps, logs, images)",
          "  git <cmd>           version control (init, add, commit, log, status)",
          "  clear               clear the terminal",
        ];
      case "pwd":
        return [this.abs(this.cwd) || "/"];
      case "whoami":
        return ["learner"];
      case "uname":
        return ["Linux lab 6.8.0-generic # Ubuntu 24.04 x86_64 GNU/Linux"];
      case "clear":
        return ["__CLEAR__"];
      case "cd": {
        const target = args[0] ? this.resolve(args[0]) : [...HOME];
        if (!target) return [`cd: ${args[0]}: No such file or directory`];
        const node = this.nodeAt(target);
        if (!node) return [`cd: ${args.join(" ")}: No such file or directory`];
        if (node.type !== "dir") return [`cd: ${args.join(" ")}: Not a directory`];
        this.cwd = target;
        return [];
      }
      case "ls": {
        const flags = args.filter((a) => a.startsWith("-"));
        const target = args.find((a) => !a.startsWith("-")) ?? ".";
        const comps = this.resolve(target);
        if (!comps) return [`ls: cannot access '${target}': No such file or directory`];
        const node = this.nodeAt(comps);
        if (!node) return [`ls: cannot access '${target}': No such file or directory`];
        const long = flags.some((f) => f.includes("l"));
        const recursive = flags.some((f) => f.includes("R"));
        const bySize = flags.some((f) => f.includes("S"));
        const out: string[] = [];

        const listOne = (path: string[], n: FsNode) => {
          if (n.type === "file") {
            out.push(long ? `-rw-r--r-- 1 learner learner ${humanSize(n.size)} ${path[path.length - 1]}` : path[path.length - 1]);
            return;
          }
          const entries = [...n.children.entries()];
          if (bySize) {
            entries.sort((a, b) => {
              const sa = a[1].type === "file" ? a[1].size : 0;
              const sb = b[1].type === "file" ? b[1].size : 0;
              return sb - sa;
            });
          } else {
            entries.sort((a, b) => a[0].localeCompare(b[0]));
          }
          if (long) out.push(`total ${entries.length}`);
          for (const [name, child] of entries) {
            const label = child.type === "dir" ? `${name}/` : name;
            if (long) {
              const size = child.type === "file" ? humanSize(child.size) : "-";
              out.push(`drwxr-xr-x 2 learner learner ${size.padStart(6)} ${label}`);
            } else {
              out.push(label);
            }
          }
          if (recursive) {
            for (const [name, child] of entries) {
              if (child.type === "dir") {
                out.push("");
                out.push(`${this.abs([...path, name])}:`);
                listOne([...path, name], child);
              }
            }
          }
        };
        listOne(comps, node);
        return out;
      }
      case "mkdir": {
        const targets = args.filter((a) => !a.startsWith("-"));
        if (!targets.length) return ["mkdir: missing operand"];
        return targets.flatMap((t) => {
          const comps = this.resolve(t);
          if (!comps || comps.length === 0) return [`mkdir: invalid path '${t}'`];
          const existing = this.nodeAt(comps);
          if (existing) return [`mkdir: cannot create directory '${t}': File exists`];
          this.mkdirp(comps);
          return [];
        });
      }
      case "touch": {
        if (!args.length) return ["touch: missing file operand"];
        return args.flatMap((t) => {
          const comps = this.resolve(t);
          const loc = comps && this.parentAndName(comps);
          if (!loc) return [`touch: cannot touch '${t}': No such file or directory`];
          const existing = loc.parent.children.get(loc.name);
          if (!existing) loc.parent.children.set(loc.name, file(""));
          return [];
        });
      }
      case "echo": {
        const gt = args.findIndex((a) => a === ">" || a === ">>");
        const text = (gt === -1 ? args : args.slice(0, gt)).join(" ").replace(/^["']|["']$/g, "");
        if (gt === -1) return [text];
        const target = args[gt + 1];
        const comps = this.resolve(target);
        const loc = comps && this.parentAndName(comps);
        if (!loc) return [`bash: ${target}: No such file or directory`];
        if (comps) this.mkdirp(comps.slice(0, -1));
        const existing = loc.parent.children.get(loc.name);
        const append = args[gt] === ">>" && existing?.type === "file";
        loc.parent.children.set(
          loc.name,
          file(append ? existing.content + text + "\n" : text + "\n"),
        );
        return [];
      }
      case "cat": {
        if (!args.length) return ["cat: missing file operand"];
        return args.flatMap((t) => {
          const node = this.resolve(t) && this.nodeAt(this.resolve(t)!);
          if (!node) return [`cat: ${t}: No such file or directory`];
          if (node.type !== "file") return [`cat: ${t}: Is a directory`];
          return node.content.replace(/\n$/, "").split("\n");
        });
      }
      case "rm": {
        const targets = args.filter((a) => !a.startsWith("-"));
        const recursive = args.some((a) => a.includes("r"));
        if (!targets.length) return ["rm: missing operand"];
        return targets.flatMap((t) => {
          const comps = this.resolve(t);
          const loc = comps && this.parentAndName(comps);
          if (!loc || !loc.parent.children.has(loc.name)) return [`rm: cannot remove '${t}': No such file or directory`];
          const node = loc.parent.children.get(loc.name)!;
          if (node.type === "dir" && !recursive) return [`rm: cannot remove '${t}': Is a directory`];
          loc.parent.children.delete(loc.name);
          return [];
        });
      }
      case "docker":
        return this.docker(args);
      case "git":
        return this.git(args);
      case "exit":
        return ["logout"];
      default:
        return [`${cmd}: command not found`];
    }
  }

  private docker(args: string[]): string[] {
    const [sub, ...rest] = args;
    if (!sub) return ["docker: 'docker' requires a command (try 'docker ps')"];
    if (sub === "images") {
      return [
        "REPOSITORY   TAG      IMAGE ID       SIZE",
        "app          latest   a1b2c3d4e5f6   24.1MB",
      ];
    }
    if (sub === "ps") {
      const all = rest.some((a) => a.includes("a"));
      const rows = this.containers
        .filter((c) => c.running || all)
        .map(
          (c) =>
            `${c.id}   ${c.image}   ${c.running ? "Up" : "Exited"}   ${c.ports.map((p) => `0.0.0.0:${p.host}->${p.ctr}/tcp`).join(", ") || "-"}`,
        );
      return [
        "CONTAINER ID   IMAGE       STATUS   PORTS",
        ...(rows.length ? rows : all ? ["(none)"] : []),
      ];
    }
    if (sub === "run") {
      const detach = rest.includes("-d");
      const positional: string[] = [];
      const ports: { host: number; ctr: number }[] = [];
      for (let i = 0; i < rest.length; i++) {
        if (rest[i] === "-p" || rest[i] === "--publish") {
          const [host, ctr] = (rest[i + 1] ?? "").split(":").map(Number);
          if (!Number.isNaN(host) && !Number.isNaN(ctr)) ports.push({ host, ctr });
          i++;
        } else if (rest[i] === "--name" || rest[i] === "-d") {
          if (rest[i] === "--name") i++;
        } else {
          positional.push(rest[i]);
        }
      }
      const image = positional[0];
      if (!image) return ["docker: image not specified"];
      if (image !== "app:latest" && image !== "app") {
        return [`Unable to find image '${image}' locally`, `docker: Error response from daemon: pull access denied for ${image}`];
      }
      const id = Math.random().toString(16).slice(2, 12);
      this.containers.push({
        id,
        image: "app:latest",
        running: true,
        ports,
        logs: "listening on 0.0.0.0:80",
      });
      if (detach) return [id];
      return [id, "listening on 0.0.0.0:80"];
    }
    if (sub === "logs") {
      const c = this.containers.find((x) => x.id.startsWith(rest[0] ?? "@"));
      if (!c) return [`Error: No such container: ${rest[0]}`];
      return [c.logs];
    }
    return [`docker: '${sub}' is not a docker command (try run, ps, logs, images)`];
  }

  private git(args: string[]): string[] {
    const [sub, ...rest] = args;
    const cwdAbs = this.abs(this.cwd);
    if (sub === "init") {
      this.gitRepos.add(cwdAbs);
      return [`Initialized empty Git repository in ${cwdAbs}/.git/`];
    }
    if (sub === "status") {
      if (!this.gitRepos.has(cwdAbs) && ![...this.gitRepos].some((r) => cwdAbs.startsWith(r + "/"))) {
        return ["fatal: not a git repository (or any of the parent directories): .git"];
      }
      return [
        "On branch main",
        this.staged.has(cwdAbs) ? "Changes to be committed:" : "nothing to commit, working tree clean",
      ];
    }
    if (sub === "add") {
      if (!this.gitRepos.has(cwdAbs) && ![...this.gitRepos].some((r) => cwdAbs.startsWith(r + "/"))) {
        return ["fatal: not a git repository (or any of the parent directories): .git"];
      }
      this.staged.add(cwdAbs);
      return [];
    }
    if (sub === "commit") {
      const mIdx = rest.findIndex((a) => a === "-m");
      const message = mIdx !== -1 ? rest[mIdx + 1]?.replace(/^["']|["']$/g, "") : "";
      if (!this.gitRepos.has(cwdAbs)) return ["fatal: not a git repository (or any of the parent directories): .git"];
      if (!this.staged.has(cwdAbs)) return ["nothing to commit (use \"git add\" to stage)"];
      if (!message) return ["Aborting commit due to empty commit message."];
      this.commits.push({ repo: cwdAbs, message });
      this.staged.delete(cwdAbs);
      return [`[main ${Math.random().toString(16).slice(2, 9)}] ${message}`];
    }
    if (sub === "log") {
      const repo = this.gitRepos.has(cwdAbs) ? cwdAbs : [...this.gitRepos].find((r) => cwdAbs.startsWith(r + "/"));
      const mine = this.commits.filter((c) => c.repo === repo);
      if (!mine.length) return ["fatal: your current branch 'main' does not have any commits yet"];
      return mine.flatMap((c) => [
        `commit ${Math.random().toString(16).slice(2, 42)}`,
        `Author: learner <learner@lab>`,
        "",
        `    ${c.message}`,
        "",
      ]);
    }
    return [`git: '${sub}' is not a git command (try init, add, commit, log, status)`];
  }

  validate(checks: ValidatorCheck[]): CheckResult[] {
    return checks.map((check) => {
      switch (check.kind) {
        case "file":
        case "filecontains": {
          const comps = check.path ? this.resolve(check.path) : null;
          const node = comps && this.nodeAt(comps);
          if (!node || node.type !== "file") {
            return { label: check.label, pass: false, detail: "file not found" };
          }
          if (check.kind === "filecontains" && check.value && !node.content.includes(check.value)) {
            return { label: check.label, pass: false, detail: `expected '${check.value}' in content` };
          }
          return { label: check.label, pass: true, detail: "ok" };
        }
        case "directory": {
          const comps = check.path ? this.resolve(check.path) : null;
          const node = comps && this.nodeAt(comps);
          return {
            label: check.label,
            pass: !!node && node.type === "dir",
            detail: node ? (node.type === "dir" ? "ok" : "not a directory") : "not found",
          };
        }
        case "container": {
          const c = this.containers.find((x) => x.image === check.path && x.running);
          return { label: check.label, pass: !!c, detail: c ? "ok" : "no running container from this image" };
        }
        case "port": {
          const c = this.containers.find(
            (x) => x.running && x.ports.some((p) => p.host === check.port || p.ctr === check.port),
          );
          return { label: check.label, pass: !!c, detail: c ? "ok" : "no running container maps this port" };
        }
        case "gitrepo": {
          const ok = this.gitRepos.has(check.path ?? "");
          return { label: check.label, pass: ok, detail: ok ? "ok" : "no repository initialized here" };
        }
        case "gitcommit": {
          const ok = this.commits.some((c) => c.repo === check.path && c.message === check.value);
          return { label: check.label, pass: ok, detail: ok ? "ok" : `no commit '${check.value}' found` };
        }
        default:
          return { label: check.label, pass: false, detail: "unsupported check" };
      }
    });
  }
}
