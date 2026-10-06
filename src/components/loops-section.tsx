"use client";

// "Watch it move" — three looping terminal scenarios rendered like GIFs.
// Each loops forever, pauses on hover, and links straight into the lab that
// teaches the same workflow.

import Link from "next/link";
import { TerminalGif, type GifLine } from "@/components/terminal-gif";
import { SectionHeader } from "@/components/ui";

interface Scenario {
  id: string;
  title: string;
  tag: string;
  caption: string;
  labHref: string;
  labLabel: string;
  lines: GifLine[];
}

// Module-level so identities stay stable across renders (the typing engine
// memoizes on the lines array).
const SCENARIOS: Scenario[] = [
  {
    id: "linux",
    title: "tame-a-process — bash",
    tag: "Linux",
    caption: "One rogue worker is eating the box. Find it by CPU, kill it, watch the load drop.",
    labHref: "/lab/linux-find-process",
    labLabel: "Open the process lab",
    lines: [
      { kind: "cmd", text: "ps aux --sort=-%cpu | head -n 3" },
      { kind: "out", text: "4123  98.7  node /srv/import-worker.js", tone: "warn" },
      { kind: "cmd", text: "kill -9 4123" },
      { kind: "out", text: "process terminated — load average 4.02 → 0.41", tone: "ok" },
      { kind: "out", text: "that's the whole job. validated, +50 XP", tone: "dim" },
    ],
  },
  {
    id: "k8s",
    title: "rescue-a-pod — kubectl",
    tag: "Kubernetes",
    caption: "A pod is stuck in CrashLoopBackOff. Read the old logs, fix the env, watch it go green.",
    labHref: "/lab/k8s-debug-crash",
    labLabel: "Open the crash lab",
    lines: [
      { kind: "cmd", text: "kubectl get pods" },
      { kind: "out", text: "api-7d4f8b9c   0/1   CrashLoopBackOff   6   4m", tone: "warn" },
      { kind: "cmd", text: "kubectl logs api-7d4f8b9c --previous" },
      { kind: "out", text: "Error: missing required env var DB_HOST" },
      { kind: "cmd", text: "kubectl set env deploy/api DB_HOST=postgres:5432" },
      { kind: "out", text: "pod/api-9x2m4   1/1   Running   0   12s", tone: "ok" },
    ],
  },
  {
    id: "tf",
    title: "ship-infra — terraform",
    tag: "Terraform",
    caption: "Infrastructure from one file: plan the diff, apply it, read the state back.",
    labHref: "/lab/tf-apply-bucket",
    labLabel: "Open the terraform lab",
    lines: [
      { kind: "cmd", text: "terraform plan -out=tfplan" },
      { kind: "out", text: "Plan: 2 to add, 1 to change, 0 to destroy." },
      { kind: "cmd", text: "terraform apply tfplan" },
      { kind: "out", text: "aws_s3_bucket.artifacts: Creation complete...", tone: "ok" },
      { kind: "out", text: "Apply complete! Resources: 2 added.", tone: "ok" },
      { kind: "out", text: "state is the truth. validated, +50 XP", tone: "dim" },
    ],
  },
];

export function LoopsSection({ totalLabs }: { totalLabs: number }) {
  return (
    <section className="space-y-8">
      <SectionHeader
        tag="Like GIFs — but every line is real"
        sub="Three production moments on infinite loop. Hover to pause a frame, then open the matching lab and run the exact same commands yourself, checked by the validator."
        action={
          <Link
            href="/paths"
            className="inline-flex items-center gap-1 text-sm font-semibold text-ink transition-colors hover:text-smoke"
          >
            Browse all {totalLabs} labs →
          </Link>
        }
      >
        Watch it move
      </SectionHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {SCENARIOS.map((s) => (
          <div
            key={s.id}
            className="group flex flex-col rounded-[24px] border border-stone/80 bg-warm-taupe/70 p-4 transition-all duration-200 hover:-translate-y-1 hover:border-ink/25 hover:shadow-md"
          >
            <TerminalGif lines={s.lines} title={s.title} holdMs={2400} className="border-0" />
            <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full border border-stone/60 bg-eggshell px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-graphite">
                  {s.tag}
                </span>
                <span className="font-mono text-[10px] uppercase text-ash">loops ∞ · hover to pause</span>
              </div>
              <p className="mt-3 flex-1 text-body-sm leading-relaxed text-smoke">{s.caption}</p>
              <Link
                href={s.labHref}
                className="mt-4 inline-flex items-center justify-between gap-2 rounded-full border border-stone bg-eggshell px-4 py-2 text-xs font-medium text-graphite transition-colors hover:border-ink/40 hover:text-ink"
              >
                {s.labLabel}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
