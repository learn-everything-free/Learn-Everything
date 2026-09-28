import type { Skill } from "../types";

export const cicdSkill: Skill = {
  slug: "cicd",
  title: "CI/CD",
  summary: "Pipelines that test, build and ship on every change.",
  topics: [
    {
      slug: "01-first-pipeline",
      title: "Your First Pipeline",
      summary: "GitHub Actions workflows: triggers, jobs and steps.",
      tasks: [
        {
          slug: "cicd-first-workflow",
          title: "Write Your First GitHub Actions Workflow",
          type: "guided",
          difficulty: "beginner",
          description:
            "A pipeline is a file in the repository — that's the whole trick. Create the exact directory layout GitHub Actions expects and write a workflow that runs on every push.",
          requirements: [
            "File ~/project/.github/workflows/ci.yml exists",
            "Workflow triggers on push",
            "Workflow checks out the code with actions/checkout",
          ],
          env: "ubuntu:24.04",
          checks: [
            { kind: "file", path: "/home/learner/project/.github/workflows/ci.yml", label: "workflow file exists" },
            { kind: "filecontains", path: "/home/learner/project/.github/workflows/ci.yml", value: "on: push", label: "workflow triggers on push" },
            { kind: "filecontains", path: "/home/learner/project/.github/workflows/ci.yml", value: "actions/checkout@v4", label: "workflow checks out the code" },
          ],
          steps: [
            {
              title: "Enter the project",
              detail:
                "Workflows always live inside the repository, in a hidden .github directory at the repo root.",
              command: "cd ~/project",
            },
            {
              title: "Create the workflows directory",
              detail:
                "GitHub only picks up workflow files from .github/workflows/ — the path is not configurable.",
              command: "mkdir -p ~/project/.github/workflows",
            },
            {
              title: "Start the workflow file",
              detail:
                "name is the display name; on: push is the trigger — the workflow runs on every push to the repository.",
              command: "echo 'name: CI' > ~/project/.github/workflows/ci.yml",
            },
            {
              title: "Add the trigger",
              detail: "Append the trigger line. >> appends instead of overwriting.",
              command: "echo 'on: push' >> ~/project/.github/workflows/ci.yml",
            },
            {
              title: "Add the job",
              detail:
                "jobs group steps; runs-on chooses the runner VM — ubuntu-latest is the standard choice.",
              command: "echo 'jobs:' >> ~/project/.github/workflows/ci.yml",
            },
            {
              title: "Add the build job and checkout step",
              detail:
                "Every job starts from a fresh VM, so the first step is always actions/checkout@v4 to pull your code onto the runner.",
              command: "echo '  build:' >> ~/project/.github/workflows/ci.yml",
            },
            {
              title: "Finish the workflow",
              detail:
                "Add runs-on, then steps with - uses: actions/checkout@v4. Run cat to review the whole file.",
              command: "echo '    runs-on: ubuntu-latest' >> ~/project/.github/workflows/ci.yml",
            },
            {
              title: "Add the checkout step and verify",
              detail:
                "Append '    steps:' and '      - uses: actions/checkout@v4', then cat the file. Then submit — the validator parses the YAML you wrote.",
              command: "cat ~/project/.github/workflows/ci.yml",
            },
          ],
        },
      ],
    },
    {
      slug: "02-jobs-steps",
      title: "Jobs & Testing",
      summary: "Make the pipeline prove something.",
      tasks: [
        {
          slug: "cicd-add-tests",
          title: "Run Tests in the Pipeline",
          type: "practice",
          difficulty: "beginner",
          description:
            "A pipeline that only checks out code proves nothing. Extend the workflow so it installs dependencies and runs the test suite on every push.",
          requirements: [
            "The workflow runs on ubuntu-latest",
            "The workflow contains a test step running pytest",
          ],
          env: "ubuntu:24.04",
          checks: [
            { kind: "filecontains", path: "/home/learner/project/.github/workflows/ci.yml", value: "pytest", label: "workflow runs pytest" },
            { kind: "filecontains", path: "/home/learner/project/.github/workflows/ci.yml", value: "pip install", label: "workflow installs dependencies" },
          ],
          steps: [
            {
              title: "Review the current workflow",
              detail: "You're extending the file from the previous task.",
              command: "cat ~/project/.github/workflows/ci.yml",
            },
            {
              title: "Set up Python",
              detail:
                "Actions with uses: are reusable steps from the marketplace. actions/setup-python@v5 installs the Python toolchain on the runner.",
              command: "echo '      - uses: actions/setup-python@v5' >> ~/project/.github/workflows/ci.yml",
            },
            {
              title: "Install dependencies",
              detail:
                "Steps with run: execute shell commands on the runner. Dependencies first, so tests can import their libraries.",
              command: "echo '      - run: pip install -r requirements.txt' >> ~/project/.github/workflows/ci.yml",
            },
            {
              title: "Run the tests",
              detail:
                "pytest exits non-zero when tests fail — and a non-zero exit fails the step, which fails the job, which fails the workflow. That's the entire CI contract.",
              command: "echo '      - run: pytest' >> ~/project/.github/workflows/ci.yml",
            },
            {
              title: "Verify and submit",
              detail: "cat the file to review the final workflow, then submit.",
              command: "cat ~/project/.github/workflows/ci.yml",
            },
          ],
        },
      ],
    },
    {
      slug: "03-docker-pipeline",
      title: "Build & Push Images",
      summary: "Ship a container image from the pipeline.",
      tasks: [
        {
          slug: "cicd-docker-workflow",
          title: "Build and Push a Docker Image in CI",
          type: "practice",
          difficulty: "intermediate",
          description:
            "The final pipeline stage for most services: build an image and publish it to a registry. Extend the workflow with Docker build and push steps.",
          requirements: [
            "The workflow logs in to the registry",
            "The workflow builds with docker/build-push-action",
          ],
          env: "ubuntu:24.04",
          checks: [
            { kind: "filecontains", path: "/home/learner/project/.github/workflows/ci.yml", value: "docker/login-action@v3", label: "workflow logs in to the registry" },
            { kind: "filecontains", path: "/home/learner/project/.github/workflows/ci.yml", value: "docker/build-push-action@v6", label: "workflow builds and pushes the image" },
          ],
          steps: [
            {
              title: "Add registry login",
              detail:
                "docker/login-action@v3 authenticates against Docker Hub (or GHCR). Credentials come from repository secrets — never hardcode them.",
              command: "echo '      - uses: docker/login-action@v3' >> ~/project/.github/workflows/ci.yml",
            },
            {
              title: "Understand secrets",
              detail:
                "${{ secrets.DOCKERHUB_TOKEN }} is injected by Actions at runtime. You can't echo it back — CI masks secrets in logs.",
              command: "",
            },
            {
              title: "Add build and push",
              detail:
                "docker/build-push-action@v6 builds the image from the repo's Dockerfile and pushes it, with: tagging it as latest on every push to main.",
              command: "echo '      - uses: docker/build-push-action@v6' >> ~/project/.github/workflows/ci.yml",
            },
            {
              title: "Tag the image",
              detail:
                "with: with push: true and tags: learner/demo:latest finishes the pipeline.",
              command: "echo '        with:' >> ~/project/.github/workflows/ci.yml",
            },
            {
              title: "Verify and submit",
              detail: "cat the file, review the complete pipeline, then submit.",
              command: "cat ~/project/.github/workflows/ci.yml",
            },
          ],
        },
      ],
    },
  ],
};
