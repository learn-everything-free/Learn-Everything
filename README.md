# 🚀 Learn Everything

> **Learn it. Practice it. Break it. Fix it. Build it.**

**Learn Everything** is an open-source, hands-on learning platform designed to make technical education **free, practical, and accessible to everyone**.

Instead of only watching videos or reading documentation, learners use real development environments, complete practical tasks, solve problems, debug failures, and build projects.

The goal is simple:

> **Don't just learn how technology works. Learn how to actually use it.**

[![License](https://img.shields.io/badge/license-TBD-lightgrey)](#-license)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](#-contributing)
[![Status](https://img.shields.io/badge/status-early%20development-orange)](#-project-status)
[![Discussions](https://img.shields.io/badge/community-GitHub%20Discussions-blue)](#-community--support)

---

## 📋 Table of Contents

- [Project Status](#-project-status)
- [Vision](#-vision)
- [What is Learn Everything?](#-what-is-learn-everything)
- [Core Philosophy](#-core-philosophy)
- [Platform Structure](#️-platform-structure)
- [Learn With Real Environments](#-learn-with-real-environments)
- [Tasks](#-tasks)
- [Automated Validation](#-automated-validation)
- [Learning Modes](#-learning-modes)
- [Debugging Is Learning](#-debugging-is-learning)
- [AI Tutor](#-ai-tutor)
- [Git-Based Learning Content](#-git-based-learning-content)
- [Example Task Definition](#️-example-task-definition)
- [Learning Paths](#-learning-paths)
- [Progress & Gamification](#-progress--gamification)
- [Technical Architecture](#️-technical-architecture)
- [Free Forever Philosophy](#-free-forever-philosophy)
- [Security](#-security)
- [Getting Started](#-getting-started)
- [Open Source](#-open-source)
- [Contributing](#-contributing)
- [Code of Conduct](#-code-of-conduct)
- [FAQ](#-faq)
- [How This Differs From Other Platforms](#-how-this-differs-from-other-platforms)
- [What Makes Learn Everything Different?](#-what-makes-learn-everything-different)
- [Long-Term Vision](#-long-term-vision)
- [The Mission](#️-the-mission)
- [License](#-license)
- [Community & Support](#-community--support)

---

## 🚧 Project Status

**Learn Everything is in early, pre-alpha development.** The architecture, content format, and roadmap below describe the intended direction — most of it is not built yet. Expect frequent breaking changes, incomplete docs, and an evolving spec.

If you're looking to **use** a finished product today, this isn't there yet. If you want to **help build** one, you're in the right place — see [Contributing](#-contributing).

---

## 🌎 Vision

There is an enormous amount of free technical knowledge available on the internet.

The problem is that learning often looks like:

```text
Watch video
    ↓
Read documentation
    ↓
Copy commands
    ↓
"Yeah, I understand it."
    ↓
Forget everything two weeks later 😅
```

Learn Everything aims to change that into:

```text
Learn
  ↓
Understand
  ↓
Practice
  ↓
Experiment
  ↓
Break something
  ↓
Debug it
  ↓
Fix it
  ↓
Build something
  ↓
Prove you can do it
```

---

## 🎯 What is Learn Everything?

Learn Everything is a **hands-on technical learning platform** covering areas such as:

* Linux
* Networking
* Git
* GitHub
* Python
* Docker
* Kubernetes
* Terraform
* Ansible
* CI/CD
* Cloud
* DevOps
* Platform Engineering
* MLOps
* AI Engineering
* Generative AI
* RAG
* Agentic AI
* MCP
* LLMOps
* AI Infrastructure
* AI Security
* and more

The platform is designed around **learning by doing**.

---

## 🧠 Core Philosophy

### Traditional learning

```text
Content → Quiz → Certificate
```

### Learn Everything

```text
Concept
   ↓
Hands-on Practice
   ↓
Real Environment
   ↓
Task
   ↓
Experiment
   ↓
Failure
   ↓
Debugging
   ↓
Validation
   ↓
Skill
```

A learner shouldn't receive a "Docker expert" badge because they answered ten multiple-choice questions.

They should be able to:

```bash
docker build
docker run
docker inspect
docker logs
docker exec
docker network
docker volume
```

and understand **why and when** to use them.

---

## 🏗️ Platform Structure

Learning content is organized into multiple levels.

```text
Learning Path
      │
      ├── Skill
      │     │
      │     ├── Topic
      │     │     │
      │     │     ├── Concept
      │     │     ├── Guided Task
      │     │     ├── Practice Task
      │     │     ├── Challenge
      │     │     ├── Scenario
      │     │     └── Quiz
      │     │
      │     └── Topic
      │
      └── Skill
```

This allows the same content engine to support everything from Linux fundamentals to advanced AI infrastructure.

---

## 💻 Learn With Real Environments

The platform is designed around disposable, isolated environments.

For example:

```text
Browser
   │
   ▼
Learn Everything
   │
   ▼
Lab Environment
   │
   ├── Linux
   ├── Git
   ├── Python
   ├── Docker
   └── Tools required by the task
```

A learner can experiment without worrying about destroying their personal machine.

After the session:

```text
Lab
 ↓
Destroy
 ↓
Fresh Environment
```

The exact execution architecture may evolve between containers, lightweight VMs, browser-based environments, and local execution.

---

## 🧪 Tasks

Tasks are the heart of the platform.

Instead of asking:

> "What command creates a Docker container?"

the platform can ask:

> **"Deploy this application as a container and make it reachable on port 8080."**

The learner must figure out how to accomplish the goal.

Example:

```text
┌───────────────────────────────────────┐
│ Docker Challenge                      │
│                                       │
│ Deploy the provided application       │
│ as a container.                       │
│                                       │
│ Requirements:                         │
│                                       │
│ ✓ Container must be running           │
│ ✓ Port 8080 must be exposed           │
│ ✓ Application must return HTTP 200    │
│                                       │
│             [ Start Lab ]              │
└───────────────────────────────────────┘
```

The learner then uses the terminal to solve it.

---

## ✅ Automated Validation

Tasks shouldn't depend on manually reviewing whether someone completed them.

The platform uses automated validators.

```text
Learner
   │
   ▼
Perform Task
   │
   ▼
Submit
   │
   ▼
Validator
   │
   ├── Environment state
   ├── Files
   ├── Processes
   ├── Network
   ├── Services
   ├── API responses
   └── Configuration
   │
   ▼
PASS / FAIL
```

Example:

```bash
test -f /home/learner/project/README.md
test -d /home/learner/project/src
test -d /home/learner/project/tests
```

More advanced validators can verify:

```text
Docker container status
Kubernetes resources
Terraform state
HTTP responses
Cloud resources
Configuration
Logs
Metrics
Security policies
```

---

## 🧩 Learning Modes

Learn Everything will support multiple ways of learning.

### 📖 Concept

Understand the fundamentals.

```text
What is Kubernetes?
How does a Pod work?
Why do we need containers?
```

### 🧑‍💻 Guided Task

Learn while performing the task.

```text
Step 1
Run...

Step 2
Inspect...

Step 3
Modify...
```

### 🔨 Practice Task

You receive the objective and figure out the implementation.

```text
Goal:
Deploy the application.

Hints:
Available when needed.
```

### 🧠 Challenge

Minimal guidance.

```text
MISSION

Something is broken.

Find the problem.
Fix it.
Prove that it works.
```

### 🚨 Scenario

Practice engineering decision-making.

```text
Production API latency suddenly increased.

Investigate the system
and identify the likely cause.
```

### 🏗️ Project

Combine multiple skills into a real project.

```text
Git
 + Docker
 + CI/CD
 + Kubernetes
 + Monitoring
      ↓
Production-style project
```

---

## 🔥 Debugging Is Learning

A major principle of Learn Everything is:

> **Failure is part of the curriculum.**

The platform should not immediately tell the learner the answer.

Instead:

```text
Task failed
    ↓
What did you try?
    ↓
Inspect logs
    ↓
Investigate
    ↓
Try again
    ↓
Fix
    ↓
Pass
```

Hints should progressively reveal information without removing the learning experience.

---

## 🤖 AI Tutor

AI can be integrated as a **learning assistant**, not as an answer generator.

Instead of:

```text
User:
How do I solve this?

AI:
Run these 5 commands...
```

the AI should behave more like an experienced engineer:

```text
User:
My container isn't working.

AI:
What does `docker ps -a` show?

User:
It exited with code 1.

AI:
Good clue.

Now inspect the container logs.
What do you see?
```

Possible AI capabilities:

* Explain concepts
* Provide progressive hints
* Explain error messages
* Help interpret logs
* Review approaches
* Suggest debugging directions
* Explain failed validators
* Generate additional practice
* Adapt difficulty
* Create personalized learning paths

The learner should still **do the work**.

---

## 📚 Git-Based Learning Content

Learning content should be easy for anyone to contribute to.

A possible structure:

```text
content/
│
├── linux/
│   ├── skill.yaml
│   │
│   ├── 01-introduction/
│   │   ├── topic.yaml
│   │   ├── lessons/
│   │   ├── tasks/
│   │   └── validators/
│   │
│   └── 02-filesystems/
│
├── docker/
├── kubernetes/
├── terraform/
├── python/
├── devops/
├── mlops/
├── ai/
└── security/
```

Content can therefore be reviewed, versioned, tested, and contributed through Git.

---

## 🛠️ Example Task Definition

A task could look conceptually like:

```yaml
id: linux-create-project

title: Create a Project Structure

difficulty: beginner

description: |
  Create a project directory containing:

  project/
  ├── src/
  ├── tests/
  └── README.md

environment:
  image: ubuntu:24.04

validation:
  - directory: /home/learner/project
  - directory: /home/learner/project/src
  - directory: /home/learner/project/tests
  - file: /home/learner/project/README.md
```

The content system can evolve independently from the platform code.

---

## 🧭 Learning Paths

Learners can follow structured paths based on their goals.

Example:

```text
DevOps Engineer
│
├── Linux
├── Networking
├── Git
├── Docker
├── CI/CD
├── AWS
├── Terraform
├── Kubernetes
├── Observability
└── Platform Engineering
```

Another:

```text
AI Engineer
│
├── Python
├── AI Fundamentals
├── LLM Fundamentals
├── Prompt Engineering
├── Structured Outputs
├── RAG
├── Agents
├── MCP
├── LLMOps
└── AI Infrastructure
```

And another:

```text
MLOps Engineer
│
├── Python
├── ML Fundamentals
├── ML Pipelines
├── Model Tracking
├── Model Registry
├── CI/CD
├── Kubernetes
├── Model Serving
├── Monitoring
└── ML Infrastructure
```

---

## 🏆 Progress & Gamification

The platform may include lightweight gamification to encourage consistent practice.

Possible features:

* XP
* Skill progression
* Streaks
* Achievements
* Challenges
* Project completion
* Community leaderboards
* Learning milestones
* Skill completion

But the primary goal remains:

> **Build actual skills, not collect meaningless badges.**

---

## 🏗️ Technical Architecture

The initial architecture is intentionally modular.

```text
                         ┌────────────────────┐
                         │     Web Client     │
                         │      Next.js       │
                         └─────────┬──────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │     API Layer      │
                         └─────────┬──────────┘
                                   │
             ┌─────────────────────┼─────────────────────┐
             │                     │                     │
             ▼                     ▼                     ▼
      Content Engine          Lab Manager           Validator
             │                     │                     │
             ▼                     ▼                     ▼
        Git Content          Container / VM          Test Engine
                                   │
                                   ▼
                              Lab Runtime
```

Potential technologies:

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* xterm.js

### Backend

Potentially:

* Python
* FastAPI
* PostgreSQL
* Redis
* WebSockets

### Lab Infrastructure

Potentially:

* Docker
* Kubernetes
* Firecracker
* Linux namespaces/cgroups
* WebSockets
* Container runtimes

### AI

Potentially:

* OpenAI
* Gemini
* Anthropic
* Open-source models
* MCP
* Agent frameworks

The platform should avoid hard-coupling itself to a single AI provider.

---

## 💸 Free Forever Philosophy

The platform is designed with a **free-first** philosophy.

Learning content should remain freely accessible.

The major challenge is compute.

Therefore the platform will explore:

### 🖥️ Local Labs

Let users run environments on their own machines.

```bash
learn-everything lab start
```

### ☁️ Shared Infrastructure

Small disposable environments for lightweight exercises.

### 🧑‍🤝‍🧑 Community Infrastructure

Allow organizations and individuals to contribute compute.

### ❤️ Sponsorship

Infrastructure can eventually be supported through:

* Sponsors
* Grants
* Donations
* Cloud credits
* Community contributions

The goal is to minimize barriers to learning rather than make infrastructure consumption the product.

---

## 🔐 Security

Running arbitrary user commands is dangerous.

Security is therefore a first-class concern.

Labs should be isolated using appropriate mechanisms such as:

* Ephemeral environments
* Resource limits
* Network isolation
* Filesystem isolation
* CPU limits
* Memory limits
* Execution timeouts
* Restricted capabilities
* Automatic cleanup
* No access to host systems
* Monitoring and abuse prevention

**Never treat an ordinary Docker container as automatically equivalent to a security boundary.**

Production lab infrastructure will require stronger isolation where appropriate.

If you discover a security vulnerability, please **do not open a public issue**. Instead, report it privately (see [Community & Support](#-community--support) for contact details once available).

---

## 🏁 Getting Started

> ⚠️ The platform is in early development — these steps describe the intended local setup and will be filled in as the codebase lands.

### Prerequisites

* Node.js (LTS) and a package manager (`pnpm` recommended)
* Docker (for running lab environments locally)
* Git

### Clone the repository

```bash
git clone https://github.com/<org>/learn-everything.git
cd learn-everything
```

### Install dependencies

```bash
pnpm install
```

### Run the web client locally

```bash
pnpm dev
```

### Try a lab environment locally (planned)

```bash
learn-everything lab start
```

### Explore the content structure

Learning content lives under `content/` (see [Git-Based Learning Content](#-git-based-learning-content)). Browse an existing skill folder to see how lessons, tasks, and validators are organized.

---

## 🌐 Open Source

Learn Everything is intended to be built in public.

Anyone should be able to:

* Create lessons
* Create tasks
* Improve explanations
* Add validators
* Add learning paths
* Fix bugs
* Improve infrastructure
* Add translations
* Create projects
* Improve accessibility

The long-term vision is a **community-built technical learning ecosystem**.

---

## 🤝 Contributing

Contributions are welcome.

You can contribute:

```text
Content
Documentation
Code
Validators
Labs
Projects
Translations
UI/UX
Security improvements
Infrastructure
AI integrations
```

A contribution can be as small as fixing one explanation or adding one practical task.

**Before you open a PR:**

1. Check open issues for something labeled `good first issue` or `help wanted`.
2. Open an issue to discuss larger changes before building them.
3. Follow the content structure described in [Git-Based Learning Content](#-git-based-learning-content) when adding lessons or tasks.
4. Keep validators deterministic and idempotent — a task should be checkable in isolation.

A full `CONTRIBUTING.md` (setup, coding conventions, PR process) will be added as the codebase stabilizes.

---

## 📜 Code of Conduct

This project follows a Code of Conduct to ensure a welcoming, harassment-free environment for everyone, regardless of experience level, background, or identity. A `CODE_OF_CONDUCT.md` (e.g. based on the [Contributor Covenant](https://www.contributor-covenant.org/)) will be added at the project root. Violations can be reported through the contact channels in [Community & Support](#-community--support).

---

## ❓ FAQ

**Is Learn Everything really free?**
Yes — the core learning content and platform are intended to remain free. Compute for labs is the main constraint; see [Free Forever Philosophy](#-free-forever-philosophy) for how that's being addressed.

**Do I need my own infrastructure to use it?**
No — the goal is to offer shared/disposable lab environments, with an option to run labs locally if you prefer.

**Is this ready to use today?**
Not yet — see [Project Status](#-project-status). It's currently best suited for contributors, not end users.

**Can I add my own lessons or tasks?**
Yes, that's the intent — see [Contributing](#-contributing) and [Git-Based Learning Content](#-git-based-learning-content).

**Which AI providers will be supported?**
The platform aims to stay provider-agnostic rather than lock into one (see [AI Tutor](#-ai-tutor) and [Technical Architecture](#️-technical-architecture)).

**How is progress verified — do I just self-report completion?**
No — tasks are checked with [automated validators](#-automated-validation) against real environment state, not self-assessment.

---

## 🆚 How This Differs From Other Platforms

There are existing hands-on / interactive learning tools (e.g. browser-based Kubernetes/Linux sandboxes, video-first bootcamp platforms, and documentation-first sites). Learn Everything's intended differentiators:

| | Learn Everything | Typical video/course platform | Typical single-tool sandbox |
|---|---|---|---|
| Learning model | Concept → real task → debug → validate | Watch → quiz → certificate | Isolated command sandbox |
| Scope | Multiple domains (Linux → AI infra) under one content spec | Usually one course track | Usually one technology |
| Validation | Automated, environment-state based | Multiple-choice | Varies |
| Content model | Git-based, community-contributable | Closed, platform-authored | Varies |
| Cost | Free-first | Often paywalled | Varies |

This is a positioning summary, not a claim of feature parity — it will be refined as the platform matures.

---

## 🧠 What Makes Learn Everything Different?

The goal isn't to become another:

> "Watch 40 hours of videos and receive a certificate."

Instead:

```text
                    LEARN EVERYTHING

                         Learn
                           │
                           ▼
                      Understand
                           │
                           ▼
                        Practice
                           │
                           ▼
                    Real Environment
                           │
                           ▼
                         Break
                           │
                           ▼
                        Debug
                           │
                           ▼
                         Build
                           │
                           ▼
                        Validate
                           │
                           ▼
                     Real Skill 🚀
```

The platform measures what learners **can actually do**, not only what they can remember.

---

## 🌟 Long-Term Vision

Imagine someone saying:

> "I want to become a DevOps Engineer."

Instead of searching through hundreds of disconnected tutorials, they open Learn Everything.

```text
Goal
 ↓
Learning Path
 ↓
Concepts
 ↓
Hands-on Labs
 ↓
Challenges
 ↓
Real Projects
 ↓
Production Scenarios
 ↓
Portfolio
```

Someone else says:

> "I want to learn Kubernetes."

They get:

```text
Kubernetes Fundamentals
        ↓
Pods
        ↓
Deployments
        ↓
Services
        ↓
ConfigMaps
        ↓
Secrets
        ↓
Ingress
        ↓
Storage
        ↓
Networking
        ↓
Debugging
        ↓
Production Scenarios
        ↓
Real Kubernetes Projects
```

And someone interested in AI can go from:

```text
Python
 ↓
LLMs
 ↓
RAG
 ↓
Agents
 ↓
Tools
 ↓
MCP
 ↓
LLMOps
 ↓
AI Infrastructure
 ↓
Production AI Systems
```

All through **doing**, not just watching.

---

## ❤️ The Mission

> **Make high-quality, hands-on technical education accessible to everyone.**

No expensive bootcamp.

No artificial paywall around basic knowledge.

No requirement to own expensive infrastructure.

No pretending that passing a quiz means you can operate production systems.

Just:

**Learn. Practice. Experiment. Fail. Debug. Build.**

And do it together.

---

## 📜 License

The project will use an open-source license. A permissive license such as **MIT** or **Apache 2.0** is the likely candidate, as both are widely trusted by contributors and compatible with the project's free-first, community-built goals. The final license will be selected before the first public release.

---

## ⭐ Community & Support

If you believe practical technical education should be accessible to everyone:

⭐ Star the repository
🐛 Report issues
💡 Suggest learning paths
🧪 Create labs
📝 Improve content
🤝 Contribute
💬 Join the discussion (GitHub Discussions / Discord link — to be added)

**Learn Everything — because everyone should have the opportunity to learn by doing.**
