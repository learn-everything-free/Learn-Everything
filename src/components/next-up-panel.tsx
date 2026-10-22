"use client";

// "What should I do next?" — three picks with the reason attached: the next
// lab in the track they are working in, a lab in the skill they have barely
// touched, and a short beginner lab for a quick win.

import Link from "next/link";
import { useProgress } from "@/lib/progress";
import { useRecent } from "@/lib/recent";
import { buildRecommendations, recommendationLabel } from "@/lib/next-up";
import type { CurriculumIndex } from "@/lib/curriculum-index";

export function NextUpPanel({ index }: { index: CurriculumIndex }) {
  const { completed } = useProgress();
  const recent = useRecent();
  const picks = buildRecommendations(
    index,
    completed,
    recent.map((r) => r.slug),
  );

  if (picks.length === 0) return null;

  return (
    <section className="rounded-none border border-ink/80 bg-eggshell p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="text-label text-ash">Recommended for you</p>
        <Link
          href="/labs"
          className="font-mono text-caption uppercase text-smoke underline underline-offset-4 transition-colors hover:text-ink"
        >
          Browse all labs →
        </Link>
      </div>

      <ul className="mt-6 divide-y divide-ink/15 border-t border-ink/20">
        {picks.map((pick) => (
          <li key={pick.slug}>
            <Link
              href={`/lab/${pick.slug}`}
              className="group flex flex-col gap-1 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
              <span className="min-w-0">
                <span className="block text-body-sm font-medium text-ink group-hover:underline">
                  {pick.title}
                </span>
                <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-ash">
                  {pick.pathTitle} · {pick.skillTitle}
                </span>
              </span>
              <span className="shrink-0 border border-ink/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-graphite">
                {recommendationLabel(pick.kind)} — {pick.reason}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
