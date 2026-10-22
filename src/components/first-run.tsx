"use client";

// The first-run checklist. A new learner has 324 labs and no idea where to start —
// this is the four things that matter, in order, with a link for each.

import Link from "next/link";
import { useProgress } from "@/lib/progress";

const STEPS = [
  {
    title: "Pick the track that matches the job",
    body: "Nine tracks, from DevOps and Data to Backend, Frontend and the AI coding agents. You can change later — nothing is locked.",
    href: "/paths",
    cta: "Browse the tracks",
  },
  {
    title: "Open your first lab",
    body: "A real terminal opens in your browser. No install, no cloud account, no credit card — and the validator checks the machine, not your answers.",
    href: "/lab/linux-create-project",
    cta: "Start the first lab",
  },
  {
    title: "Set a weekly target",
    body: "Three labs a week is enough to keep a streak alive. You can change the target whenever you like.",
    href: "/dashboard",
    cta: "Set a target on the dashboard",
  },
  {
    title: "Learn how the validator works",
    body: "Every lab lists the exact checks it runs, live as you type. Read them before you run anything — that list is the specification.",
    href: "/paths/devops-engineer/linux",
    cta: "See a beginner track",
  },
];

export function FirstRun() {
  const { completed } = useProgress();
  if (Object.keys(completed).length > 0) return null;

  return (
    <section className="rounded-none border border-ink bg-eggshell p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="text-label text-ash">Start here</p>
        <span className="font-mono text-caption uppercase text-ash">four steps</span>
      </div>
      <h2 className="mt-3 text-heading-sm font-light tracking-[-0.03em] text-ink">
        Four things to do first.
      </h2>
      <p className="mt-3 max-w-2xl text-body-sm text-smoke">
        The curriculum is large on purpose. These four steps are the shortest route through it.
      </p>

      <ol className="mt-8 grid gap-4 sm:grid-cols-2">
        {STEPS.map((step, i) => (
          <li key={step.title} className="border border-ink/70 p-5">
            <span className="font-mono text-mono-xs text-ash">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 text-body-sm font-medium text-ink">{step.title}</h3>
            <p className="mt-2 text-caption leading-relaxed text-smoke">{step.body}</p>
            <Link
              href={step.href}
              className="mt-4 inline-block font-mono text-caption uppercase text-ink underline underline-offset-4 transition-opacity hover:opacity-60"
            >
              {step.cta} →
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
