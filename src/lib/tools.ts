export interface ToolCheatsheetItem {
  command: string;
  desc: string;
  category: string;
}

export interface ToolPitfall {
  issue: string;
  symptom: string;
  fix: string;
}

export interface ToolArchitecture {
  title: string;
  explanation: string;
  components: { name: string; role: string }[];
}

export interface ToolDefinition {
  slug: string;
  name: string;
  category:
    | "Containers & Orchestration"
    | "Core Systems"
    | "Cloud & Infrastructure"
    | "IaC & Automation"
    | "AI & LLM Systems"
    | "MLOps"
    | "Observability & Reliability";
  tagline: string;
  summary: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedHours: string;
  color: string;
  accentBg: string;
  iconName: string;
  associatedSkillSlug: string;
  relatedPathSlug: string;
  relatedPathName: string;
  architecture: ToolArchitecture;
  keyConcepts: { term: string; definition: string }[];
  cheatsheet: ToolCheatsheetItem[];
  pitfalls: ToolPitfall[];
  productionChecklist: string[];
}

export const tools: ToolDefinition[] = [
  {
    slug: "docker",
    name: "Docker",
    category: "Containers & Orchestration",
    tagline: "Industry-standard container runtime and OCI image engine for reproducible environments.",
    summary:
      "Docker packages applications and their entire dependency tree into lightweight, isolated Linux namespaces. By decoupling software from underlying host operating systems, it eliminates 'works on my machine' bugs and forms the universal unit of deployment for microservices and cloud infrastructure.",
    difficulty: "beginner",
    estimatedHours: "4-6 hrs",
    color: "#0db7ed",
    accentBg: "rgba(13, 183, 237, 0.08)",
    iconName: "docker",
    associatedSkillSlug: "docker",
    relatedPathSlug: "devops-engineer",
    relatedPathName: "DevOps Engineer",
    architecture: {
      title: "Docker Engine & Container Isolation",
      explanation:
        "The Docker daemon (dockerd) communicates with containerd via gRPC to instruct runc to configure Linux kernel primitives (cgroups for resource limits, namespaces for PID/network/mount isolation, and overlay2 for copy-on-write filesystem layers).",
      components: [
        { name: "dockerd (Daemon)", role: "REST API server handling container build, push, pull and lifecycle events." },
        { name: "containerd & runc", role: "OCI-compliant low-level runtime that configures namespaces and cgroups." },
        { name: "OverlayFS2", role: "Union filesystem layering read-only image layers under a thin writable container layer." },
        { name: "Bridge Network", role: "Software bridge creating virtual ethernet pairs (veth) with iptables NAT." },
      ],
    },
    keyConcepts: [
      { term: "Image vs Container", definition: "An image is an immutable, multi-layered snapshot. A container is an active running process with an ephemeral writable layer." },
      { term: "Multi-stage Builds", definition: "Separating build toolchains (Go/Node/Rust compilers) from the final minimal production runner image (Alpine/Distroless)." },
      { term: "Volumes & Bind Mounts", definition: "Bypassing the copy-on-write layer to persist state directly onto the host filesystem or managed storage drivers." },
      { term: "cgroups v2", definition: "Linux kernel mechanism limiting CPU quota, memory limits, and OOM killer behavior per container." },
    ],
    cheatsheet: [
      { command: "docker run -d -p 8080:80 --name web nginx:alpine", desc: "Run detached container mapping host 8080 to container 80", category: "Run" },
      { command: "docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'", desc: "List all containers with custom formatted columns", category: "Inspect" },
      { command: "docker build -t app:v1 --no-cache -f Dockerfile .", desc: "Build image from local context without cached layers", category: "Build" },
      { command: "docker logs -f --tail 100 <container-id>", desc: "Follow container stdout/stderr output streaming", category: "Debug" },
      { command: "docker exec -it <container-id> sh", desc: "Open an interactive TTY shell inside running container", category: "Debug" },
      { command: "docker system prune -af --volumes", desc: "Remove all stopped containers, unused networks, images and volumes", category: "Clean" },
    ],
    pitfalls: [
      {
        issue: "Container exits immediately with code 0",
        symptom: "docker ps shows Exited (0) within 1 second of startup.",
        fix: "The entrypoint PID 1 finished and exited. Ensure the main foreground process (e.g. nginx -g 'daemon off;' or node server.js) remains active.",
      },
      {
        issue: "Out of Memory (OOMKilled - 137)",
        symptom: "Exit code 137 with 'Killed' in dmesg.",
        fix: "The container exceeded its cgroup memory limit. Increase memory limits in Compose/K8s or tune JVM/Node heap flags.",
      },
    ],
    productionChecklist: [
      "Never run containers as root — declare a non-root USER directive.",
      "Use minimal base images such as distroless or alpine.",
      "Order Dockerfile commands from least to most frequently modified to maximize layer caching.",
      "Always set resource limits (--memory and --cpus).",
      "Store ephemeral state outside containers via persistent volumes.",
    ],
  },
  {
    slug: "kubernetes",
    name: "Kubernetes",
    category: "Containers & Orchestration",
    tagline: "Production-grade container orchestration for automated scaling, healing, and rollout.",
    summary:
      "Kubernetes (K8s) provides declarative infrastructure management at cluster scale. It continuously compares the desired state declared in manifests against real cluster state, automatically reconciling pods, load balancing traffic, rolling out zero-downtime updates, and restarting failed workloads.",
    difficulty: "advanced",
    estimatedHours: "8-12 hrs",
    color: "#326ce5",
    accentBg: "rgba(50, 108, 229, 0.08)",
    iconName: "kubernetes",
    associatedSkillSlug: "kubernetes",
    relatedPathSlug: "devops-engineer",
    relatedPathName: "DevOps Engineer",
    architecture: {
      title: "Control Plane & Worker Architecture",
      explanation:
        "The control plane (kube-apiserver backed by etcd, kube-scheduler, kube-controller-manager) manages desired state. Worker nodes run kubelet, container runtime, and kube-proxy to schedule and network pods.",
      components: [
        { name: "kube-apiserver", role: "Central REST API gateway validating and persisting state to etcd." },
        { name: "kube-scheduler", role: "Assigns unscheduled Pods to optimal worker nodes based on resources & affinity." },
        { name: "kubelet", role: "Agent on each node ensuring containers described in PodSpecs are running and healthy." },
        { name: "kube-proxy", role: "Maintains network rules on nodes using iptables/IPVS to route ClusterIP traffic." },
      ],
    },
    keyConcepts: [
      { term: "Pod", definition: "The smallest deployable computing unit, consisting of one or more co-located containers sharing network IP and storage." },
      { term: "Deployment & ReplicaSet", definition: "Declarative updates for Pods with replica management, rolling update strategies, and rollback capabilities." },
      { term: "Service & Ingress", definition: "Stable DNS endpoints (ClusterIP, NodePort, LoadBalancer) routing traffic to dynamic ephemeral Pod IPs." },
      { term: "ConfigMap & Secret", definition: "Decoupling configuration and sensitive credentials from container image binaries." },
    ],
    cheatsheet: [
      { command: "kubectl get pods -A -o wide", desc: "List all pods across all namespaces with assigned node IPs", category: "Inspect" },
      { command: "kubectl describe pod <pod-name> -n <ns>", desc: "View detailed pod lifecycle events, conditions and errors", category: "Debug" },
      { command: "kubectl logs -f <pod-name> -c <container> --previous", desc: "Stream logs from a previous crashed container instance", category: "Debug" },
      { command: "kubectl apply -f manifest.yaml", desc: "Apply declarative resource configuration to the cluster", category: "Deploy" },
      { command: "kubectl scale deployment/<name> --replicas=5", desc: "Imperatively scale replica count of a deployment", category: "Scale" },
      { command: "kubectl rollout restart deployment/<name>", desc: "Trigger a graceful rolling restart of all pods in deployment", category: "Rollout" },
    ],
    pitfalls: [
      {
        issue: "CrashLoopBackOff",
        symptom: "Pod repeatedly crashes on startup and enters exponential backoff.",
        fix: "Check 'kubectl logs <pod> --previous' and 'kubectl describe pod <pod>'. Common causes include missing environment variables, bad config files, or failed database connectivity.",
      },
      {
        issue: "ImagePullBackOff / ErrImagePull",
        symptom: "Kubelet cannot fetch container image from registry.",
        fix: "Verify image repository name and tag spelling. Check imagePullSecrets for private registry credentials.",
      },
    ],
    productionChecklist: [
      "Always define requests and limits for both CPU and memory.",
      "Configure liveness, readiness, and startup probes properly.",
      "Use PodDisruptionBudgets (PDB) to safeguard availability during node drains.",
      "Deploy across multiple availability zones using topologySpreadConstraints.",
      "Enforce network policies to restrict pod-to-pod east-west traffic.",
    ],
  },
  {
    slug: "linux",
    name: "Linux & Bash",
    category: "Core Systems",
    tagline: "The foundational operating system of internet infrastructure, cloud servers, and containers.",
    summary:
      "Linux powers over 90% of the public cloud. Mastering POSIX fundamentals, process scheduling, Unix permissions, file descriptors, pipes, and text filtering tools like grep, awk, and sed is essential for diagnosing production incidents and managing infrastructure.",
    difficulty: "beginner",
    estimatedHours: "4-6 hrs",
    color: "#e95420",
    accentBg: "rgba(233, 84, 32, 0.08)",
    iconName: "linux",
    associatedSkillSlug: "linux",
    relatedPathSlug: "devops-engineer",
    relatedPathName: "DevOps Engineer",
    architecture: {
      title: "Linux Kernel & Userspace Boundary",
      explanation:
        "The Linux kernel controls hardware, memory paging, and process scheduling. Applications in userspace communicate with the kernel through system calls (syscalls like open, read, fork, clone, epoll).",
      components: [
        { name: "VFS (Virtual File System)", role: "Abstracts ext4, xfs, overlayfs, procfs, and sysfs under a unified hierarchical tree." },
        { name: "Systemd / Init", role: "PID 1 process manager supervising system services, cgroups, and journal logs." },
        { name: "Standard Streams", role: "FD 0 (stdin), FD 1 (stdout), FD 2 (stderr) piped between composable Unix utilities." },
        { name: "Process Scheduler", role: "Completely Fair Scheduler (CFS) allocating CPU time slices to runnable threads." },
      ],
    },
    keyConcepts: [
      { term: "Permissions (rwx / octal)", definition: "File modes split into User, Group, and Other (e.g. 755 = rwxr-xr-x; 644 = rw-r--r--)." },
      { term: "Unix Philosophy", definition: "Write programs that do one thing well and compose them together via text streams and pipelines." },
      { term: "Signals (SIGTERM / SIGKILL)", definition: "Inter-process communications; SIGTERM (15) requests graceful shutdown, SIGKILL (9) halts process immediately." },
      { term: "Procfs (/proc)", definition: "Virtual filesystem providing a window into live kernel data structures, PID metrics, and networking." },
    ],
    cheatsheet: [
      { command: "ps aux | grep -v grep | sort -nrk 3,3 | head -n 10", desc: "List top 10 CPU-consuming processes on the server", category: "Processes" },
      { command: "chmod 755 script.sh && chown user:group script.sh", desc: "Set read/execute permissions and assign ownership", category: "Permissions" },
      { command: "grep -rn 'ERROR' /var/log/ | awk '{print $1, $4}' | uniq -c", desc: "Filter error logs and calculate incident frequency", category: "Text Processing" },
      { command: "find / -type f -size +100M -exec ls -lh {} \\;", desc: "Locate large files over 100MB consuming disk space", category: "Storage" },
      { command: "tar -czvf backup.tar.gz /path/to/data", desc: "Create a gzip-compressed archive from a target folder", category: "Archive" },
      { command: "journalctl -u nginx.service -f -n 50", desc: "Stream systemd service logs with 50 lines back-history", category: "Logs" },
    ],
    pitfalls: [
      {
        issue: "Permission Denied on executable",
        symptom: "bash: ./script.sh: Permission denied even though user owns the file.",
        fix: "The executable bit is missing. Run 'chmod +x script.sh'.",
      },
      {
        issue: "Zombie processes piling up (defunct)",
        symptom: "ps aux shows status Z. Resources aren't freed.",
        fix: "The parent process failed to reap child exit codes with waitpid(). Restart or terminate the parent process.",
      },
    ],
    productionChecklist: [
      "Disable root SSH password login; require SSH key authentication.",
      "Configure logrotate to prevent system logs from exhausting disk inodes.",
      "Monitor system load averages relative to physical/virtual CPU core counts.",
      "Set proper ulimits for file descriptors on high-throughput database/proxy nodes.",
      "Audit sudoers configuration to enforce principle of least privilege.",
    ],
  },
  {
    slug: "terraform",
    name: "Terraform",
    category: "IaC & Automation",
    tagline: "Declarative Infrastructure as Code for multi-cloud provisioning and lifecycle management.",
    summary:
      "HashiCorp Terraform enables engineers to codify cloud infrastructure in human-readable HCL (HashiCorp Configuration Language). Through state tracking, resource graphs, and dry-run execution plans, it brings version control, PR reviews, and automated verification to cloud architecture.",
    difficulty: "intermediate",
    estimatedHours: "6-8 hrs",
    color: "#7b42bc",
    accentBg: "rgba(123, 66, 188, 0.08)",
    iconName: "terraform",
    associatedSkillSlug: "terraform",
    relatedPathSlug: "devops-engineer",
    relatedPathName: "DevOps Engineer",
    architecture: {
      title: "Core Workflow & State Engine",
      explanation:
        "Terraform compiles configuration files into a Directed Acyclic Graph (DAG) of resource dependencies. It queries provider plugins via RPC to compute differences between reality and configuration, saving the result in a remote state file.",
      components: [
        { name: "Terraform Core", role: "Parses HCL, constructs resource dependency DAGs, and generates diff plans." },
        { name: "Provider Plugins", role: "Standalone executables (AWS, GCP, Azure, K8s) translating resources into cloud API calls." },
        { name: "State File (terraform.tfstate)", role: "Source of truth mapping real cloud resource IDs to declared HCL blocks." },
        { name: "State Backend (S3 + DynamoDB)", role: "Remote storage providing encrypted persistence and distributed locking." },
      ],
    },
    keyConcepts: [
      { term: "State & Drift", definition: "State records cloud reality. Drift occurs when someone makes manual console changes outside Terraform." },
      { term: "Plan vs Apply", definition: "Plan performs a non-destructive read diff. Apply executes the API calls to reach desired state." },
      { term: "Modules", definition: "Reusable containers for multiple resources that act as self-contained blueprints." },
      { term: "State Locking", definition: "Prevents concurrent execution collisions that could corrupt the state file." },
    ],
    cheatsheet: [
      { command: "terraform init -backend-config='bucket=my-state'", desc: "Initialize backend storage and download provider plugins", category: "Init" },
      { command: "terraform plan -out=tfplan", desc: "Generate execution plan showing additions, changes and destructions", category: "Plan" },
      { command: "terraform apply tfplan", desc: "Execute planned cloud infrastructure modifications safely", category: "Apply" },
      { command: "terraform state list", desc: "List all tracked resources within the active state backend", category: "State" },
      { command: "terraform fmt -recursive && terraform validate", desc: "Format code according to canonical style and check syntax", category: "Lint" },
      { command: "terraform destroy -target=module.vpc", desc: "Destroy targeted infrastructure components selectively", category: "Destroy" },
    ],
    pitfalls: [
      {
        issue: "State lock error (ConditionalCheckFailedException)",
        symptom: "Error acquiring the state lock: DynamoDB lock entry exists.",
        fix: "Ensure no other pipeline is running. If a previous run crashed, inspect the Lock ID and run 'terraform force-unlock <LOCK_ID>'.",
      },
      {
        issue: "Accidental resource destruction on rename",
        symptom: "Plan reports 1 to add, 1 to destroy when renaming an HCL identifier.",
        fix: "Use 'moved { from = old.res to = new.res }' blocks to update state mappings without tearing down live cloud assets.",
      },
    ],
    productionChecklist: [
      "Always store state in an encrypted remote backend with object versioning enabled.",
      "Configure automated distributed locking with DynamoDB or equivalent.",
      "Run 'terraform plan' on pull requests and require peer review before 'apply'.",
      "Pin exact provider versions in required_providers block.",
      "Never commit secrets, tokens, or plain-text passwords into .tf files.",
    ],
  },
  {
    slug: "aws",
    name: "Amazon Web Services (AWS)",
    category: "Cloud & Infrastructure",
    tagline: "The world's most comprehensive and broadly adopted cloud platform.",
    summary:
      "AWS provides on-demand compute, managed relational databases, object storage, and secure virtual private clouds. Mastering IAM policies, S3 lifecycle rules, EC2 compute configurations, and VPC subnets forms the backbone of cloud architecture.",
    difficulty: "intermediate",
    estimatedHours: "8-10 hrs",
    color: "#ff9900",
    accentBg: "rgba(255, 153, 0, 0.08)",
    iconName: "aws",
    associatedSkillSlug: "aws",
    relatedPathSlug: "devops-engineer",
    relatedPathName: "DevOps Engineer",
    architecture: {
      title: "Global Infrastructure & VPC Networking",
      explanation:
        "AWS regions contain isolated Availability Zones (AZs) connected through low-latency fiber. Virtual Private Clouds (VPCs) segment network CIDR blocks across public and private subnets with internet and NAT gateways.",
      components: [
        { name: "IAM (Identity & Access)", role: "Zero-trust identity boundary evaluating least-privilege JSON policy actions." },
        { name: "Amazon S3", role: "Object store providing 99.999999999% durability with tiering and bucket policies." },
        { name: "Amazon EC2", role: "Elastic virtual servers with EBS block volumes and security group firewalls." },
        { name: "VPC & Route Tables", role: "Isolated virtual networks controlling routing between subnets and gateways." },
      ],
    },
    keyConcepts: [
      { term: "IAM Roles vs Users", definition: "Users represent humans with long-lived keys. Roles are assumed dynamically by EC2/Lambda with temporary STS credentials." },
      { term: "Public vs Private Subnets", definition: "Public subnets route 0.0.0.0/0 to an Internet Gateway. Private subnets route outbound traffic via a NAT Gateway." },
      { term: "Security Groups vs NACLs", definition: "Security groups are stateful host firewalls. Network ACLs are stateless subnet-level packet filters." },
      { term: "S3 Storage Classes", definition: "Standard, Infrequent Access, and Glacier Deep Archive for automated cost optimization." },
    ],
    cheatsheet: [
      { command: "aws sts get-caller-identity", desc: "Verify active AWS account ID, IAM ARN and role credentials", category: "Auth" },
      { command: "aws s3 ls && aws s3 sync ./dist s3://my-bucket/ --delete", desc: "Synchronize local build output to target S3 bucket", category: "Storage" },
      { command: "aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress]'", desc: "List EC2 instances, state and public IPs", category: "Compute" },
      { command: "aws logs tail /aws/lambda/my-func --follow", desc: "Live stream CloudWatch logs from a serverless function", category: "Logs" },
      { command: "aws iam simulate-principal-policy --policy-source-arn <arn> --action s3:PutObject", desc: "Simulate IAM policy evaluation against specific action", category: "IAM" },
    ],
    pitfalls: [
      {
        issue: "Access Denied (HTTP 403) on S3 upload",
        symptom: "An error occurred (AccessDenied) when calling the PutObject operation.",
        fix: "Check IAM policy permissions for s3:PutObject, verify S3 bucket policy restrictions, and inspect 'Block Public Access' settings.",
      },
      {
        issue: "EC2 instance unreachable via SSH",
        symptom: "Connection timed out on port 22.",
        fix: "Ensure Security Group allows inbound TCP port 22 from your IP, the subnet route table points to an Internet Gateway, and instance has a public IP.",
      },
    ],
    productionChecklist: [
      "Enforce Multi-Factor Authentication (MFA) on all root and human IAM accounts.",
      "Eliminate hardcoded access keys — use IAM Roles and AWS Secrets Manager.",
      "Enable AWS CloudTrail across all regions for audit compliance.",
      "Implement S3 bucket versioning and default KMS server-side encryption.",
      "Set AWS Budgets and cost anomaly detection alerts.",
    ],
  },
  {
    slug: "git",
    name: "Git",
    category: "Core Systems",
    tagline: "Distributed version control powering software development collaboration.",
    summary:
      "Git tracks changes in source code across distributed teams. Understanding Git's internal directed acyclic graph (DAG) of commits, tree objects, and blob hashes demystifies rebasing, cherry-picking, merge conflict resolution, and atomic commit practices.",
    difficulty: "beginner",
    estimatedHours: "4-6 hrs",
    color: "#f05032",
    accentBg: "rgba(240, 80, 50, 0.08)",
    iconName: "git",
    associatedSkillSlug: "git",
    relatedPathSlug: "devops-engineer",
    relatedPathName: "DevOps Engineer",
    architecture: {
      title: "Content-Addressable Object Storage",
      explanation:
        "Every file, directory, and commit in Git is an immutable SHA-1/SHA-256 hashed object in the .git/objects database. Branches are simply lightweight pointer references to specific commit hashes.",
      components: [
        { name: "Working Tree", role: "The sandbox filesystem files you see and edit directly." },
        { name: "Index / Staging Area", role: "Prepared state scheduled to be committed in the next revision snapshot." },
        { name: "Commit Object", role: "Immutable node containing tree hash, author, committer, message, and parent pointer." },
        { name: "Refs / Branches", role: "Movable pointers stored in .git/refs/heads/ referencing the tip of a line of work." },
      ],
    },
    keyConcepts: [
      { term: "Rebase vs Merge", definition: "Merge preserves historical chronology with a merge commit. Rebase replays commits linearly on top of a new base." },
      { term: "Detached HEAD", definition: "HEAD is pointing directly to a specific commit hash rather than a named branch pointer." },
      { term: "Fast-Forward", definition: "When target branch has no divergent commits, Git simply advances the branch pointer without creating a merge commit." },
      { term: "Reflog", definition: "Chronological log of where HEAD and branch references have pointed over the last 90 days — your ultimate safety net." },
    ],
    cheatsheet: [
      { command: "git status -sb", desc: "Short-format status showing active branch and staged modifications", category: "Status" },
      { command: "git log --oneline --graph --decorate -n 15", desc: "Display visual commit tree graph with branch tags", category: "History" },
      { command: "git checkout -b feature/auth-flow main", desc: "Branch off main and switch working directory immediately", category: "Branch" },
      { command: "git add -p", desc: "Interactively stage specific code hunks rather than whole files", category: "Stage" },
      { command: "git commit --amend --no-edit", desc: "Incorporate staged changes into the most recent commit", category: "Commit" },
      { command: "git reflog && git reset --hard HEAD@{1}", desc: "Recover accidentally deleted commits or botched rebases", category: "Recovery" },
    ],
    pitfalls: [
      {
        issue: "Merge conflict markers in committed code",
        symptom: "<<<<<<< HEAD or >>>>>>> branch syntax committed accidentally.",
        fix: "Carefully inspect git diff before committing. Configure a graphical or terminal merge tool (e.g. vimdiff, vscode).",
      },
      {
        issue: "Secret or credentials committed to history",
        symptom: "API keys or passwords pushed to remote repository.",
        fix: "Rotating the credential immediately is mandatory. Rewrite Git history using git-filter-repo or BFG Repo-Cleaner.",
      },
    ],
    productionChecklist: [
      "Protect main/master branches with required pull request reviews and status checks.",
      "Write atomic commits with descriptive imperative messages ('Fix memory leak in websocket handler').",
      "Maintain a thorough .gitignore excluding .env, node_modules, and build artifacts.",
      "Sign commits using GPG or SSH keys for cryptographic authenticity.",
      "Never rebase or force-push shared public branch histories.",
    ],
  },
  {
    slug: "cicd",
    name: "CI/CD & GitHub Actions",
    category: "IaC & Automation",
    tagline: "Automated test suites, artifact packaging, and zero-downtime release pipelines.",
    summary:
      "Continuous Integration and Continuous Deployment (CI/CD) automates the delivery lifecycle from code push to production release. GitHub Actions coordinates ephemeral runners, caches dependencies, runs test matrices, builds OCI images, and deploys infrastructure.",
    difficulty: "intermediate",
    estimatedHours: "5-7 hrs",
    color: "#2088ff",
    accentBg: "rgba(32, 136, 255, 0.08)",
    iconName: "cicd",
    associatedSkillSlug: "cicd",
    relatedPathSlug: "devops-engineer",
    relatedPathName: "DevOps Engineer",
    architecture: {
      title: "Event-Driven Workflow Automation",
      explanation:
        "GitHub triggers workflows based on webhook events (push, pull_request, schedule). Workflows contain one or more jobs running on isolated virtual machine runners executing declarative steps.",
      components: [
        { name: "Workflow Triggers (on:)", role: "Defines event conditions that initiate pipeline execution." },
        { name: "Runners (GitHub-hosted / Self-hosted)", role: "Ephemeral Linux/macOS/Windows VMs executing workflow steps." },
        { name: "Job Dependencies (needs:)", role: "Constructs dependency graphs (e.g. test must pass before deploy runs)." },
        { name: "Secrets & Environments", role: "Encrypted credential store protected by approval gates and branch rules." },
      ],
    },
    keyConcepts: [
      { term: "Matrix Builds", definition: "Running tests simultaneously across multiple OS types and language versions (e.g., Node 18, 20, 22 on Ubuntu/macOS)." },
      { term: "Dependency Caching", definition: "Persisting node_modules or pip wheels between workflow runs via actions/cache to accelerate builds." },
      { term: "Artifact Passing", definition: "Uploading compiled binaries or test coverage reports in one job and downloading them in downstream jobs." },
      { term: "OIDC Federation", definition: "Authenticating directly to AWS/GCP without storing long-lived secret access keys in repository settings." },
    ],
    cheatsheet: [
      { command: "gh run list --limit 10", desc: "List status of the 10 most recent workflow runs via GitHub CLI", category: "CLI" },
      { command: "gh run watch <run-id>", desc: "Watch live progress of a running workflow execution in terminal", category: "CLI" },
      { command: "act -j test", desc: "Run GitHub Actions workflows locally inside Docker using the 'act' tool", category: "Local" },
      { command: "gh secret set AWS_ROLE_ARN --body 'arn:aws:iam::...'", desc: "Set an encrypted repository secret from command line", category: "Secrets" },
    ],
    pitfalls: [
      {
        issue: "Secret not available in pull_request from fork",
        symptom: "Workflow fails with empty environment variable.",
        fix: "GitHub masks secrets on pull_request from forks for security reasons. Use pull_request_target with strict verification if necessary.",
      },
      {
        issue: "Slow builds due to cache misses",
        symptom: "Every workflow run spends 5+ minutes redownloading dependencies.",
        fix: "Verify hashFiles('**/package-lock.json') key pattern and ensure cache path matches package manager directory.",
      },
    ],
    productionChecklist: [
      "Pin third-party Actions to exact commit SHAs rather than mutable tags like @v3.",
      "Use OpenID Connect (OIDC) instead of static cloud credentials.",
      "Set minimal permissions in the workflow permissions: block.",
      "Enforce branch protection requiring CI checks to pass before merging.",
      "Set job timeouts to avoid runaway bills from stuck processes.",
    ],
  },
  {
    slug: "observability",
    name: "Prometheus & Observability",
    category: "Observability & Reliability",
    tagline: "Metrics, log aggregation, and real-time operational telemetry for distributed systems.",
    summary:
      "Observability answers unknown-unknown questions about system health. Prometheus provides a pull-based time-series metrics engine with PromQL querying, paired with Alertmanager for intelligent paging and Grafana for operational visualization.",
    difficulty: "intermediate",
    estimatedHours: "6-8 hrs",
    color: "#e6522c",
    accentBg: "rgba(230, 82, 44, 0.08)",
    iconName: "observability",
    associatedSkillSlug: "observability",
    relatedPathSlug: "devops-engineer",
    relatedPathName: "DevOps Engineer",
    architecture: {
      title: "Metrics Scraping & Time-Series Engine",
      explanation:
        "Prometheus scrapes HTTP /metrics endpoints from targets discovered via Kubernetes API or static configs. It stores samples in a custom TSDB on local disk and evaluates alerting rules periodically.",
      components: [
        { name: "Prometheus Server", role: "Scrapes targets, stores time series in TSDB, and executes PromQL queries." },
        { name: "Exporters (node_exporter)", role: "Translates Linux kernel and application statistics into Prometheus text format." },
        { name: "Alertmanager", role: "Deduplicates, groups, and routes firing alerts to Slack, PagerDuty, or email." },
        { name: "Grafana", role: "Visualization dashboards rendering time-series queries into panels and graphs." },
      ],
    },
    keyConcepts: [
      { term: "The 4 Golden Signals", definition: "Latency (response time), Traffic (requests/sec), Errors (rate of 5xxs), and Saturation (CPU/memory capacity)." },
      { term: "Metric Types", definition: "Counter (monotonically increasing), Gauge (can rise and fall), Histogram (binned latency counts), Summary." },
      { term: "High Cardinality", definition: "Uncontrolled label values (e.g. user_id or IP addresses) that explode memory usage in time-series databases." },
      { term: "PromQL rate() vs irate()", definition: "rate() calculates per-second average rate over a time range; irate() calculates instantaneous rate between the last two data points." },
    ],
    cheatsheet: [
      { command: "rate(http_requests_total{status=~'5..'}[5m])", desc: "Calculate per-second rate of 5xx HTTP server errors over last 5 minutes", category: "PromQL" },
      { command: "sum by (service) (rate(http_requests_total[5m]))", desc: "Aggregate total request throughput grouped by microservice name", category: "PromQL" },
      { command: "histogram_quantile(0.99, sum(rate(http_duration_seconds_bucket[5m])) by (le))", desc: "Compute 99th percentile (P99) request latency across endpoints", category: "PromQL" },
      { command: "100 - (avg by (instance) (rate(node_cpu_seconds_total{mode='idle'}[5m])) * 100)", desc: "Calculate real-time CPU utilization percentage per node", category: "PromQL" },
    ],
    pitfalls: [
      {
        issue: "TSDB OOM crash due to high cardinality",
        symptom: "Prometheus memory usage spirals until killed by Linux kernel OOM killer.",
        fix: "Never inject request IDs, UUIDs, or timestamps as Prometheus label values. Keep label cardinality strictly bounded.",
      },
      {
        issue: "Flapping alerts causing pager fatigue",
        symptom: "Alerts fire and resolve every 60 seconds during minor traffic spikes.",
        fix: "Add a 'for: 5m' clause to alerting rules so conditions must persist continuously before triggering notification.",
      },
    ],
    productionChecklist: [
      "Define Service Level Objectives (SLOs) and Error Budgets for critical services.",
      "Implement the 4 Golden Signals across all external and internal APIs.",
      "Audit metrics for high cardinality labels before promoting to staging.",
      "Test alert routing paths and PagerDuty escalations in game-day drills.",
      "Configure retention policies and remote storage write (Cortex/Thanos/Mimir) for long-term historical metrics.",
    ],
  },
  {
    slug: "platform-engineering",
    name: "Platform Engineering & ArgoCD",
    category: "Containers & Orchestration",
    tagline: "Internal Developer Platforms (IDPs), GitOps delivery, and automated admission policies.",
    summary:
      "Platform Engineering treats infrastructure as a product, providing software teams with golden paths and self-service portals. By combining GitOps delivery engines like ArgoCD with policy enforcement (Kyverno, OPA Gatekeeper), platform teams enable secure, frictionless software shipping.",
    difficulty: "advanced",
    estimatedHours: "8-10 hrs",
    color: "#ff5722",
    accentBg: "rgba(255, 87, 34, 0.08)",
    iconName: "platform-engineering",
    associatedSkillSlug: "platform-engineering",
    relatedPathSlug: "devops-engineer",
    relatedPathName: "DevOps Engineer",
    architecture: {
      title: "GitOps Declarative Reconciliation Loop",
      explanation:
        "ArgoCD continuously monitors a Git repository holding Kubernetes manifests or Helm charts. When changes merge to main, ArgoCD reconciles the cluster to match the Git commit, detecting and correcting manual drift.",
      components: [
        { name: "Git Source of Truth", role: "Repository storing all desired Kubernetes manifests, Helm values, and Kustomize overlays." },
        { name: "ArgoCD Application Controller", role: "Compares live cluster resources against desired state in Git." },
        { name: "Admission Controller (Kyverno/OPA)", role: "Intercepts API requests to reject non-compliant manifests before scheduling." },
        { name: "Developer Service Catalog", role: "Self-service scaffolding interface (e.g. Backstage) generating boilerplate repos." },
      ],
    },
    keyConcepts: [
      { term: "GitOps Principle", definition: "Declarative infrastructure versioned in Git; software agents automatically ensure live state equals target state." },
      { term: "Golden Path", definition: "An opinionated, well-supported template providing developers the path of least resistance to production." },
      { term: "Admission Webhook", definition: "Kubernetes mutating and validating webhooks that inspect incoming JSON objects." },
      { term: "Self-Healing & Out-of-Sync", definition: "When a developer modifies a resource via kubectl, ArgoCD immediately overwrites it with the Git version." },
    ],
    cheatsheet: [
      { command: "argocd app list", desc: "List all deployed platform applications and their health/sync statuses", category: "ArgoCD" },
      { command: "argocd app sync <app-name>", desc: "Trigger manual reconciliation between Git repository and cluster state", category: "ArgoCD" },
      { command: "argocd app diff <app-name>", desc: "Display live diff between Git manifests and running cluster resources", category: "ArgoCD" },
      { command: "kubectl get cpol -A", desc: "List all cluster-wide Kyverno security and compliance policies", category: "Policy" },
    ],
    pitfalls: [
      {
        issue: "Sync loops / infinite sync fighting",
        symptom: "ArgoCD repeatedly marks app OutOfSync due to dynamic fields (e.g. status or default mutations).",
        fix: "Configure ignoreDifferences in the Application manifest to omit managed fields like replicas or default mutation annotations.",
      },
    ],
    productionChecklist: [
      "Store production manifests in a repository separate from application source code.",
      "Enforce mandatory policies rejecting containers running as root or without resource limits.",
      "Enable automated rollback on failed health checks.",
      "Provide developers with clear error messages in self-service scaffolding templates.",
    ],
  },
  {
    slug: "networking",
    name: "Computer Networking & DNS",
    category: "Core Systems",
    tagline: "TCP/IP models, DNS resolution, port routing, and HTTP/HTTPS protocol mechanics.",
    summary:
      "All distributed systems communicate across network boundaries. Understanding packet flow, CIDR subnetting, socket lifecycles (SYN, ACK, FIN, TIME_WAIT), DNS lookup chains (A, CNAME, NS, SOA), and TLS handshakes is critical for diagnosing microservice latency and connectivity outages.",
    difficulty: "beginner",
    estimatedHours: "4-6 hrs",
    color: "#00a896",
    accentBg: "rgba(0, 168, 150, 0.08)",
    iconName: "networking",
    associatedSkillSlug: "networking",
    relatedPathSlug: "devops-engineer",
    relatedPathName: "DevOps Engineer",
    architecture: {
      title: "TCP/IP Stack & Socket Lifecycle",
      explanation:
        "Data travels down from the Application layer (HTTP) through Transport (TCP), Internet (IP), and Network Interface layers. Socket connections establish via a 3-way handshake (SYN, SYN-ACK, ACK) and close via FIN/ACK.",
      components: [
        { name: "DNS Resolver", role: "Translates human domain names into IP addresses via recursive hierarchy." },
        { name: "TCP Stack", role: "Provides reliable, ordered, error-checked delivery of byte streams between hosts." },
        { name: "IP & Routing", role: "Directs packets hop-by-hop across networks according to kernel routing tables." },
        { name: "TLS Engine", role: "Encrypts communication channel using asymmetric key exchange and symmetric ciphers." },
      ],
    },
    keyConcepts: [
      { term: "CIDR Notation", definition: "Classless Inter-Domain Routing (e.g., 10.0.0.0/16 provides 65,536 addresses; /24 provides 256 addresses)." },
      { term: "DNS Record Types", definition: "A (IPv4), AAAA (IPv6), CNAME (canonical alias), MX (mail), TXT (domain verification/SPF)." },
      { term: "TIME_WAIT Socket State", definition: "Ensures the remote end received the final ACK and allows old duplicate packets to expire in the network." },
      { term: "MTU (Maximum Transmission Unit)", definition: "Largest packet size (typically 1500 bytes) that can be transmitted without fragmentation." },
    ],
    cheatsheet: [
      { command: "curl -iv https://api.example.com", desc: "Inspect detailed TLS handshake, cipher suite, and HTTP headers", category: "HTTP" },
      { command: "dig +trace example.com", desc: "Trace full recursive DNS resolution path from root servers down", category: "DNS" },
      { command: "ss -tulpn", desc: "Display all active listening TCP and UDP sockets with owning process PID", category: "Sockets" },
      { command: "traceroute -n 8.8.8.8", desc: "Print list of intermediate network router hops to destination IP", category: "Routing" },
      { command: "tcpdump -i eth0 -n 'port 80 or port 443'", desc: "Capture real-time packet headers on HTTP/HTTPS ports", category: "Capture" },
    ],
    pitfalls: [
      {
        issue: "DNS resolution failure in containers",
        symptom: "Could not resolve host: api.service.internal.",
        fix: "Check /etc/resolv.conf inside the container. Verify kube-dns or CoreDNS pod health and network policies allowing UDP port 53.",
      },
    ],
    productionChecklist: [
      "Use connection pooling and keep-alive headers to avoid TIME_WAIT socket exhaustion.",
      "Tune DNS TTLs appropriately: low (60s) before migrations; higher (300-3600s) for steady-state caching.",
      "Enforce TLS 1.3 across all public-facing load balancers.",
      "Monitor TCP retransmission rates as an early indicator of network packet loss.",
    ],
  },
  {
    slug: "rag",
    name: "RAG & Vector Databases",
    category: "AI & LLM Systems",
    tagline: "Retrieval-Augmented Generation: semantic embeddings, vector indices, and context synthesis.",
    summary:
      "Retrieval-Augmented Generation (RAG) grounds LLMs on external authoritative knowledge without expensive fine-tuning. By chunking documents, calculating dense semantic embeddings, indexing with HNSW or IVF, and retrieving relevant passages at runtime, RAG prevents hallucinations and provides cited answers.",
    difficulty: "intermediate",
    estimatedHours: "6-8 hrs",
    color: "#6366f1",
    accentBg: "rgba(99, 102, 241, 0.08)",
    iconName: "rag",
    associatedSkillSlug: "rag",
    relatedPathSlug: "ai-engineer",
    relatedPathName: "AI Engineer",
    architecture: {
      title: "The RAG Ingestion & Query Pipeline",
      explanation:
        "During ingestion, documents are parsed, chunked, and embedded into vectors stored in an index. At query time, the user prompt is converted to a query vector, matched against top-k similar chunks, and synthesized by the LLM.",
      components: [
        { name: "Document Parser & Chunker", role: "Splits PDFs, Markdown, and HTML into semantic chunks with overlap." },
        { name: "Embedding Model", role: "Transforms text into high-dimensional vectors (e.g. OpenAI text-embedding-3)." },
        { name: "Vector Database (Qdrant/Pinecone/pgvector)", role: "Performs fast approximate nearest neighbor (ANN) search." },
        { name: "Reranker (Cohere/BGE)", role: "Cross-encoder scoring retrieved candidates to place highest quality context first." },
      ],
    },
    keyConcepts: [
      { term: "Cosine vs Dot Product", definition: "Measures of vector proximity; for normalized embeddings, dot product equals cosine similarity and computes faster." },
      { term: "Hybrid Search (Dense + Sparse)", definition: "Combines dense vector semantic search with BM25 keyword matching to capture exact technical terms and acronyms." },
      { term: "Lost in the Middle", definition: "The tendency of LLMs to attend best to tokens at the very beginning and end of long context prompts, ignoring mid-prompt information." },
      { term: "Context Window Packing", definition: "Fitting relevant chunks within the model context limit while preserving room for reasoning and generation." },
    ],
    cheatsheet: [
      { command: "python -m pip install qdrant-client sentence-transformers", desc: "Install vector DB client and local open-source embedding models", category: "Setup" },
      { command: "python ingest.py --chunk-size 512 --overlap 50", desc: "Run ingestion pipeline splitting documents and building index", category: "Ingest" },
      { command: "python query.py --top-k 5 --hybrid", desc: "Query vector index using combined semantic and keyword retrieval", category: "Query" },
    ],
    pitfalls: [
      {
        issue: "Hallucinations despite RAG retrieval",
        symptom: "Model invents answers not found in the provided context documents.",
        fix: "Add strict system prompt constraints ('Answer strictly using the provided context. If the answer cannot be found, respond with I do not know'). Use a reranker to filter out irrelevant chunks.",
      },
    ],
    productionChecklist: [
      "Evaluate retrieval quality using RAGAS or TruLens (Context Precision, Recall, Faithfulness).",
      "Implement hybrid search (vector + BM25) for technical documentation with code identifiers.",
      "Use rerankers before passing retrieved context into expensive frontier model prompts.",
      "Track latency across every step: embedding calculation, vector query, and model generation.",
    ],
  },
  {
    slug: "agents",
    name: "Autonomous AI Agents",
    category: "AI & LLM Systems",
    tagline: "ReAct loops, function calling, stateful graphs, and multi-agent orchestration.",
    summary:
      "AI Agents transition LLMs from passive text generators to proactive decision-makers capable of taking real-world actions. By connecting models to OpenAPI schemas, database queries, and terminal tools within iterative feedback loops, agents solve open-ended coding, ops, and research tasks.",
    difficulty: "advanced",
    estimatedHours: "8-10 hrs",
    color: "#10b981",
    accentBg: "rgba(16, 185, 129, 0.08)",
    iconName: "agents",
    associatedSkillSlug: "agents",
    relatedPathSlug: "ai-engineer",
    relatedPathName: "AI Engineer",
    architecture: {
      title: "ReAct & State Machine Execution",
      explanation:
        "The agent loop takes user objectives, generates thoughts and tool calls, receives execution outputs from the host runtime, appends observations to memory, and repeats until the goal is satisfied or a breakpoint is reached.",
      components: [
        { name: "Planner & Reasoner", role: "LLM decomposing complex objectives into discrete step-by-step actions." },
        { name: "Tool Registry", role: "Validated JSON Schema contracts declaring callable APIs, shell commands, and DB queries." },
        { name: "Memory & State Store", role: "Short-term message history and long-term key-value or vector memory." },
        { name: "Guardrails & Human-in-the-Loop", role: "Approval gates for destructive actions (e.g. deleting resources or executing payments)." },
      ],
    },
    keyConcepts: [
      { term: "Tool Calling Protocol", definition: "Model emits structured JSON with function name and arguments; client executes and returns result." },
      { term: "LangGraph / State Machines", definition: "Modeling agent workflows as directed cyclical graphs with explicit state schemas and conditional edges." },
      { term: "Subagent Delegation", definition: "Spawning specialized subagents for subtasks (e.g. research agent, coding agent, reviewer agent)." },
      { term: "Context Compaction", definition: "Summarizing or pruning past tool outputs to avoid exhausting model context window limits." },
    ],
    cheatsheet: [
      { command: "python agent.py --goal 'Diagnose pod crash in prod'", desc: "Launch autonomous agent with terminal tools enabled", category: "Run" },
      { command: "python -m pytest tests/test_agent_tools.py", desc: "Unit test tool schema definitions and error handling logic", category: "Test" },
    ],
    pitfalls: [
      {
        issue: "Infinite tool invocation loops",
        symptom: "Agent calls the same failing command repeatedly without progressing.",
        fix: "Set strict max_iterations limits (e.g. 15 steps) and instruct the model in system prompt to pivot if a tool errors twice consecutively.",
      },
    ],
    productionChecklist: [
      "Always require human confirmation before executing irreversible or destructive operations.",
      "Sanitize and validate all tool parameters against strict Pydantic/JSON schemas.",
      "Implement hard execution step and budget limits to prevent runaway API spend.",
      "Log full execution traces using OpenTelemetry or LangSmith for post-mortem debugging.",
    ],
  },
  {
    slug: "prompt-engineering",
    name: "Prompt Engineering",
    category: "AI & LLM Systems",
    tagline: "Few-shot learning, Chain-of-Thought, system prompting, and structured JSON output.",
    summary:
      "Prompt engineering is the art and science of steering generative models toward deterministic, reliable, and high-accuracy results. Techniques like Chain-of-Thought (CoT), few-shot exemplars, system persona constraints, and JSON schema enforcement convert unstructured text into production data.",
    difficulty: "beginner",
    estimatedHours: "4-5 hrs",
    color: "#f59e0b",
    accentBg: "rgba(245, 158, 11, 0.08)",
    iconName: "prompt-engineering",
    associatedSkillSlug: "prompt-engineering",
    relatedPathSlug: "ai-engineer",
    relatedPathName: "AI Engineer",
    architecture: {
      title: "Prompt Anatomy & Attention Mechanism",
      explanation:
        "Modern LLM context is structured into System, Developer, User, and Assistant message turns. Tokens are weighted by self-attention heads, with system constraints establishing high-priority boundary conditions.",
      components: [
        { name: "System Message", role: "Sets global persona, boundaries, tone, and negative constraints." },
        { name: "Few-Shot Exemplars", role: "Demonstrates target input/output formatting and edge-case behavior." },
        { name: "Reasoning Scaffold", role: "Encourages step-by-step thinking before final answer emission." },
        { name: "JSON Schema Constraints", role: "Constrains model token logits to valid grammatical tokens of target schema." },
      ],
    },
    keyConcepts: [
      { term: "Chain-of-Thought (CoT)", definition: "Directing the model to 'think step by step' generates intermediate reasoning tokens that drastically improve math and logic accuracy." },
      { term: "Structured Outputs", definition: "API-level grammar constraints guaranteeing 100% adherence to valid JSON schemas." },
      { term: "Temperature & Top-p", definition: "Sampling parameters: lower temperature (0.0–0.2) yields deterministic outputs; higher temperature (0.7–1.0) yields creative prose." },
      { term: "Prompt Injection", definition: "Security vulnerability where untrusted user input overrides system instructions to hijack model actions." },
    ],
    cheatsheet: [
      { command: "python eval_prompts.py --dataset test.jsonl --metric exact_match", desc: "Run automated evaluation comparing prompt variations across benchmark test cases", category: "Eval" },
    ],
    pitfalls: [
      {
        issue: "JSON parsing errors in production",
        symptom: "Model wraps JSON in markdown fences (```json) or appends conversational pleasantries.",
        fix: "Use native response_format: { type: 'json_object' } or strict structured output schemas rather than relying solely on text prompting.",
      },
    ],
    productionChecklist: [
      "Version control all prompt templates in Git with commit histories.",
      "Run regression test suites against candidate prompts before deploying updates.",
      "Sanitize user inputs to mitigate direct and indirect prompt injection attacks.",
      "Monitor token usage and latency metrics per prompt template.",
    ],
  },
  {
    slug: "model-serving",
    name: "Model Serving & vLLM",
    category: "MLOps",
    tagline: "High-throughput LLM inference, PagedAttention, and GPU memory optimization.",
    summary:
      "Serving modern LLMs in production requires maximizing GPU compute utilization and handling bursty real-time concurrency. vLLM and Triton Inference Server implement PagedAttention to eliminate memory fragmentation, alongside continuous batching to deliver low-latency tokens.",
    difficulty: "advanced",
    estimatedHours: "8-10 hrs",
    color: "#ec4899",
    accentBg: "rgba(236, 72, 153, 0.08)",
    iconName: "model-serving",
    associatedSkillSlug: "model-serving",
    relatedPathSlug: "mlops-engineer",
    relatedPathName: "MLOps Engineer",
    architecture: {
      title: "PagedAttention & Continuous Batching",
      explanation:
        "Instead of allocating contiguous static VRAM blocks for key-value caches, vLLM manages KV caches like OS virtual memory pages. New incoming requests are spliced dynamically into running batch iterations.",
      components: [
        { name: "PagedAttention Engine", role: "Partitions KV cache into non-contiguous physical memory blocks." },
        { name: "Continuous Scheduler", role: "Dynamically merges new prompt prefill tokens with active decode iterations." },
        { name: "Tensor Parallelism", role: "Splits model layer weights across multiple GPUs using NCCL communication." },
        { name: "OpenAI-Compatible API", role: "Exposes standard /v1/chat/completions endpoint for seamless integration." },
      ],
    },
    keyConcepts: [
      { term: "Time to First Token (TTFT)", definition: "Latency required to process the input prompt (prefill phase) and generate the very first token." },
      { term: "Time Per Output Token (TPOT)", definition: "Latency between subsequent generated tokens during the autoregressive decode phase." },
      { term: "KV Cache Fragmentation", definition: "Memory wasted by standard inference engines pre-allocating max context lengths." },
      { term: "Quantization (AWQ / GPTQ / FP8)", definition: "Reducing model weight precision from FP16 to 8-bit or 4-bit to halve memory bandwidth requirements." },
    ],
    cheatsheet: [
      { command: "vllm serve meta-llama/Llama-3.1-8B-Instruct --port 8000 --gpu-memory-utilization 0.90", desc: "Launch vLLM server with 90% GPU memory allocation", category: "Serve" },
      { command: "vllm serve mistralai/Mistral-7B-v0.1 --tensor-parallel-size 2", desc: "Shard model inference across 2 GPUs in parallel", category: "Parallel" },
      { command: "curl http://localhost:8000/v1/models", desc: "Check live serving health and list loaded model weights", category: "Check" },
    ],
    pitfalls: [
      {
        issue: "CUDA Out of Memory on heavy traffic spikes",
        symptom: "Engine crashes with RuntimeError: CUDA out of memory during decode.",
        fix: "Tune --max-num-seqs and --max-model-len. Ensure --gpu-memory-utilization leaves enough headroom for activation buffers.",
      },
    ],
    productionChecklist: [
      "Benchmark TTFT and throughput (tokens/sec) under simulated production concurrency.",
      "Deploy with autoscaling based on queue depth and GPU memory saturation.",
      "Enable prefix caching for applications with repeated long system prompts.",
      "Implement model warmup requests before opening endpoints to user traffic.",
    ],
  },
  {
    slug: "model-tracking",
    name: "Model Tracking & MLflow",
    category: "MLOps",
    tagline: "Experiment tracking, parameter logging, model registries, and artifact lineage.",
    summary:
      "Machine learning development is empirical and iterative. MLflow provides an open-source platform to track training hyperparameters, metrics curves, model weights, and data lineage across teams, streamlining the progression from notebook experiment to registered production artifact.",
    difficulty: "intermediate",
    estimatedHours: "5-7 hrs",
    color: "#0284c7",
    accentBg: "rgba(2, 132, 199, 0.08)",
    iconName: "model-tracking",
    associatedSkillSlug: "model-tracking",
    relatedPathSlug: "mlops-engineer",
    relatedPathName: "MLOps Engineer",
    architecture: {
      title: "MLflow Tracking Server & Model Registry",
      explanation:
        "Data scientists log parameters and metrics via the Python SDK. The tracking server persists metadata into a SQL database (PostgreSQL/SQLite) and stores heavy weight binaries in object storage (S3/GCS).",
      components: [
        { name: "Tracking Server API", role: "Central REST server receiving run metrics, parameters, and tags." },
        { name: "Backend Store (PostgreSQL)", role: "Stores tabular metadata: run IDs, experiment names, metrics histories." },
        { name: "Artifact Store (S3/MinIO)", role: "Stores serialized model files (.pt, .onnx), graphs, and requirements.txt." },
        { name: "Model Registry", role: "Provides stage transitions (Staging, Production, Archived) and semantic versioning." },
      ],
    },
    keyConcepts: [
      { term: "Run vs Experiment", definition: "An experiment groups related efforts (e.g. sentiment-classifier); a run is a single training job execution." },
      { term: "Autologging", definition: "Automatic extraction of metrics, parameters, and models from frameworks like PyTorch, Scikit-learn, and XGBoost." },
      { term: "Model Signature", definition: "Input and output data type schema attached to a model so clients validate payload formats before inference." },
      { term: "Reproducibility", definition: "Recording exact Git commit SHA, dataset version, and environment dependencies for every run." },
    ],
    cheatsheet: [
      { command: "mlflow server --backend-store-uri postgresql://... --default-artifact-root s3://my-bucket", desc: "Launch production tracking server with Postgres and S3", category: "Server" },
      { command: "mlflow ui --port 5000", desc: "Launch local web UI to compare loss curves and parameters", category: "UI" },
    ],
    pitfalls: [
      {
        issue: "Artifact upload timeout on large weights",
        symptom: "Failed to upload model weights exceeding multiple gigabytes.",
        fix: "Configure S3 multipart uploads and ensure tracking server has adequate network bandwidth and IAM permissions.",
      },
    ],
    productionChecklist: [
      "Log input dataset hashes or DVC commit hashes alongside model metrics.",
      "Enforce mandatory model signatures on all registered candidates.",
      "Automate deployment promotion via webhooks triggered on Model Registry stage changes.",
      "Back up tracking server metadata database regularly.",
    ],
  },
];

export function getTool(slug: string): ToolDefinition | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: ToolDefinition["category"]): ToolDefinition[] {
  return tools.filter((t) => t.category === category);
}

export const toolCategories: ToolDefinition["category"][] = [
  "Containers & Orchestration",
  "Core Systems",
  "Cloud & Infrastructure",
  "IaC & Automation",
  "AI & LLM Systems",
  "MLOps",
  "Observability & Reliability",
];
