// Virtual lab shell: a small in-browser Linux-ish environment the terminal and
// the validator both operate on. Covers filesystem + text tools, docker, git,
// kubectl (fake cluster), terraform (fake state), aws (sts/s3/ec2) and basic
// networking tools, so hands-on tasks can be validated without a backend.

export type FsNode =
  | { type: "dir"; children: Map<string, FsNode> }
  | { type: "file"; content: string; size: number; mode?: number };

export type DirNode = Extract<FsNode, { type: "dir" }>;

export interface Container {
  id: string;
  image: string;
  running: boolean;
  ports: { host: number; ctr: number }[];
  logs: string;
}

export interface K8sPod {
  ns: string;
  name: string;
  image: string;
  status: string;
  logs: string;
}

export interface K8sDeployment {
  ns: string;
  name: string;
  image: string;
  replicas: number;
}

export interface K8sService {
  ns: string;
  name: string;
  port: number;
  targetPort: number;
}

export interface Ec2Instance {
  id: string;
  image: string;
  state: string;
}

export interface ValidatorCheck {
  kind:
    | "file"
    | "directory"
    | "container"
    | "port"
    | "gitrepo"
    | "gitcommit"
    | "filecontains"
    | "filemode"
    | "http"
    | "gitbranch"
    | "gitremote"
    | "k8spod"
    | "k8sdeployment"
    | "k8sservice"
    | "tfinit"
    | "tfresource"
    | "tfempty"
    | "awss3"
    | "awsec2"
    | "nocontainer"
    | "noimage"
    | "awss3object";
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

function dir(): DirNode {
  return { type: "dir", children: new Map() };
}

function file(content = "", size?: number): FsNode {
  return { type: "file", content, size: size ?? content.length };
}

const APP_LOG_26 = [
  "2026-09-26 08:00:01 INFO  service started on 0.0.0.0:80",
  "2026-09-26 08:00:02 INFO  connected to database",
  "2026-09-26 08:14:33 WARN  slow query took 1.4s",
  "2026-09-26 09:22:10 ERROR request failed: upstream timeout",
  "2026-09-26 12:40:51 INFO  health check passed",
  "2026-09-26 18:03:09 ERROR disk usage above 90%",
  "2026-09-26 23:59:59 INFO  rotating log file",
].join("\n") + "\n";

const APP_LOG_27 = [
  "2026-09-27 00:00:01 INFO  service started on 0.0.0.0:80",
  "2026-09-27 00:03:18 ERROR connection refused: cache down",
  "2026-09-27 01:12:44 INFO  cache reconnected",
  "2026-09-27 04:41:02 ERROR failed to write metrics: timeout",
  "2026-09-27 06:25:37 WARN  retries exceeded for job sync",
  "2026-09-27 09:30:00 ERROR unhandled exception in worker",
  "2026-09-27 11:58:21 INFO  worker pool resized to 8",
  "2026-09-27 15:44:12 WARN  memory usage at 82%",
  "2026-09-27 21:07:55 INFO  daily summary written",
].join("\n") + "\n";

const ACCESS_LOG = [
  '10.0.0.5 - - [27/Sep/2026:10:00:01] "GET /api/items HTTP/1.1" 200 512',
  '10.0.0.5 - - [27/Sep/2026:10:00:04] "GET /api/items HTTP/1.1" 500 0',
  '10.0.0.7 - - [27/Sep/2026:10:00:09] "POST /api/orders HTTP/1.1" 201 128',
  '10.0.0.9 - - [27/Sep/2026:10:01:22] "GET /health HTTP/1.1" 200 2',
  '10.0.0.5 - - [27/Sep/2026:10:02:40] "GET /api/items HTTP/1.1" 500 0',
  '10.0.0.6 - - [27/Sep/2026:10:03:11] "GET /api/users HTTP/1.1" 200 388',
  '10.0.0.9 - - [27/Sep/2026:10:04:02] "GET /metrics HTTP/1.1" 200 2048',
  '10.0.0.5 - - [27/Sep/2026:10:05:47] "GET /api/items HTTP/1.1" 500 0',
  '10.0.0.6 - - [27/Sep/2026:10:06:19] "GET /api/items HTTP/1.1" 200 512',
  '10.0.0.5 - - [27/Sep/2026:10:07:03] "GET /api/items HTTP/1.1" 500 0',
  '10.0.0.8 - - [27/Sep/2026:10:08:31] "GET /api/items HTTP/1.1" 500 0',
  '10.0.0.5 - - [27/Sep/2026:10:09:12] "GET /api/items HTTP/1.1" 500 0',
  '10.0.0.9 - - [27/Sep/2026:10:10:00] "GET /health HTTP/1.1" 200 2',
].join("\n") + "\n";

const PS_AUX = [
  "USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND",
  "root         1  0.0  0.1  16732  3344 ?        Ss   09:00   0:01 /sbin/init",
  "root       301  0.0  0.2  15420  5112 ?        Ss   09:00   0:00 sshd: /usr/sbin/sshd",
  "root       512  0.0  0.1   8120  2896 ?        Ss   09:00   0:00 /usr/sbin/cron -f",
  "app        942  1.2  3.4 245120 68420 ?        Sl   09:01   1:22 /usr/local/bin/app --port 8080",
  "learner   1204  0.0  0.0   7248  2104 pts/0    Ss   09:05   0:00 bash",
].join("\n");

function seed(): DirNode {
  const root = dir();
  const mk = (path: string[], node: FsNode) => {
    let cur: DirNode = root;
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
  mk(["etc", "resolv.conf"], file("nameserver 127.0.0.53\noptions edns0\n"));
  mk(["etc", "hosts"], file("127.0.0.1 localhost\n10.0.0.42 lab.internal\n"));
  mk(["var", "log"], dir());
  mk(["var", "log", "syslog"], file("Sep 28 09:00:00 lab systemd[1]: Started.\n", 1024));
  mk(["var", "log", "kern.log"], file("Sep 28 09:00:01 lab kernel: boot ok\n", 2048));
  mk(["var", "log", "app"], dir());
  mk(["var", "log", "app", "app-2026-09-26.log"], file(APP_LOG_26, 2_469_609_472));
  mk(["var", "log", "app", "app-2026-09-27.log"], file(APP_LOG_27, 432_013_312));
  mk(["var", "log", "app", "access.log"], file(ACCESS_LOG, 18_252_912));
  mk(["var", "log", "app", "debug.log"], file("debug level tracing\n", 12_582_912));
  return root;
}

const HOME = ["home", "learner"];
const LAB_ACCOUNT = "844399650771";
const LAB_USER_ARN = "arn:aws:iam::844399650771:user/learner";

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
  images = new Set<string>(["app:latest"]);
  gitRepos = new Set<string>();
  staged = new Set<string>();
  commits: { repo: string; message: string; branch: string }[] = [];
  branches = new Map<string, Set<string>>();
  currentBranch = new Map<string, string>();
  remotes = new Map<string, string>();
  merged = new Set<string>();
  pods = new Map<string, K8sPod>();
  deployments = new Map<string, K8sDeployment>();
  services = new Map<string, K8sService>();

  constructor() {
    // A pre-broken workload for the debugging scenario task.
    this.pods.set("default/api", {
      ns: "default",
      name: "api",
      image: "app:latest",
      status: "CrashLoopBackOff",
      logs:
        "config.js:12\nError: Missing required environment variable DB_HOST\n    at loadConfig (config.js:12:11)\nProcess exited with code 1",
    });
  }
  tfInitDirs = new Set<string>();
  tfState = new Map<string, string[]>();
  s3Buckets = new Map<string, string[]>();
  ec2Instances: Ec2Instance[] = [];
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
    let cur: DirNode = this.root;
    for (const part of components) {
      let next = cur.children.get(part);
      if (!next || next.type !== "dir") {
        next = dir();
        cur.children.set(part, next);
      }
      cur = next;
    }
  }

  private writeFile(components: string[], content: string, append = false): boolean {
    if (!components.length) return false;
    this.mkdirp(components.slice(0, -1));
    const parent = this.nodeAt(components.slice(0, -1));
    if (!parent || parent.type !== "dir") return false;
    const name = components[components.length - 1];
    const existing = parent.children.get(name);
    if (existing?.type === "dir") return false;
    const next =
      append && existing?.type === "file" ? existing.content + content : content;
    parent.children.set(name, file(next));
    return true;
  }

  private parentAndName(components: string[]): { parent: DirNode; name: string } | null {
    const parent = this.nodeAt(components.slice(0, -1));
    if (!parent || parent.type !== "dir" || components.length === 0) return null;
    return { parent, name: components[components.length - 1] };
  }

  private repoFor(cwdAbs: string): string | undefined {
    if (this.gitRepos.has(cwdAbs)) return cwdAbs;
    return [...this.gitRepos].find((r) => cwdAbs.startsWith(r + "/"));
  }

  private tfFiles(cwdAbs: string): string[] {
    const node = this.nodeAt(this.resolve(cwdAbs)!);
    if (!node || node.type !== "dir") return [];
    return [...node.children.entries()]
      .filter(([name, n]) => n.type === "file" && name.endsWith(".tf"))
      .map(([name]) => name);
  }

  private tfResources(cwdAbs: string): string[] {
    const found: string[] = [];
    for (const name of this.tfFiles(cwdAbs)) {
      const comps = this.resolve(`${cwdAbs}/${name}`)!;
      const node = this.nodeAt(comps);
      if (node?.type !== "file") continue;
      const re = /resource\s+"([^"]+)"\s+"([^"]+)"/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(node.content))) found.push(`${m[1]}.${m[2]}`);
    }
    return found;
  }

  // ---- entry point -------------------------------------------------------

  run(line: string, stdin?: string[]): string[] {
    const trimmed = line.trim();
    if (!trimmed) return [];
    if (!stdin) this.history.push(trimmed);

    // output redirection (applies to the final pipeline stage)
    let append = false;
    let redirectTarget: string | null = null;
    const redirectIdx = trimmed.search(/(^|\s)(>>|>)(\s|$)/);
    let command = trimmed;
    if (redirectIdx !== -1) {
      const rest = trimmed.slice(redirectIdx).trim();
      const op = rest.startsWith(">>") ? ">>" : ">";
      append = op === ">>";
      const target = rest.slice(op.length).trim().split(/\s+/)[0];
      if (!target) return ["bash: syntax error near unexpected token `newline'"];
      redirectTarget = target;
      command = trimmed.slice(0, redirectIdx).trim();
    }

    // single-level pipe: left | right (right receives left's output)
    const pipeParts = command.split("|").map((s) => s.trim()).filter(Boolean);
    let out: string[];
    if (pipeParts.length > 2) {
      out = ["bash: multiple pipelines are not supported in this lab"];
    } else if (pipeParts.length === 2) {
      const left = this.run(pipeParts[0]);
      out = this.exec(pipeParts[1], left);
    } else {
      out = this.exec(command, stdin);
    }

    if (redirectTarget) {
      const comps = this.resolve(redirectTarget);
      if (!comps || !this.writeFile(comps, out.join("\n") + "\n", append)) {
        return [`bash: ${redirectTarget}: cannot write file`];
      }
      return [];
    }
    return out;
  }

  private exec(command: string, stdin?: string[]): string[] {
    // $(command) substitution: replaced by the first line of the inner command's output
    const subRe = /\$\(([^)]+)\)/g;
    let substituted = command;
    let m: RegExpExecArray | null;
    while ((m = subRe.exec(command))) {
      const inner = this.run(m[1]);
      substituted = substituted.replace(m[0], inner[0] ?? "");
    }
    command = substituted;
    const parts = command.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return [];
    const [cmd, ...args] = parts;
    switch (cmd) {
      case "help":
        return [
          "Built-in commands:",
          "  files      ls cd pwd mkdir touch echo cat rm chmod head tail",
          "  text       grep [-civ] wc [-l] ps (pipe friendly: a | b)",
          "  network    ip a|route, ss -tlnp, ping, dig, curl",
          "  docker     run, ps, logs, images, build, rm, rmi",
          "  git        init, add, commit, log, status, branch, checkout,",
          "             merge, remote, push, revert",
          "  kubectl    run, create deployment, scale, expose, get, describe,",
          "             logs, apply -f, delete",
          "  terraform  init, plan, apply, destroy",
          "  aws        sts get-caller-identity, s3 mb/ls/cp, ec2 run/describe",
          "  clear      clear the terminal",
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
      case "ls":
        return this.ls(args);
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
          if (!comps || !comps.length) return [`touch: invalid path '${t}'`];
          const existing = this.nodeAt(comps);
          if (existing) return [];
          if (!this.writeFile(comps, "")) return [`touch: cannot touch '${t}'`];
          return [];
        });
      }
      case "echo":
        return [args.join(" ").replace(/^["']|["']$/g, "").replace(/["']$/, "").replace(/\\n/g, "\n")];
      case "cat": {
        if (!args.length) return stdin ?? [];
        return args.flatMap((t) => {
          const comps = this.resolve(t);
          const node = comps && this.nodeAt(comps);
          if (!node) return [`cat: ${t}: No such file or directory`];
          if (node.type !== "file") return [`cat: ${t}: Is a directory`];
          return node.content.replace(/\n$/, "").split("\n");
        });
      }
      case "head":
      case "tail": {
        const nIdx = args.findIndex((a) => a === "-n");
        const count = nIdx !== -1 ? parseInt(args[nIdx + 1] ?? "10", 10) : 10;
        const fileArg = args.find((a, i) => !a.startsWith("-") && i !== nIdx + 1);
        let lines: string[];
        if (fileArg) {
          const comps = this.resolve(fileArg);
          const node = comps && this.nodeAt(comps);
          if (!node || node.type !== "file") return [`${cmd}: ${fileArg}: No such file or directory`];
          lines = node.content.replace(/\n$/, "").split("\n");
        } else {
          lines = stdin ?? [];
        }
        return cmd === "head" ? lines.slice(0, count) : lines.slice(-count);
      }
      case "chmod": {
        const mode = args[0];
        const target = args[1];
        if (!mode || !target) return ["chmod: missing operand"];
        const comps = this.resolve(target);
        const loc = comps && this.parentAndName(comps);
        const node = loc?.parent.children.get(loc.name);
        if (!node || node.type !== "file") return [`chmod: cannot access '${target}': No such file or directory`];
        if (!/^[0-7]{3,4}$/.test(mode)) return [`chmod: invalid mode: '${mode}'`];
        node.mode = parseInt(mode.slice(-3), 8);
        return [];
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
      case "grep":
        return this.grep(args, stdin);
      case "wc": {
        const flag = args.find((a) => a.startsWith("-"));
        const fileArg = args.find((a) => !a.startsWith("-"));
        let lines: string[];
        if (fileArg) {
          const comps = this.resolve(fileArg);
          const node = comps && this.nodeAt(comps);
          if (!node || node.type !== "file") return [`wc: ${fileArg}: No such file or directory`];
          lines = node.content.replace(/\n$/, "").split("\n");
        } else {
          lines = stdin ?? [];
        }
        if (flag === "-l") return [String(lines.length)];
        if (flag === "-w") return [String(lines.join(" ").split(/\s+/).filter(Boolean).length)];
        return [`${lines.length} ${lines.join(" ").split(/\s+/).filter(Boolean).length} ${lines.join("\n").length}`];
      }
      case "ps":
        return PS_AUX.split("\n");
      case "ip": {
        if (args[0] === "a" || args[0] === "addr") {
          return [
            "1: lo: <LOOPBACK,UP> mtu 65536",
            "    inet 127.0.0.1/8 scope host lo",
            "2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500",
            "    inet 172.17.0.2/16 brd 172.17.255.255 scope global eth0",
          ];
        }
        if (args[0] === "route") {
          return [
            "default via 172.17.0.1 dev eth0",
            "172.17.0.0/16 dev eth0 proto kernel scope link src 172.17.0.2",
          ];
        }
        return ["Usage: ip a | ip route"];
      }
      case "ss":
        return [
          "State   Recv-Q  Send-Q   Local Address:Port   Peer Address:Port  Process",
          "LISTEN  0       128      0.0.0.0:22          0.0.0.0:*          users:((\"sshd\",pid=301))",
          "LISTEN  0       128      127.0.0.53:53       0.0.0.0:*          users:((\"systemd-resolve\",pid=180))",
          "LISTEN  0       511      *:8080              *:*                users:((\"app\",pid=942))",
        ];
      case "ping": {
        const host = args.find((a) => !a.startsWith("-"));
        if (!host) return ["ping: usage error: Destination address required"];
        const known: Record<string, string> = { "lab.internal": "10.0.0.42", localhost: "127.0.0.1" };
        const ip = known[host];
        if (!ip) return [`ping: ${host}: Name or service not known`];
        return [
          `PING ${host} (${ip}) 56(84) bytes of data.`,
          `64 bytes from ${host} (${ip}): icmp_seq=1 ttl=64 time=0.21 ms`,
          `64 bytes from ${host} (${ip}): icmp_seq=2 ttl=64 time=0.19 ms`,
          `--- ${host} ping statistics ---`,
          "2 packets transmitted, 2 received, 0% packet loss",
        ];
      }
      case "dig": {
        const host = args.find((a) => !a.startsWith("-") && !a.startsWith("@"));
        if (!host) return ["dig: no query specified"];
        if (host !== "lab.internal") return [`;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN`];
        return [
          "; <<>> DiG 9.18 lab.internal",
          ";; ANSWER SECTION:",
          "lab.internal.\t\t300\tIN\tA\t10.0.0.42",
          ";; Query time: 2 msec",
        ];
      }
      case "curl":
        return this.curl(args);
      case "docker":
        return this.docker(args);
      case "git":
        return this.git(args);
      case "kubectl":
        return this.kubectl(args);
      case "terraform":
        return this.terraform(args);
      case "aws":
        return this.aws(args);
      case "exit":
        return ["logout"];
      default:
        return [`${cmd}: command not found`];
    }
  }

  private ls(args: string[]): string[] {
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

    const modeStr = (n: FsNode) => {
      const bits = n.type === "file" ? (n.mode ?? 0o644) : 0o755;
      const trip = (v: number) => `${v & 4 ? "r" : "-"}${v & 2 ? "w" : "-"}${v & 1 ? "x" : "-"}`;
      return `${n.type === "dir" ? "d" : "-"}${trip((bits >> 6) & 7)}${trip((bits >> 3) & 7)}${trip(bits & 7)}`;
    };

    const listOne = (path: string[], n: FsNode) => {
      if (n.type === "file") {
        out.push(long ? `${modeStr(n)} 1 learner learner ${humanSize(n.size)} ${path[path.length - 1]}` : path[path.length - 1]);
        return;
      }
      const entries = [...n.children.entries()];
      const sorted = bySize
        ? [...entries].sort((a, b) => {
            const sa = a[1].type === "file" ? a[1].size : 0;
            const sb = b[1].type === "file" ? b[1].size : 0;
            return sb - sa;
          })
        : [...entries].sort((a, b) => a[0].localeCompare(b[0]));
      if (long) out.push(`total ${sorted.length}`);
      for (const [name, child] of sorted) {
        const label = child.type === "dir" ? `${name}/` : name;
        if (long) {
          const size = child.type === "file" ? humanSize(child.size) : "-";
          out.push(`${modeStr(child)} 2 learner learner ${size.padStart(6)} ${label}`);
        } else {
          out.push(label);
        }
      }
      if (recursive) {
        for (const [name, child] of sorted) {
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

  private grep(args: string[], stdin?: string[]): string[] {
    const count = args.some((a) => a.includes("c"));
    const ignoreCase = args.some((a) => a.includes("i"));
    const invert = args.some((a) => a.includes("v"));
    const rest = args.filter((a) => !a.startsWith("-"));
    const pattern = rest[0];
    if (!pattern) return ["usage: grep [-civ] PATTERN [FILE]"];
    const re = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), ignoreCase ? "i" : "");
    let lines: string[];
    if (rest[1]) {
      const comps = this.resolve(rest[1]);
      const node = comps && this.nodeAt(comps);
      if (!node || node.type !== "file") return [`grep: ${rest[1]}: No such file or directory`];
      lines = node.content.replace(/\n$/, "").split("\n");
    } else {
      lines = stdin ?? [];
    }
    const hits = lines.filter((l) => (invert ? !re.test(l) : re.test(l)));
    return count ? [String(hits.length)] : hits;
  }

  private curl(args: string[]): string[] {
    const url = args.find((a) => !a.startsWith("-"));
    if (!url) return ["curl: no URL specified"];
    const m = url.match(/^https?:\/\/([^/:]+)(?::(\d+))?/);
    if (!m) return [`curl: (6) Could not resolve host: ${url}`];
    const [, host, portStr] = m;
    const port = parseInt(portStr ?? "80", 10);
    if (host === "localhost" || host === "127.0.0.1") {
      const serving = this.containers.some(
        (c) => c.running && c.ports.some((p) => p.host === port || p.ctr === port),
      );
      if (serving) {
        return ["HTTP/1.1 200 OK", "Content-Type: text/plain", "", "ok"];
      }
      return [`curl: (7) Failed to connect to localhost port ${port}: Connection refused`];
    }
    return [`curl: (6) Could not resolve host: ${host}`];
  }

  private docker(args: string[]): string[] {
    const [sub, ...rest] = args;
    if (!sub) return ["docker: 'docker' requires a command (try 'docker ps')"];
    if (sub === "images") {
      return [
        "REPOSITORY   TAG      IMAGE ID       SIZE",
        ...[...this.images].map((img) => {
          const [repo, tag] = img.split(":");
          return `${repo.padEnd(12)} ${tag.padEnd(8)} a1b2c3d4e5f6   24.1MB`;
        }),
      ];
    }
    if (sub === "ps") {
      const all = rest.some((a) => a.includes("a"));
      const quiet = rest.some((a) => a.includes("q"));
      const list = this.containers.filter((c) => c.running || all);
      if (quiet) return list.map((c) => c.id);
      const rows = list.map(
          (c) =>
            `${c.id}   ${c.image}   ${c.running ? "Up" : "Exited"}   ${c.ports.map((p) => `0.0.0.0:${p.host}->${p.ctr}/tcp`).join(", ") || "-"}`,
        );
      return ["CONTAINER ID   IMAGE       STATUS   PORTS", ...(rows.length ? rows : all ? ["(none)"] : [])];
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
      const tag = image.includes(":") ? image : `${image}:latest`;
      if (!this.images.has(tag)) {
        return [`Unable to find image '${tag}' locally`, `docker: Error response from daemon: pull access denied for ${tag}`];
      }
      const id = Math.random().toString(16).slice(2, 12);
      this.containers.push({
        id,
        image: tag,
        running: true,
        ports,
        logs: "listening on 0.0.0.0:80",
      });
      if (detach) return [id];
      return [id, "listening on 0.0.0.0:80"];
    }
    if (sub === "build") {
      const tagIdx = rest.findIndex((a) => a === "-t");
      const tag = tagIdx !== -1 ? rest[tagIdx + 1] : undefined;
      const pathArg = rest[rest.length - 1] ?? ".";
      const dockerfile = this.nodeAt(this.resolve(`${pathArg === "." ? "" : pathArg}/Dockerfile`.replace(/\/\//g, "/")) ?? []);
      if (!dockerfile || dockerfile.type !== "file") {
        return ["docker: Cannot connect: Dockerfile not found in build context"];
      }
      if (!tag) return ["docker: '-t' flag is required in this lab"];
      this.images.add(tag.includes(":") ? tag : `${tag}:latest`);
      return [
        `[+] Building 1.2s (6/6) FINISHED`,
        " => [internal] load build definition from Dockerfile",
        " => [internal] load .dockerignore",
        " => [1/3] FROM scratch",
        ` => [2/3] COPY app /app`,
        ` => [3/3] CMD ["/app"]`,
        ` => exporting to image`,
        `Successfully tagged ${tag.includes(":") ? tag : `${tag}:latest`}`,
      ];
    }
    if (sub === "logs") {
      if (!this.containers.length) return ["Error: no containers exist"];
      const target = rest[0];
      const c = target
        ? this.containers.find((x) => x.id.startsWith(target))
        : this.containers[this.containers.length - 1];
      if (!c) return [`Error: No such container: ${target}`];
      return [c.logs];
    }
    if (sub === "rm") {
      const targets = rest.filter((a) => !a.startsWith("-"));
      return targets.flatMap((t) => {
        const idx = this.containers.findIndex((c) => c.id.startsWith(t));
        if (idx === -1) return [`Error: No such container: ${t}`];
        if (this.containers[idx].running) return [`Error response from daemon: cannot remove running container ${t} (use -f)`];
        this.containers.splice(idx, 1);
        return [t];
      });
    }
    if (sub === "stop") {
      return rest.map((t) => {
        const c = this.containers.find((x) => x.id.startsWith(t));
        if (c) c.running = false;
        return t;
      });
    }
    if (sub === "rmi") {
      const tag = rest[0]?.includes(":") ? rest[0] : `${rest[0]}:latest`;
      if (!this.images.delete(tag)) return [`Error response from daemon: No such image: ${tag}`];
      return [`Untagged: ${tag}`];
    }
    return [`docker: '${sub}' is not a docker command (try run, build, ps, logs, images, rm, rmi)`];
  }

  private git(args: string[]): string[] {
    const [sub, ...rest] = args;
    const cwdAbs = this.abs(this.cwd);
    const repo = this.repoFor(cwdAbs);
    const notRepo = ["fatal: not a git repository (or any of the parent directories): .git"];
    if (sub === "init") {
      this.gitRepos.add(cwdAbs);
      this.branches.set(cwdAbs, new Set(["main"]));
      this.currentBranch.set(cwdAbs, "main");
      return [`Initialized empty Git repository in ${cwdAbs}/.git/`];
    }
    if (sub === "status") {
      if (!repo) return notRepo;
      return [
        `On branch ${this.currentBranch.get(repo) ?? "main"}`,
        this.staged.has(repo) ? "Changes to be committed:" : "nothing to commit, working tree clean",
      ];
    }
    if (sub === "add") {
      if (!repo) return notRepo;
      this.staged.add(repo);
      return [];
    }
    if (sub === "commit") {
      if (!repo) return notRepo;
      const mIdx = rest.findIndex((a) => a === "-m");
      const message = mIdx !== -1 ? rest[mIdx + 1]?.replace(/^["']|["']$/g, "") : "";
      if (!this.staged.has(repo)) return ["nothing to commit (use \"git add\" to stage)"];
      if (!message) return ["Aborting commit due to empty commit message."];
      this.commits.push({ repo, message, branch: this.currentBranch.get(repo) ?? "main" });
      this.staged.delete(repo);
      return [`[${this.currentBranch.get(repo)} ${Math.random().toString(16).slice(2, 9)}] ${message}`];
    }
    if (sub === "log") {
      if (!repo) return notRepo;
      const branch = this.currentBranch.get(repo) ?? "main";
      const mine = this.commits.filter((c) => c.repo === repo && (branch === "main" ? true : c.branch === branch));
      if (!mine.length) return ["fatal: your current branch 'main' does not have any commits yet"];
      return mine.flatMap((c) => [
        `commit ${Math.random().toString(16).slice(2, 42)}`,
        "Author: learner <learner@lab>",
        "",
        `    ${c.message}`,
        "",
      ]);
    }
    if (sub === "branch") {
      if (!repo) return notRepo;
      if (!rest[0]) return [...(this.branches.get(repo) ?? new Set())];
      if (!this.branches.has(repo)) this.branches.set(repo, new Set(["main"]));
      this.branches.get(repo)!.add(rest[0]);
      return [];
    }
    if (sub === "checkout" || sub === "switch") {
      if (!repo) return notRepo;
      let name = rest[0];
      if (name === "-b") name = rest[1];
      else if (rest[0] && this.branches.get(repo)?.has(rest[0])) name = rest[0];
      else if (rest[0] === "-b") name = rest[1];
      if (!name) return [`error: branch name required`];
      if (!this.branches.get(repo)?.has(name)) {
        if (rest[0] === "-b") this.branches.get(repo)!.add(name);
        else return [`error: pathspec '${name}' did not match any branch`];
      }
      this.currentBranch.set(repo, name);
      return [`Switched to branch '${name}'`];
    }
    if (sub === "merge") {
      if (!repo) return notRepo;
      const name = rest[0];
      if (!this.branches.get(repo)?.has(name)) return [`merge: ${name} - not something we can merge`];
      this.merged.add(`${repo}:${name}`);
      const branchCommits = this.commits.filter((c) => c.repo === repo && c.branch === name);
      return [
        `Updating ${Math.random().toString(16).slice(2, 7)}..${Math.random().toString(16).slice(2, 7)}`,
        "Fast-forward",
        ...branchCommits.map((c) => ` ${c.message}`),
      ];
    }
    if (sub === "remote") {
      if (!repo) return notRepo;
      if (rest[0] === "add") {
        this.remotes.set(repo, rest[2]);
        return [];
      }
      if (rest[0] === "-v") {
        const url = this.remotes.get(repo);
        return url ? [`origin\t${url} (fetch)`, `origin\t${url} (push)`] : [];
      }
      return [];
    }
    if (sub === "push") {
      if (!repo) return notRepo;
      if (!this.remotes.has(repo)) {
        return [
          "fatal: No configured push destination.",
          "Add a remote first: git remote add origin <url>",
        ];
      }
      return [
        `To ${this.remotes.get(repo)}`,
        ` * [new branch]      ${this.currentBranch.get(repo)} -> ${this.currentBranch.get(repo)}`,
      ];
    }
    if (sub === "revert") {
      if (!repo) return notRepo;
      const branch = this.currentBranch.get(repo) ?? "main";
      const last = [...this.commits].reverse().find((c) => c.repo === repo && c.branch === branch);
      if (!last) return ["error: commit to revert not found"];
      const msg = `Revert "${last.message}"`;
      this.commits.push({ repo, message: msg, branch });
      return [`[main ${Math.random().toString(16).slice(2, 9)}] ${msg}`];
    }
    return [`git: '${sub}' is not a git command (try init, add, commit, log, branch, checkout, merge, remote, push, revert)`];
  }

  private kubectl(args: string[]): string[] {
    const [sub, ...rest] = args;
    if (!sub) return ["kubectl: command required (try 'kubectl get pods')"];
    const positional = rest.filter((a, i) => !a.startsWith("-") && rest[i - 1] !== "--image" && rest[i - 1] !== "-n");
    const flagVal = (name: string) => {
      const i = rest.findIndex((a) => a === name);
      return i !== -1 ? rest[i + 1] : undefined;
    };
    if (sub === "run") {
      const name = rest[0];
      const image = flagVal("--image");
      if (!name || !image) return ["error: required flag(s) \"image\" missing"];
      this.pods.set(`default/${name}`, {
        ns: "default",
        name,
        image,
        status: "Running",
        logs: `${image} started`,
      });
      return [`pod/${name} created`];
    }
    if (sub === "create" && rest[0] === "deployment") {
      const name = rest[1];
      const image = flagVal("--image");
      const replicas = parseInt(flagVal("--replicas") ?? "1", 10);
      if (!name || !image) return ["error: required flag(s) \"image\" missing"];
      this.deployments.set(`default/${name}`, { ns: "default", name, image, replicas });
      for (let i = 0; i < replicas; i++) {
        this.pods.set(`default/${name}-${Math.random().toString(16).slice(2, 7)}`, {
          ns: "default",
          name: `${name}-${Math.random().toString(16).slice(2, 7)}`,
          image,
          status: "Running",
          logs: `${image} started`,
        });
      }
      return [`deployment.apps/${name} created`];
    }
    if (sub === "scale") {
      const name = positional[0]?.replace(/^deployment\//, "");
      const replicas = parseInt(flagVal("--replicas") ?? "1", 10);
      const dep = this.deployments.get(`default/${name}`);
      if (!dep) return [`Error from server (NotFound): deployments.apps "${name}" not found`];
      dep.replicas = replicas;
      return [`deployment.apps/${name} scaled`];
    }
    if (sub === "expose") {
      const name = positional[0]?.replace(/^deployment\//, "").replace(/^pod\//, "");
      const svcName = flagVal("--name") ?? name;
      const port = parseInt(flagVal("--port") ?? "80", 10);
      const targetPort = parseInt((flagVal("--target-port") ?? "80").toString(), 10);
      if (!this.deployments.has(`default/${name}`) && !this.pods.has(`default/${name}`)) {
        return [`Error from server (NotFound): ${name} not found`];
      }
      this.services.set(`default/${svcName}`, { ns: "default", name: svcName, port, targetPort });
      return [`service/${svcName} exposed`];
    }
    if (sub === "get") {
      const what = rest[0] ?? "pods";
      if (what.startsWith("pod")) {
        return [
          "NAME                       READY   STATUS    RESTARTS   AGE",
          ...[...this.pods.values()].map(
            (p) => `${p.name.padEnd(26)} 1/1     ${p.status.padEnd(9)} 0          5m`,
          ),
        ];
      }
      if (what.startsWith("deploy")) {
        return [
          "NAME      READY   UP-TO-DATE   AVAILABLE   AGE",
          ...[...this.deployments.values()].map(
            (d) => `${d.name.padEnd(9)} ${d.replicas}/${d.replicas}   ${d.replicas}            ${d.replicas}           5m`,
          ),
        ];
      }
      if (what.startsWith("svc")) {
        return [
          "NAME      TYPE        CLUSTER-IP     PORT(S)   AGE",
          ...[...this.services.values()].map(
            (s) => `${s.name.padEnd(9)} ClusterIP   10.96.x.x      ${s.port}/TCP   5m`,
          ),
        ];
      }
      return [`error: the server doesn't have a resource type "${what}"`];
    }
    if (sub === "describe") {
      const kind = rest[0];
      const name = rest[1];
      if (kind?.startsWith("pod")) {
        const pod = this.pods.get(`default/${name}`);
        if (!pod) return [`Error from server (NotFound): pods "${name}" not found`];
        return [
          `Name:             ${pod.name}`,
          `Namespace:        default`,
          `Status:           ${pod.status}`,
          `Containers:`,
          `  Image:          ${pod.image}`,
          `Events:`,
          `  Type    Reason     Age   Message`,
          `  ----    ------     ---   -------`,
          pod.status === "Running"
            ? "  Normal  Started    5m    Started container"
            : "  Warning BackOff    2m    Back-off restarting failed container",
        ];
      }
      return [`error: describe ${kind} not supported in this lab`];
    }
    if (sub === "logs") {
      const name = rest[0];
      const pod = this.pods.get(`default/${name}`);
      if (!pod) return [`Error from server (NotFound): pods "${name}" not found`];
      return pod.logs.split("\n");
    }
    if (sub === "delete") {
      const kind = rest[0];
      const name = rest[1];
      const key = `default/${name}`;
      if (kind?.startsWith("pod")) {
        if (!this.pods.delete(key)) return [`Error from server (NotFound): pods "${name}" not found`];
        return [`pod "${name}" deleted`];
      }
      if (kind?.startsWith("deploy")) {
        if (!this.deployments.delete(key)) return [`Error from server (NotFound): deployments.apps "${name}" not found`];
        for (const k of [...this.pods.keys()].filter((k) => k.startsWith(`default/${name}-`))) this.pods.delete(k);
        return [`deployment.apps "${name}" deleted`];
      }
      if (kind?.startsWith("svc")) {
        if (!this.services.delete(key)) return [`Error from server (NotFound): services "${name}" not found`];
        return [`service "${name}" deleted`];
      }
      return [`error: delete ${kind} not supported`];
    }
    if (sub === "apply") {
      const fIdx = rest.findIndex((a) => a === "-f");
      const fileArg = fIdx !== -1 ? rest[fIdx + 1] : undefined;
      if (!fileArg) return ["error: \"-f\" is required"];
      const comps = this.resolve(fileArg);
      const node = comps && this.nodeAt(comps);
      if (!node || node.type !== "file") return [`error: the path ${fileArg} does not exist`];
      const content = node.content;
      const kind = content.match(/kind:\s*(\w+)/)?.[1];
      const name = content.match(/name:\s*([\w-]+)/)?.[1];
      const image = content.match(/image:\s*([\w./:-]+)/)?.[1];
      const replicas = parseInt(content.match(/replicas:\s*(\d+)/)?.[1] ?? "1", 10);
      if (!kind || !name || !image) return ["error: manifest must contain kind, metadata.name and image"];
      if (kind === "Pod") {
        this.pods.set(`default/${name}`, { ns: "default", name, image, status: "Running", logs: `${image} started` });
        return [`pod/${name} created`];
      }
      if (kind === "Deployment") {
        this.deployments.set(`default/${name}`, { ns: "default", name, image, replicas });
        for (let i = 0; i < replicas; i++) {
          const pname = `${name}-${Math.random().toString(16).slice(2, 7)}`;
          this.pods.set(`default/${pname}`, { ns: "default", name: pname, image, status: "Running", logs: `${image} started` });
        }
        return [`deployment.apps/${name} created`];
      }
      if (kind === "Service") {
        this.services.set(`default/${name}`, { ns: "default", name, port: 80, targetPort: 8080 });
        return [`service/${name} created`];
      }
      return [`error: kind ${kind} not supported in this lab`];
    }
    return [`kubectl: '${sub}' unknown (try run, create deployment, scale, expose, get, describe, logs, apply, delete)`];
  }

  private terraform(args: string[]): string[] {
    const [sub, ...rest] = args;
    const cwdAbs = this.abs(this.cwd);
    if (sub === "init") {
      this.tfInitDirs.add(cwdAbs);
      return [
        "Initializing the backend...",
        "Initializing provider plugins...",
        "- Finding latest version of hashicorp/aws...",
        "- Installing hashicorp/aws v5.40.0...",
        "Terraform has been successfully initialized!",
      ];
    }
    if (sub === "plan" || sub === "apply") {
      if (!this.tfInitDirs.has(cwdAbs)) {
        return ["Error: Initialization required. Please run \"terraform init\" first."];
      }
      const resources = this.tfResources(cwdAbs);
      if (!this.tfFiles(cwdAbs).length) {
        return ["Error: No configuration files found in this directory."];
      }
      if (sub === "plan") {
        return [
          "Terraform used the selected providers to generate the following execution plan.",
          ...resources.map((r) => `  + aws resource "${r}" will be created`),
          `Plan: ${resources.length} to add, 0 to change, 0 to destroy.`,
        ];
      }
      const auto = rest.includes("-auto-approve");
      if (!auto) return ["Do you want to perform these actions? (use -auto-approve in this lab)"];
      this.tfState.set(cwdAbs, resources);
      return [
        ...resources.map((r) => `${r}: Creation complete after 1s [id=${Math.random().toString(16).slice(2, 12)}]`),
        `Apply complete! Resources: ${resources.length} added, 0 changed, 0 destroyed.`,
      ];
    }
    if (sub === "destroy") {
      const state = this.tfState.get(cwdAbs) ?? [];
      this.tfState.set(cwdAbs, []);
      return [
        ...state.map((r) => `${r}: Destroying... [id=${Math.random().toString(16).slice(2, 12)}]`),
        ...state.map((r) => `${r}: Destruction complete after 0s`),
        "Destroy complete! Resources: 0 destroyed.",
      ].concat(state.length ? [] : ["Destroy complete! Resources: 0 destroyed."]);
    }
    if (sub === "state" && rest[0] === "list") {
      return this.tfState.get(cwdAbs) ?? [];
    }
    return [`terraform: '${sub}' unknown (try init, plan, apply, destroy, state list)`];
  }

  private aws(args: string[]): string[] {
    const [service, operation, ...rest] = args;
    if (!service) return ["aws: usage: aws <service> <operation> [options]"];
    if (service === "sts" && operation === "get-caller-identity") {
      return [
        "{",
        `    "UserId": "AIDAEXAMPLE12345678",`,
        `    "Account": "${LAB_ACCOUNT}",`,
        `    "Arn": "${LAB_USER_ARN}"`,
        "}",
      ];
    }
    if (service === "configure") {
      return [
        "The AWS CLI in this lab is pre-configured with a scoped learner profile.",
        "Verify with: aws sts get-caller-identity",
      ];
    }
    if (service === "s3") {
      if (operation === "mb") {
        const bucket = rest.find((a) => a.startsWith("s3://"))?.replace("s3://", "");
        if (!bucket) return ["make_bucket failed: bucket name required"];
        if (this.s3Buckets.has(bucket)) return [`make_bucket failed: bucket ${bucket} already exists`];
        this.s3Buckets.set(bucket, []);
        return [`make_bucket: ${bucket}`];
      }
      if (operation === "ls") {
        const target = rest.find((a) => a.startsWith("s3://"));
        if (target) {
          const bucket = target.replace("s3://", "").replace(/\/$/, "");
          return (this.s3Buckets.get(bucket) ?? []).map((k) => `2026-09-28 09:00:00 ${k}`);
        }
        return [...this.s3Buckets.keys()].map((b) => `2026-09-28 09:00:00 ${b}`);
      }
      if (operation === "cp") {
        const src = rest[0];
        const dst = rest[1];
        const bucket = dst?.replace("s3://", "").split("/")[0];
        const key = dst?.replace("s3://", "").split("/")[1] ?? src?.split("/").pop();
        if (!this.s3Buckets.has(bucket)) return [`upload failed: bucket ${bucket} does not exist`];
        this.s3Buckets.get(bucket)!.push(key ?? "object");
        return [`upload: ${src} to s3://${bucket}/${key}`];
      }
      return [`aws: s3 operation '${operation}' unknown (try mb, ls, cp)`];
    }
    if (service === "ec2") {
      if (operation === "run-instances") {
        const image = rest[rest.indexOf("--image-id") + 1] ?? "ami-00000000";
        const count = parseInt(rest[rest.indexOf("--count") + 1] ?? "1", 10);
        const created: string[] = [];
        for (let i = 0; i < count; i++) {
          const id = `i-${Math.random().toString(16).slice(2, 10)}`;
          this.ec2Instances.push({ id, image, state: "running" });
          created.push(id);
        }
        return [
          "{",
          '    "Instances": [',
          ...created.flatMap((id, i) => [
            "        {",
            `            "InstanceId": "${id}",`,
            `            "ImageId": "${image}",`,
            `            "State": { "Code": 16, "Name": "running" }`,
            "        }" + (i < created.length - 1 ? "," : ""),
          ]),
          "    ]",
          "}",
        ];
      }
      if (operation === "describe-instances") {
        if (!this.ec2Instances.length) return ["(no instances)"];
        return this.ec2Instances.map(
          (i) => `${i.id}  ${i.image}  ${i.state}`,
        );
      }
      if (operation === "terminate-instances") {
        const idsIdx = rest.indexOf("--instance-ids");
        const ids = idsIdx !== -1 ? rest.slice(idsIdx + 1).filter((a) => !a.startsWith("--")) : [];
        for (const id of ids) {
          const inst = this.ec2Instances.find((i) => i.id === id);
          if (inst) inst.state = "terminated";
        }
        return ids.map((id) => `Terminating ${id}`);
      }
      return [`aws: ec2 operation '${operation}' unknown (try run-instances, describe-instances)`];
    }
    return [`aws: service '${service}' unknown in this lab (try sts, s3, ec2, configure)`];
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
        case "filemode": {
          const comps = check.path ? this.resolve(check.path) : null;
          const node = comps && this.nodeAt(comps);
          if (!node || node.type !== "file") return { label: check.label, pass: false, detail: "file not found" };
          const want = parseInt(check.value ?? "600", 8);
          const ok = (node.mode ?? 0o644) === want;
          return { label: check.label, pass: ok, detail: ok ? "ok" : `mode is ${(node.mode ?? 0o644).toString(8)}, expected ${check.value}` };
        }
        case "container": {
          const c = this.containers.find((x) => x.image === check.path && x.running);
          return { label: check.label, pass: !!c, detail: c ? "ok" : "no running container from this image" };
        }
        case "port":
        case "http": {
          const c = this.containers.find(
            (x) => x.running && x.ports.some((p) => p.host === check.port || p.ctr === check.port),
          );
          return {
            label: check.label,
            pass: !!c,
            detail: c ? "ok" : check.kind === "http" ? `nothing serving on port ${check.port}` : "no running container maps this port",
          };
        }
        case "gitrepo": {
          const ok = this.gitRepos.has(check.path ?? "");
          return { label: check.label, pass: ok, detail: ok ? "ok" : "no repository initialized here" };
        }
        case "gitcommit": {
          const repo = check.path ?? "";
          const ok = this.commits.some(
            (c) => c.repo === repo && (check.value ? c.message === check.value : true),
          );
          return { label: check.label, pass: ok, detail: ok ? "ok" : `no commit '${check.value}' found` };
        }
        case "gitbranch": {
          const [repo, branch] = (check.value ?? "::").split(":");
          const ok =
            this.merged.has(`${repo}:${branch}`) ||
            this.currentBranch.get(repo) === branch ||
            this.branches.get(repo)?.has(branch);
          return { label: check.label, pass: !!ok, detail: ok ? "ok" : `branch '${branch}' not found` };
        }
        case "gitremote": {
          const url = this.remotes.get(check.path ?? "");
          const ok = !!url && (!check.value || url.includes(check.value));
          return { label: check.label, pass: ok, detail: ok ? "ok" : "remote not configured" };
        }
        case "k8spod": {
          const pod = this.pods.get(check.path ?? "");
          return {
            label: check.label,
            pass: !!pod && pod.status === "Running",
            detail: pod ? `status is ${pod.status}` : "pod not found",
          };
        }
        case "k8sdeployment": {
          const [key, reps] = (check.value ?? ":").split(":");
          const dep = this.deployments.get(key);
          const ok = !!dep && (!reps || dep.replicas === parseInt(reps, 10));
          return {
            label: check.label,
            pass: ok,
            detail: dep ? `replicas is ${dep.replicas}` : "deployment not found",
          };
        }
        case "k8sservice": {
          const ok = this.services.has(check.path ?? "");
          return { label: check.label, pass: ok, detail: ok ? "ok" : "service not found" };
        }
        case "tfinit": {
          const ok = this.tfInitDirs.has(check.path ?? "");
          return { label: check.label, pass: ok, detail: ok ? "ok" : "terraform init not run here" };
        }
        case "tfresource": {
          const all = [...this.tfState.values()].flat();
          const ok = all.includes(check.value ?? "");
          return { label: check.label, pass: ok, detail: ok ? "ok" : `resource '${check.value}' not in state` };
        }
        case "tfempty": {
          const state = this.tfState.get(check.path ?? "");
          const ok = !!state && state.length === 0;
          return { label: check.label, pass: ok, detail: ok ? "ok" : state ? `state still has ${state.length} resource(s)` : "nothing applied yet" };
        }
        case "awss3": {
          const ok = this.s3Buckets.has(check.value ?? "");
          return { label: check.label, pass: ok, detail: ok ? "ok" : "bucket not found" };
        }
        case "awsec2": {
          const ok = this.ec2Instances.some(
            (i) => i.state === "running" && (!check.value || i.image === check.value),
          );
          return { label: check.label, pass: ok, detail: ok ? "ok" : "no running instance" };
        }
        case "nocontainer": {
          const ok = !this.containers.some((x) => x.image === check.path && x.running);
          return { label: check.label, pass: ok, detail: ok ? "ok" : "a container from this image is still running" };
        }
        case "noimage": {
          const ok = !this.images.has(check.path ?? "");
          return { label: check.label, pass: ok, detail: ok ? "ok" : "image still exists locally" };
        }
        case "awss3object": {
          const [bucket, key] = (check.value ?? "/").split("/");
          const ok = this.s3Buckets.get(bucket)?.includes(key);
          return { label: check.label, pass: !!ok, detail: ok ? "ok" : "object not found in bucket" };
        }
        default:
          return { label: check.label, pass: false, detail: "unsupported check" };
      }
    });
  }
}
