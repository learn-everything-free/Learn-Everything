import type { Skill } from "../types";

export const gitSkill: Skill = {
  slug: "git",
  title: "Git",
  summary: "Version control as a way of working, not a memorized command list.",
  topics: [
    {
      slug: "01-basics",
      title: "Git Basics",
      summary: "Repositories, staging, commits and reading history.",
      tasks: [
        {
          slug: "git-first-commit",
          title: "Your First Commit",
          type: "guided",
          difficulty: "beginner",
          description:
            "Initialize a Git repository in ~/project, stage every file and create the initial commit with the message 'init'. Every command is explained in the walkthrough.",
          requirements: ["~/project is a Git repository", "One commit with message 'init' exists"],
          env: "ubuntu:24.04 + git",
          checks: [
            { kind: "gitrepo", path: "/home/learner/project", label: "~/project is a Git repository" },
            { kind: "gitcommit", path: "/home/learner/project", value: "init", label: "commit 'init' exists" },
          ],
          steps: [
            {
              title: "Enter the project folder",
              detail:
                "If you already created ~/project in the Linux task, just run the cd. Otherwise create it first with mkdir ~/project.",
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
              detail: "git log lists the commit history newest first. You should see one commit with the message 'init'.",
              command: "git log",
            },
            {
              title: "Submit for validation",
              detail:
                "The validator checks that ~/project is a Git repository and that a commit with the message 'init' exists in it.",
              command: "",
            },
          ],
        },
      ],
    },
    {
      slug: "02-branches",
      title: "Branches & Merging",
      summary: "Isolate work, then bring it back together.",
      tasks: [
        {
          slug: "git-feature-branch",
          title: "Ship a Feature Branch",
          type: "practice",
          difficulty: "beginner",
          description:
            "The daily Git loop: branch, commit on the branch, merge back to main. Create a branch called 'feature', commit on it and merge it into main.",
          requirements: [
            "~/project is a Git repository",
            "Branch 'feature' exists and was merged into main",
          ],
          env: "ubuntu:24.04 + git",
          checks: [
            { kind: "gitrepo", path: "/home/learner/project", label: "~/project is a Git repository" },
            { kind: "gitbranch", path: "/home/learner/project", value: "feature", label: "branch 'feature' exists and is merged" },
          ],
          steps: [
            {
              title: "Enter the repository",
              detail: "If you completed the first-commit task, ~/project is already a repository.",
              command: "cd ~/project",
            },
            {
              title: "Create the branch",
              detail:
                "git branch feature creates a new pointer to the current commit. Nothing is checked out yet — the working tree doesn't change.",
              command: "git branch feature",
            },
            {
              title: "Switch to it",
              detail:
                "git checkout feature (or the newer git switch feature) moves HEAD to the branch. New commits now land on 'feature', not 'main'.",
              command: "git checkout feature",
            },
            {
              title: "Commit a change on the branch",
              detail:
                "Make a file, stage it and commit. This is the work you'd do for a real feature.",
              command: "touch feature.txt",
            },
            {
              title: "Stage and commit",
              detail: "Stage the new file and record the commit with a clear message.",
              command: "git add .",
            },
            {
              title: "Commit",
              detail: "The commit message describes the change, not the mechanics.",
              command: "git commit -m \"add feature\"",
            },
            {
              title: "Merge back into main",
              detail:
                "checkout main first, then git merge feature replays the branch's commits onto main. Fast-forward means main simply moved ahead — no conflicts.",
              command: "git checkout main",
            },
            {
              title: "Merge",
              detail: "git merge feature brings the feature work into main.",
              command: "git merge feature",
            },
            {
              title: "Submit for validation",
              detail: "The validator checks the branch exists and was merged into main.",
              command: "",
            },
          ],
        },
      ],
    },
    {
      slug: "03-remotes",
      title: "Remotes & GitHub",
      summary: "Connect a local repository to the world.",
      tasks: [
        {
          slug: "git-add-remote",
          title: "Connect to a Remote",
          type: "guided",
          difficulty: "beginner",
          description:
            "Local commits are only half the story. Add GitHub as a remote and push your branch. In this lab the push is simulated — the workflow is identical to the real thing.",
          requirements: ["Remote 'origin' points at a github.com URL", "Branch pushed to the remote"],
          env: "ubuntu:24.04 + git",
          checks: [
            { kind: "gitrepo", path: "/home/learner/project", label: "~/project is a Git repository" },
            { kind: "gitremote", path: "/home/learner/project", value: "github.com", label: "origin remote points at github.com" },
          ],
          steps: [
            {
              title: "Enter the repository",
              detail: "Remotes are stored per repository inside .git/config.",
              command: "cd ~/project",
            },
            {
              title: "Add the remote",
              detail:
                "git remote add origin <url> stores the URL under the name 'origin' — the conventional name for the repository you cloned from or push to. On GitHub, create an empty repo first and copy its URL.",
              command: "git remote add origin https://github.com/learner/demo.git",
            },
            {
              title: "Verify the remote",
              detail:
                "git remote -v lists every remote with its fetch and push URLs. Both should show your github.com URL.",
              command: "git remote -v",
            },
            {
              title: "Push",
              detail:
                "git push uploads committed work. -u sets upstream tracking so future pushes can be a bare 'git push'.",
              command: "git push -u origin main",
            },
            {
              title: "Submit for validation",
              detail: "The validator checks that origin points at github.com.",
              command: "",
            },
          ],
        },
      ],
    },
    {
      slug: "04-fixing-mistakes",
      title: "Fixing Mistakes",
      summary: "Reverting bad changes without rewriting history.",
      tasks: [
        {
          slug: "git-revert-commit",
          title: "Revert a Bad Commit",
          type: "scenario",
          difficulty: "intermediate",
          description:
            "A teammate committed a bug and you need main clean again — without rewriting history that others already have. Undo the last commit with git revert, which adds an inverse commit.",
          requirements: [
            "~/project is a Git repository",
            "A revert commit exists (message starts with 'Revert')",
          ],
          env: "ubuntu:24.04 + git",
          checks: [
            { kind: "gitrepo", path: "/home/learner/project", label: "~/project is a Git repository" },
            { kind: "gitcommit", path: "/home/learner/project", value: "Revert \"bug: ship it broken\"", label: "revert commit exists" },
          ],
          steps: [
            {
              title: "Enter the repository",
              detail: "Reverts operate on the current branch's history.",
              command: "cd ~/project",
            },
            {
              title: "Simulate the bad commit",
              detail:
                "Create and commit a change with a bad message — this stands in for the bug you're undoing.",
              command: "touch bugfix.txt",
            },
            {
              title: "Stage and commit it",
              detail: "Stage, then commit with the (deliberately bad) message.",
              command: "git add .",
            },
            {
              title: "Commit",
              detail: "This is the commit we'll undo.",
              command: "git commit -m \"bug: ship it broken\"",
            },
            {
              title: "Confirm the history",
              detail:
                "git log shows the bad commit on top. git revert HEAD undoes exactly this commit.",
              command: "git log",
            },
            {
              title: "Revert it",
              detail:
                "git revert HEAD creates a NEW commit that inverses the last one. History grows instead of being rewritten — safe for shared branches, unlike git reset.",
              command: "git revert HEAD",
            },
            {
              title: "Verify and submit",
              detail:
                "git log should now end with a 'Revert' commit. Then submit for validation.",
              command: "git log",
            },
          ],
        },
      ],
    },
  ],
};
