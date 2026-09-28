import type { Skill } from "../types";

export const platformSkill: Skill = {
  slug: "platform-engineering",
  title: "Platform Engineering",
  summary: "Golden paths, service catalogs and GitOps — productizing the platform.",
  topics: [
    {
      slug: "01-golden-paths",
      title: "Golden Path Templates",
      summary: "Make the right way the easy way.",
      tasks: [
        {
          slug: "plat-scaffold-template",
          title: "Scaffold a Service Template",
          type: "practice",
          difficulty: "beginner",
          description:
            "A golden path starts as a template repository: everything a new service needs, pre-wired. Scaffold one — structure, Dockerfile, CI workflow — exactly like a platform team would ship it.",
          requirements: [
            "Directory ~/templates/service-template exists",
            "It contains src/, tests/, Dockerfile and .github/workflows/ci.yml",
          ],
          env: "ubuntu:24.04",
          checks: [
            { kind: "directory", path: "/home/learner/templates/service-template", label: "template directory" },
            { kind: "directory", path: "/home/learner/templates/service-template/src", label: "src/ present" },
            { kind: "directory", path: "/home/learner/templates/service-template/tests", label: "tests/ present" },
            { kind: "file", path: "/home/learner/templates/service-template/Dockerfile", label: "Dockerfile present" },
            { kind: "file", path: "/home/learner/templates/service-template/.github/workflows/ci.yml", label: "CI workflow present" },
          ],
          steps: [
            {
              title: "Create the template root",
              detail:
                "Templates live in their own repository; here, one directory stands in for it.",
              command: "mkdir -p ~/templates/service-template",
            },
            {
              title: "Add the source and test directories",
              detail:
                "Convention over configuration: every service gets the same layout, so any engineer can navigate any repo.",
              command: "mkdir -p ~/templates/service-template/src ~/templates/service-template/tests",
            },
            {
              title: "Write the Dockerfile",
              detail:
                "A pre-written, hardened Dockerfile is the heart of a golden path — teams inherit best practice without reading a wiki.",
              command: "echo 'FROM python:3.12-slim\\nCOPY src /app\\nCMD [\"python\", \"/app/main.py\"]' > ~/templates/service-template/Dockerfile",
            },
            {
              title: "Write the CI workflow",
              detail:
                "The workflow directory is nested — mkdir -p creates all levels.",
              command: "mkdir -p ~/templates/service-template/.github/workflows",
            },
            {
              title: "Fill in the workflow",
              detail:
                "A minimal pipeline: checkout and test. Every service created from this template starts with working CI.",
              command: "echo 'name: CI\\non: push\\njobs:\\n  test:\\n    runs-on: ubuntu-latest\\n    steps:\\n      - uses: actions/checkout@v4' > ~/templates/service-template/.github/workflows/ci.yml",
            },
            {
              title: "Review and submit",
              detail:
                "ls -R shows the full template. Then submit — the validator checks every required piece.",
              command: "ls -R ~/templates/service-template",
            },
          ],
        },
      ],
    },
    {
      slug: "02-service-catalog",
      title: "Service Catalog",
      summary: "If it isn't in the catalog, it doesn't exist.",
      tasks: [
        {
          slug: "plat-service-catalog",
          title: "Register a Service in the Catalog",
          type: "guided",
          difficulty: "beginner",
          description:
            "Backstage-style catalogs read a catalog-info.yaml from each repository. Write one for the service you templated — ownership, domain and component type.",
          requirements: [
            "File ~/templates/service-template/catalog-info.yaml exists",
            "It declares a Component owned by a team",
          ],
          env: "ubuntu:24.04",
          checks: [
            { kind: "filecontains", path: "/home/learner/templates/service-template/catalog-info.yaml", value: "kind: Component", label: "declares kind: Component" },
            { kind: "filecontains", path: "/home/learner/templates/service-template/catalog-info.yaml", value: "owner:", label: "declares an owner" },
          ],
          steps: [
            {
              title: "Enter the template repository",
              detail: "The catalog file lives at the repo root, next to the code.",
              command: "cd ~/templates/service-template",
            },
            {
              title: "Write the catalog descriptor",
              detail:
                "apiVersion and kind: Component identify it as a service; metadata gives it a name; spec.owner points at a catalog group — the team paged when it breaks.",
              command: "echo 'apiVersion: backstage.io/v1alpha1\\nkind: Component\\nmetadata:\\n  name: service-template\\nspec:\\n  type: service\\n  owner: platform-team' > catalog-info.yaml",
            },
            {
              title: "Review and submit",
              detail:
                "cat the file. Every service in the company gets one of these — together they form the catalog.",
              command: "cat catalog-info.yaml",
            },
          ],
        },
      ],
    },
    {
      slug: "03-gitops",
      title: "GitOps with ArgoCD",
      summary: "Git as the single source of truth for what runs.",
      tasks: [
        {
          slug: "plat-gitops-app",
          title: "Declare a GitOps Application",
          type: "guided",
          difficulty: "intermediate",
          description:
            "GitOps means the cluster syncs itself from Git. Write the ArgoCD Application manifest that tells the controller to watch a repo and apply everything in it.",
          requirements: [
            "File ~/gitops/app.yaml exists",
            "It declares an argoproj.io Application watching a Git repo",
          ],
          env: "ubuntu:24.04",
          checks: [
            { kind: "filecontains", path: "/home/learner/gitops/app.yaml", value: "argoproj.io/v1alpha1", label: "ArgoCD Application manifest" },
            { kind: "filecontains", path: "/home/learner/gitops/app.yaml", value: "repoURL:", label: "declares the source repo" },
          ],
          steps: [
            {
              title: "Create the gitops directory",
              detail:
                "In real setups this manifest lives in a dedicated config repository that ArgoCD itself watches.",
              command: "mkdir ~/gitops",
            },
            {
              title: "Write the Application manifest",
              detail:
                "source.repoURL is the Git repo to sync FROM; destination is the cluster and namespace to sync TO; syncPolicy automated means no human clicks.",
              command: "echo 'apiVersion: argoproj.io/v1alpha1\\nkind: Application\\nmetadata:\\n  name: service-template\\nspec:\\n  source:\\n    repoURL: https://github.com/learner/service-template.git\\n    targetRevision: main\\n  destination:\\n    server: https://kubernetes.default.svc\\n    namespace: default\\n  syncPolicy:\\n    automated: {}' > ~/gitops/app.yaml",
            },
            {
              title: "Understand the drift loop",
              detail:
                "From now on: someone edits the repo, ArgoCD notices, the cluster changes. Nobody kubectl-applies by hand — that's the whole GitOps idea.",
              command: "",
            },
            {
              title: "Verify and submit",
              detail: "cat the manifest, then submit.",
              command: "cat ~/gitops/app.yaml",
            },
          ],
        },
      ],
    },
    {
      slug: "04-policies",
      title: "Policy & Guardrails",
      summary: "Guardrails that make violations impossible, not forbidden.",
      tasks: [
        {
          slug: "plat-admission-policy",
          title: "Write an Admission Policy",
          type: "practice",
          difficulty: "intermediate",
          description:
            "Platform teams enforce policy at admission time — the cluster simply rejects workloads that break the rules. Write a Kyverno-style policy banning privileged containers.",
          requirements: [
            "File ~/policies/no-privileged.yaml exists",
            "It validates that privileged: false is required",
          ],
          env: "ubuntu:24.04",
          checks: [
            { kind: "filecontains", path: "/home/learner/policies/no-privileged.yaml", value: "ClusterPolicy", label: "declares a ClusterPolicy" },
            { kind: "filecontains", path: "/home/learner/policies/no-privileged.yaml", value: "privileged: false", label: "requires privileged: false" },
          ],
          steps: [
            {
              title: "Create the policies directory",
              detail: "Policies are applied cluster-wide, so they live apart from app manifests.",
              command: "mkdir ~/policies",
            },
            {
              title: "Write the policy",
              detail:
                "A ClusterPolicy with validationFailureAction: Enforce means violations are REJECTED, not just reported. The pattern checks every Pod's securityContext.",
              command: "echo 'apiVersion: kyverno.io/v1\\nkind: ClusterPolicy\\nmetadata:\\n  name: no-privileged\\nspec:\\n  validationFailureAction: Enforce\\n  rules:\\n    - name: require-non-privileged\\n      match:\\n        any:\\n        - resources:\\n            kinds:\\n              - Pod\\n      validate:\\n        message: \"Privileged containers are not allowed.\"\\n        pattern:\\n          spec:\\n            containers:\\n              - securityContext:\\n                  privileged: false' > ~/policies/no-privileged.yaml",
            },
            {
              title: "Review and submit",
              detail:
                "cat the policy. From the moment it's applied, no privileged Pod can enter the cluster — policy as code, enforced by the platform.",
              command: "cat ~/policies/no-privileged.yaml",
            },
          ],
        },
      ],
    },
  ],
};
