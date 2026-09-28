import type { Skill } from "../types";

export const observabilitySkill: Skill = {
  slug: "observability",
  title: "Observability",
  summary: "Metrics, logs and alerts — knowing what your systems are doing.",
  topics: [
    {
      slug: "01-metrics",
      title: "Metrics from Logs",
      summary: "Numbers come from somewhere — learn to extract them.",
      tasks: [
        {
          slug: "obs-count-5xx",
          title: "Count HTTP 5xx Errors",
          type: "practice",
          difficulty: "beginner",
          description:
            "Every dashboard number starts as raw events. The app's access log is at /var/log/app/access.log — count the HTTP 500 responses and record the number your dashboard would show.",
          requirements: [
            "Directory ~/report exists",
            "File ~/report/5xx.txt exists and contains the 500 count",
          ],
          env: "ubuntu:24.04",
          checks: [
            { kind: "directory", path: "/home/learner/report", label: "~/report" },
            { kind: "file", path: "/home/learner/report/5xx.txt", label: "~/report/5xx.txt" },
            { kind: "filecontains", path: "/home/learner/report/5xx.txt", value: "5xx errors: 6", label: "5xx.txt says '5xx errors: 6'" },
          ],
          steps: [
            {
              title: "Look at the access log",
              detail:
                "The common log format ends each line with the status code: \"GET /api/items HTTP/1.1\" 200 512. Status 500 means the server failed.",
              command: "cat /var/log/app/access.log",
            },
            {
              title: "Filter the 500s",
              detail:
                "grep 500 matches lines containing '500' — in this log that's exactly the failed requests (sizes and IPs never contain 500).",
              command: "grep 500 /var/log/app/access.log",
            },
            {
              title: "Count them",
              detail:
                "grep -c prints the count instead of the lines. The pipe version does the same: grep 500 file | wc -l.",
              command: "grep -c 500 /var/log/app/access.log",
            },
            {
              title: "Record the number",
              detail:
                "Write the count you measured (6) into the report. This is the same number a metrics scraper would turn into a graph.",
              command: "echo '5xx errors: 6' > ~/report/5xx.txt",
            },
            {
              title: "Verify and submit",
              detail: "cat the file, then submit.",
              command: "cat ~/report/5xx.txt",
            },
          ],
        },
      ],
    },
    {
      slug: "02-logs",
      title: "Log Triage",
      summary: "Extract the signal from the noise.",
      tasks: [
        {
          slug: "obs-extract-errors",
          title: "Extract Errors for the Incident Report",
          type: "practice",
          difficulty: "beginner",
          description:
            "During an incident you hand the on-call engineer a filtered log, not a gigabyte file. Extract every ERROR line from yesterday's app log into a dedicated file.",
          requirements: [
            "File ~/report/errors.log exists",
            "It contains only ERROR lines from the 2026-09-27 application log",
          ],
          env: "ubuntu:24.04",
          checks: [
            { kind: "file", path: "/home/learner/report/errors.log", label: "~/report/errors.log exists" },
            { kind: "filecontains", path: "/home/learner/report/errors.log", value: "ERROR", label: "errors.log contains ERROR lines" },
            { kind: "filecontains", path: "/home/learner/report/errors.log", value: "2026-09-27", label: "errors.log lines come from the right day" },
          ],
          steps: [
            {
              title: "Review the source log",
              detail:
                "Yesterday's log is /var/log/app/app-2026-09-27.log. Scan its shape: timestamp, level, message.",
              command: "head /var/log/app/app-2026-09-27.log",
            },
            {
              title: "Extract only the errors",
              detail:
                "grep ERROR keeps just the error lines — this filtered stream is what goes to the on-call engineer.",
              command: "grep ERROR /var/log/app/app-2026-09-27.log",
            },
            {
              title: "Save it to a file",
              detail:
                "The > redirect writes grep's output into errors.log — a proper incident artifact instead of a copy-paste.",
              command: "grep ERROR /var/log/app/app-2026-09-27.log > ~/report/errors.log",
            },
            {
              title: "Verify and submit",
              detail:
                "cat shows three ERROR lines, all from 2026-09-27. Then submit.",
              command: "cat ~/report/errors.log",
            },
          ],
        },
      ],
    },
    {
      slug: "03-alerting",
      title: "Alerting",
      summary: "A rule that pages a human should be precious.",
      tasks: [
        {
          slug: "obs-alert-rule",
          title: "Write a Prometheus Alert Rule",
          type: "guided",
          difficulty: "intermediate",
          description:
            "Alert rules are YAML files too. Write a Prometheus rule that fires when the error rate stays too high — and learn the two halves of every alert: expression and duration.",
          requirements: [
            "File ~/alerts/rules.yml exists",
            "It defines an alert named HighErrorRate with a Prometheus expression",
          ],
          env: "ubuntu:24.04",
          checks: [
            { kind: "filecontains", path: "/home/learner/alerts/rules.yml", value: "HighErrorRate", label: "alert named HighErrorRate" },
            { kind: "filecontains", path: "/home/learner/alerts/rules.yml", value: "expr:", label: "alert has an expression" },
            { kind: "filecontains", path: "/home/learner/alerts/rules.yml", value: "for: 5m", label: "alert waits 5 minutes before firing" },
          ],
          steps: [
            {
              title: "Create the rules directory",
              detail: "Prometheus loads rule files from configured paths — one directory keeps them tidy.",
              command: "mkdir ~/alerts",
            },
            {
              title: "Start the rule file",
              detail:
                "groups wrap rules; a rule has name, expr, for and labels. The expr is PromQL.",
              command: "echo 'groups:' > ~/alerts/rules.yml",
            },
            {
              title: "Add the group and alert name",
              detail:
                "HighErrorRate says exactly what broke — alert names are the first thing you see at 3am, so make them readable.",
              command: "echo '- name: app-alerts' >> ~/alerts/rules.yml",
            },
            {
              title: "Add the expression",
              detail:
                "expr: is PromQL — here: rate of 5xx responses over 5 minutes divided by total request rate, above 5%. That's 'more than 5% of requests failing'.",
              command: "echo '  rules:' >> ~/alerts/rules.yml",
            },
            {
              title: "Finish the rule",
              detail:
                "Write the rule body: '- alert: HighErrorRate', '  expr: rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m]) > 0.05', '  for: 5m'. The for clause stops blips from paging you.",
              command: "echo '  - alert: HighErrorRate' >> ~/alerts/rules.yml",
            },
            {
              title: "Add expression and duration lines",
              detail:
                "Append '    expr: rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m]) > 0.05' and '    for: 5m'. Then cat the file and submit.",
              command: "cat ~/alerts/rules.yml",
            },
          ],
        },
      ],
    },
  ],
};
