import type { Skill } from "../types";

export const linuxSkill: Skill = {
  slug: "linux",
  title: "Linux",
  summary: "The foundation everything else runs on.",
  topics: [
    {
      slug: "01-introduction",
      title: "Introduction",
      summary: "The shell, the filesystem and why Linux runs the world's infrastructure.",
      tasks: [
        {
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
          checks: [
            { kind: "directory", path: "/home/learner/project", label: "~/project" },
            { kind: "directory", path: "/home/learner/project/src", label: "~/project/src" },
            { kind: "directory", path: "/home/learner/project/tests", label: "~/project/tests" },
            { kind: "file", path: "/home/learner/project/README.md", label: "~/project/README.md" },
          ],
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
                "mkdir makes a new directory. Giving the full ~/project path works from anywhere.",
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
                "touch creates an empty file (or updates its timestamp if the file already exists).",
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
                "The validator re-checks the real state of the environment: the three directories and the README file.",
              command: "",
            },
          ],
        },
        {
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
          checks: [
            { kind: "directory", path: "/home/learner/report", label: "~/report" },
            { kind: "file", path: "/home/learner/report/largest.txt", label: "~/report/largest.txt" },
            { kind: "filecontains", path: "/home/learner/report/largest.txt", value: "app-2026-09-26.log", label: "largest.txt names the largest log" },
          ],
          steps: [
            {
              title: "Inspect the log directory",
              detail:
                "cd changes your current directory. /var/log/app is where the application writes its logs.",
              command: "cd /var/log/app",
            },
            {
              title: "List files sorted by size",
              detail:
                "ls with three useful flags: -l long format, -h human-readable sizes (K/M/G instead of raw bytes), and -S sort largest first. The biggest file is on top.",
              command: "ls -lhS",
            },
            {
              title: "Go back home",
              detail: "cd with no arguments returns to your home directory.",
              command: "cd ~",
            },
            {
              title: "Create the report directory",
              detail: "mkdir ~/report creates the directory the report will live in.",
              command: "mkdir ~/report",
            },
            {
              title: "Write the largest log file's name into the report",
              detail:
                "echo prints text; the > redirect writes that text into a file, creating it if needed. The largest file from step 2 was app-2026-09-26.log.",
              command: "echo app-2026-09-26.log > ~/report/largest.txt",
            },
            {
              title: "Verify the report contents",
              detail: "cat prints a file's contents. If it shows app-2026-09-26.log, you're done.",
              command: "cat ~/report/largest.txt",
            },
            {
              title: "Submit for validation",
              detail:
                "The validator checks that ~/report exists, that largest.txt exists, and that its content names the correct file.",
              command: "",
            },
          ],
        },
      ],
    },
    {
      slug: "02-filesystems",
      title: "Filesystems & Permissions",
      summary: "Everything is a file: paths, modes, owners and the tools that inspect them.",
      tasks: [
        {
          slug: "linux-permissions",
          title: "Lock Down a Secret File",
          type: "practice",
          difficulty: "beginner",
          description:
            "Create a secrets file with restrictive permissions. Only the owner should be able to read and write it — nobody else. This is exactly how SSH private keys work.",
          requirements: [
            "Directory ~/secure exists",
            "File ~/secure/secret.txt exists",
            "Permissions on secret.txt are 600 (owner read/write only)",
          ],
          env: "ubuntu:24.04",
          checks: [
            { kind: "directory", path: "/home/learner/secure", label: "~/secure" },
            { kind: "file", path: "/home/learner/secure/secret.txt", label: "~/secure/secret.txt" },
            { kind: "filemode", path: "/home/learner/secure/secret.txt", value: "600", label: "secret.txt has mode 600" },
          ],
          steps: [
            {
              title: "Create the directory",
              detail: "A dedicated directory keeps secrets out of world-readable places.",
              command: "mkdir ~/secure",
            },
            {
              title: "Create the file",
              detail:
                "touch creates an empty file. New files usually get mode 644: everyone can read them.",
              command: "touch ~/secure/secret.txt",
            },
            {
              title: "Inspect the current permissions",
              detail:
                "ls -l shows permissions as the first column, like -rw-r--r--. Three triples: owner, group, others (r=read, w=write, x=execute).",
              command: "ls -l ~/secure",
            },
            {
              title: "Restrict the file to the owner",
              detail:
                "chmod changes mode bits. 600 is octal: owner gets read+write (6 = 4+2), group gets nothing (0), others get nothing (0).",
              command: "chmod 600 ~/secure/secret.txt",
            },
            {
              title: "Verify the new mode",
              detail:
                "The ls -l output should now show -rw-------. Compare it with the previous listing.",
              command: "ls -l ~/secure",
            },
            {
              title: "Submit for validation",
              detail: "The validator checks the file exists and its mode is exactly 600.",
              command: "",
            },
          ],
        },
      ],
    },
    {
      slug: "03-text-processing",
      title: "Text Processing & Pipes",
      summary: "grep, wc, pipes and redirection — how engineers actually read logs.",
      tasks: [
        {
          slug: "linux-log-pipeline",
          title: "Count Errors in a Log",
          type: "guided",
          difficulty: "beginner",
          description:
            "The application log at /var/log/app/app-2026-09-27.log is full of noise. Use grep and pipes to count the ERROR lines and save the result.",
          requirements: [
            "Directory ~/report exists",
            "File ~/report/error-count.txt exists and contains the number of ERROR lines",
          ],
          env: "ubuntu:24.04",
          checks: [
            { kind: "directory", path: "/home/learner/report", label: "~/report" },
            { kind: "file", path: "/home/learner/report/error-count.txt", label: "~/report/error-count.txt" },
            { kind: "filecontains", path: "/home/learner/report/error-count.txt", value: "ERROR lines: 3", label: "error-count.txt says 'ERROR lines: 3'" },
          ],
          steps: [
            {
              title: "Look at the log",
              detail:
                "cat dumps the whole file. Real logs are too big for this — but it's worth seeing the shape of the data once: one event per line, level first (INFO/WARN/ERROR).",
              command: "cat /var/log/app/app-2026-09-27.log",
            },
            {
              title: "Filter the ERROR lines",
              detail:
                "grep prints every line matching a pattern. Run it once to see the three ERROR lines.",
              command: "grep ERROR /var/log/app/app-2026-09-27.log",
            },
            {
              title: "Count them with a pipe",
              detail:
                "The | (pipe) sends the output of one command into the next. grep finds the lines, wc -l counts them. This chain is the single most-used pattern on a Unix box.",
              command: "grep ERROR /var/log/app/app-2026-09-27.log | wc -l",
            },
            {
              title: "Save the result",
              detail:
                "Write a labeled result to the report file with echo and a redirect. The pipe can't be inside echo, so run the count first, then write the answer you saw (3).",
              command: "echo 'ERROR lines: 3' > ~/report/error-count.txt",
            },
            {
              title: "Create the report directory first if needed",
              detail:
                "The > redirect creates files but not parent directories. If step 4 complained, create ~/report and repeat step 4.",
              command: "mkdir ~/report",
            },
            {
              title: "Verify and submit",
              detail: "cat the file to confirm, then submit for validation.",
              command: "cat ~/report/error-count.txt",
            },
          ],
        },
      ],
    },
    {
      slug: "04-users-processes",
      title: "Processes",
      summary: "Everything running on the machine is a process with a PID.",
      tasks: [
        {
          slug: "linux-find-process",
          title: "Identify a Running Process",
          type: "practice",
          difficulty: "beginner",
          description:
            "An application called 'app' is running on this machine. Find its PID with ps, confirm it from the command line arguments, and record it.",
          requirements: [
            "Directory ~/report exists",
            "File ~/report/app-pid.txt exists and contains the PID of the app process",
          ],
          env: "ubuntu:24.04",
          checks: [
            { kind: "directory", path: "/home/learner/report", label: "~/report" },
            { kind: "file", path: "/home/learner/report/app-pid.txt", label: "~/report/app-pid.txt" },
            { kind: "filecontains", path: "/home/learner/report/app-pid.txt", value: "942", label: "app-pid.txt contains the PID 942" },
          ],
          steps: [
            {
              title: "List all running processes",
              detail:
                "ps aux shows every process: user, PID, CPU/mem usage, and the full command. aux means: all users, include processes without a terminal, show full command lines.",
              command: "ps aux",
            },
            {
              title: "Filter for the app process",
              detail:
                "Piping ps into grep is the classic way to find one process. You should see a line with /usr/local/bin/app --port 8080.",
              command: "ps aux | grep app",
            },
            {
              title: "Read the PID",
              detail:
                "The second column is the PID — the number every process tool (kill, top, nice) uses to refer to the process. Note it down.",
              command: "",
            },
            {
              title: "Record the PID",
              detail:
                "Write the PID you found (942) into the report file. Substitute it in the command below if you saw a different one.",
              command: "echo 'PID: 942' > ~/report/app-pid.txt",
            },
            {
              title: "Verify and submit",
              detail: "cat the file to confirm, then submit.",
              command: "cat ~/report/app-pid.txt",
            },
          ],
        },
      ],
    },
  ],
};
