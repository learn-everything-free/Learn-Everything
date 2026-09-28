import type { ReactNode } from "react";

export function Badge({
  children,
  variant = "linen",
}: {
  children: ReactNode;
  variant?: "linen" | "amber" | "ink";
}) {
  const styles = {
    linen: "bg-linen text-ink",
    amber: "bg-amber text-ink",
    ink: "bg-ink text-cream",
  }[variant];
  return (
    <span
      className={`inline-block rounded-full px-4 py-1 font-mono text-mono-xs uppercase ${styles}`}
    >
      {children}
    </span>
  );
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="h-1 w-full max-w-40 rounded-full bg-linen">
        <div className="h-1 rounded-full bg-amber" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-mono-xs text-stone">{pct}%</span>
    </div>
  );
}

export function SectionHeader({
  children,
  sub,
}: {
  children: ReactNode;
  sub?: string;
}) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-heading-lg tracking-[-0.04em]">{children}</h2>
      {sub ? <p className="mt-4 text-body tracking-[-0.04em] text-stone">{sub}</p> : null}
    </div>
  );
}

/** List row with the signature 2px amber left bar (replaces bullets/icons). */
export function AccentRow({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: string;
  children?: ReactNode;
}) {
  return (
    <div className="border-l-2 border-amber px-6 py-5 sm:px-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-body tracking-[-0.04em]">{title}</p>
        {meta ? <span className="font-mono text-mono-xs uppercase text-stone">{meta}</span> : null}
      </div>
      {children ? (
        <p className="mt-1 max-w-xl text-body-sm tracking-[-0.04em] text-stone">{children}</p>
      ) : null}
    </div>
  );
}
