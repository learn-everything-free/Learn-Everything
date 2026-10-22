import Link from "next/link";
import type { ReactNode } from "react";

export interface PlatformStats {
  tracks: number;
  labs: number;
  skills: number;
  tools: number;
}

// DESIGN.md hero: a tracked-out eyebrow, a monumental display word, one filled
// action and one outlined pill. The index row underneath is the map of the
// whole platform — tracks, labs, tool hubs, the tutor and the record — instead
// of a teaser for a single course.

export function Hero({ stats }: { stats: PlatformStats }) {
  const index = [
    { name: "Tracks", meta: `${stats.tracks} career paths`, href: "/paths" },
    { name: "Labs", meta: `${stats.labs} labs · ${stats.skills} skills`, href: "/labs" },
    { name: "Tool hubs", meta: `${stats.tools} references`, href: "/tools" },
    { name: "AI chat", meta: "4 model sources", href: "/chat" },
    { name: "Progress", meta: "XP & certificates", href: "/dashboard" },
  ];

  return (
    <section className="border-b border-ink/70">
      <div className="mx-auto max-w-[1400px] px-5 pt-20 sm:px-8 lg:pt-28">
        <p className="le-label text-smoke">
          {stats.tracks} career tracks · {stats.labs} validated labs · {stats.tools} tool hubs
        </p>

        <h1 className="mt-8 text-[52px] font-medium uppercase leading-[1.02] tracking-[-0.056em] text-ink sm:text-[84px] lg:text-[120px]">
          Learn by
          <br />
          doing it
        </h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <p className="max-w-[52ch] text-body text-graphite leading-[1.5]">
            From the Linux shell to Kubernetes, Python pipelines, RAG and frontend work: every lab
            is a real task in a sandbox in your browser, graded on the machine, not on multiple
            choice. A reference hub for each tool, an AI tutor that can run offline, and a
            certificate at the end of the track.
          </p>

          <div className="flex flex-col items-start gap-4 lg:items-end">
            <Link href="/paths" className="le-action">
              Pick a track
            </Link>
            <Link href="/labs" className="le-outline">
              Browse all {stats.labs} labs
            </Link>
          </div>
        </div>

        {/* Platform index — the five surfaces, one hairline cell each */}
        <div className="mt-16 grid grid-cols-2 gap-px border-t border-ink/70 bg-ink/15 lg:mt-20 lg:grid-cols-5">
          {index.map((entry, i) => (
            <Link
              key={entry.href}
              href={entry.href}
              className={`group flex flex-col justify-between gap-6 bg-eggshell py-5 pr-4 transition-colors hover:bg-warm-taupe even:pl-3 sm:py-6 lg:px-6 lg:even:pl-6 lg:first:pl-0 ${
                i === index.length - 1 ? "col-span-2 lg:col-span-1" : ""
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="le-label text-smoke">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="text-body-sm text-smoke transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden
                >
                  →
                </span>
              </span>
              <span>
                <span className="block text-[20px] font-medium leading-none tracking-tight text-ink">
                  {entry.name}
                </span>
                <span className="mt-2 block text-label uppercase tracking-[1px] text-smoke">
                  {entry.meta}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Section display heading — the wall-of-text opener with an eyebrow above. */
export function DisplayHeading({
  eyebrow,
  children,
  className = "",
}: {
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {eyebrow && <p className="le-label text-smoke">{eyebrow}</p>}
      <h2 className="mt-6 text-[34px] font-medium uppercase leading-[1.18] tracking-[-0.056em] text-ink sm:text-[50px] lg:text-[60px]">
        {children}
      </h2>
    </div>
  );
}
