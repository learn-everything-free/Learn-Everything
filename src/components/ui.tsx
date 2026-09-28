import type { ReactNode } from "react";

export function Badge({
  children,
  variant = "taupe",
}: {
  children: ReactNode;
  variant?: "taupe" | "outline" | "ink";
}) {
  const styles = {
    taupe: "bg-warm-taupe text-ink",
    outline: "border border-stone bg-eggshell text-ink",
    ink: "bg-ink text-eggshell",
  }[variant];
  return (
    <span
      className={`inline-block rounded-full px-3.5 py-1 text-body-sm ${styles}`}
    >
      {children}
    </span>
  );
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="h-1 w-full max-w-40 rounded-full bg-stone">
        <div className="h-1 rounded-full bg-ink" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-caption text-smoke">{pct}%</span>
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
      <h2 className="text-heading font-light tracking-[-0.02em]">{children}</h2>
      {sub ? <p className="mt-4 text-body text-smoke">{sub}</p> : null}
    </div>
  );
}

/** Quiet metadata label in mono. */
export function MonoLabel({ children }: { children: ReactNode }) {
  return <p className="font-mono text-caption uppercase text-ash">{children}</p>;
}
