import Link from "next/link";
import type { ReactNode } from "react";

export interface LabTile {
  slug: string;
  title: string;
  skillTitle: string;
}

// DESIGN.md hero: a tracked-out eyebrow, a monumental display word, one filled
// action and one outlined pill. Everything sits on the canvas — no gradient,
// no shadow, no floating card.

export function Hero({ tiles }: { tiles: LabTile[] }) {
  return (
    <section className="border-b border-ink/70">
      <div className="mx-auto max-w-[1400px] px-5 pt-20 sm:px-8 lg:pt-28">
        <p className="le-label text-smoke">Nine career tracks · 240 hands-on labs</p>

        <h1 className="mt-8 text-[52px] font-medium uppercase leading-[1.02] tracking-[-0.056em] text-ink sm:text-[84px] lg:text-[120px]">
          Learn by
          <br />
          doing it
        </h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <p className="max-w-[52ch] text-body text-graphite leading-[1.5]">
            Nine structured tracks for students and career switchers. Every task opens a real
            Linux sandbox in your browser, and an automated validator checks the machine — not
            your answers. No install, no cloud bill, no sign-up.
          </p>

          <div className="flex flex-col items-start gap-4 lg:items-end">
            <Link href="/lab/linux-create-project" className="le-action">
              Start your first lab
            </Link>
            <Link href="/paths" className="le-outline">
              Browse the tracks
            </Link>
          </div>
        </div>

        {/* Hero thumbnail strip — the quick-nav into the first labs */}
        {tiles.length > 0 && (
          <div className="mt-16 flex justify-end lg:mt-20">
            <div className="flex flex-wrap gap-5">
              {tiles.slice(0, 4).map((tile, i) => (
                <Link
                  key={tile.slug}
                  href={`/lab/${tile.slug}`}
                  className={`group block w-[150px] border p-4 transition-colors ${
                    i === 0 ? "border-ink" : "border-ink/25 hover:border-ink/60"
                  }`}
                >
                  <span className="le-label block text-smoke">{tile.skillTitle}</span>
                  <span className="mt-2 block text-body-sm leading-[1.35] text-ink">
                    {tile.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
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
