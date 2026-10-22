"use client";

import Link from "next/link";
import { useState } from "react";
import { TerminalGif, type GifLine } from "@/components/terminal-gif";

// Three real labs from three different tracks. The homepage demo used to show a
// single Docker task, which made the whole platform read as a Linux course.
// Each scenario below is an actual task, with the actual checks the validator
// runs, so the tour is a tour of the catalogue and not a mock-up.

interface Scenario {
  id: string;
  tab: string;
  track: string;
  title: string;
  lab: string;
  slug: string;
  lines: GifLine[];
}

const SCENARIOS: Scenario[] = [
  {
    id: "linux",
    tab: "Linux",
    track: "DevOps · Linux",
    title: "learner@linux:~",
    lab: "Create a Project Structure",
    slug: "linux-create-project",
    lines: [
      { kind: "cmd", text: "mkdir -p ~/project/src ~/project/tests" },
      { kind: "out", text: "✓ Directory ~/project/src exists", tone: "ok" },
      { kind: "out", text: "✓ Directory ~/project/tests exists", tone: "ok" },
      { kind: "cmd", text: "printf '# Project\\n' > ~/project/README.md" },
      { kind: "out", text: "✓ File ~/project/README.md exists", tone: "ok" },
      { kind: "out", text: "ALL CHECKS PASSED · +50 XP · streak 4", tone: "ok" },
    ],
  },
  {
    id: "kubernetes",
    tab: "Kubernetes",
    track: "DevOps · Cluster",
    title: "learner@k8s:~",
    lab: "Run Your First Pod",
    slug: "k8s-first-pod",
    lines: [
      { kind: "cmd", text: "kubectl run web --image=nginx:alpine" },
      { kind: "out", text: "pod/web created", tone: "dim" },
      { kind: "out", text: "✓ Pod web exists", tone: "ok" },
      { kind: "out", text: "✓ Pod web is Running", tone: "ok" },
      { kind: "out", text: "ALL CHECKS PASSED · +50 XP · streak 4", tone: "ok" },
    ],
  },
  {
    id: "python",
    tab: "Python",
    track: "MLOps · Training",
    title: "learner@train-lab:~",
    lab: "First Training Script",
    slug: "ml-py-train-script",
    lines: [
      { kind: "cmd", text: "python train.py --epochs 3" },
      { kind: "out", text: "epoch 3/3 · accuracy 0.87", tone: "dim" },
      { kind: "cmd", text: "git commit -am 'first training run'" },
      { kind: "out", text: "✓ train.py calls model.fit", tone: "ok" },
      { kind: "out", text: "✓ metrics.txt records accuracy=0.87", tone: "ok" },
      { kind: "out", text: "ALL CHECKS PASSED · +50 XP", tone: "ok" },
    ],
  },
];

export function LabTour() {
  const [active, setActive] = useState(0);
  const scenario = SCENARIOS[active];

  return (
    <div className="border border-ink">
      <div className="grid grid-cols-3 border-b border-ink/20" role="group" aria-label="Example labs">
        {SCENARIOS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={i === active}
            onClick={() => setActive(i)}
            className={`border-r border-ink/20 px-2 py-3 text-left transition-colors last:border-r-0 sm:px-5 ${
              i === active
                ? "bg-ink text-eggshell"
                : "bg-eggshell text-graphite hover:bg-warm-taupe"
            }`}
          >
            <span className="block text-[10px] font-medium uppercase tracking-[0.06em] sm:text-[11px] sm:tracking-[0.08em]">
              {s.tab}
            </span>
            <span
              className={`mt-1 hidden text-[10px] leading-snug sm:block ${
                i === active ? "text-eggshell/70" : "text-ash"
              }`}
            >
              {s.track}
            </span>
          </button>
        ))}
      </div>

      <TerminalGif
        key={scenario.id}
        lines={scenario.lines}
        title={scenario.title}
        badge="Validator active"
        className="border-0"
        footer={
          <>
            <span className="min-w-0 truncate font-mono text-[10px] uppercase tracking-wider text-[#9a938a]">
              {scenario.lab}
            </span>
            <Link
              href={`/lab/${scenario.slug}`}
              className="inline-flex min-h-8 shrink-0 items-center font-mono text-[10px] uppercase tracking-wider text-[#e8e3d8] underline underline-offset-4 transition-colors hover:text-white"
            >
              Open this lab →
            </Link>
          </>
        }
      />
    </div>
  );
}
