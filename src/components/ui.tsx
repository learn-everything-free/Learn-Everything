import type { ReactNode } from "react";
import Link from "next/link";
import { ToolIcon } from "./icons";
import type { ToolDefinition } from "@/lib/tools";

// DESIGN.md: square edges, 1px walnut borders, no shadows, no fills that
// separate a card from the canvas. Pill radius is reserved for tags.

export function Badge({
  children,
  variant = "taupe",
  className = "",
}: {
  children: ReactNode;
  variant?: "taupe" | "outline" | "ink" | "muted";
  className?: string;
}) {
  const styles: Record<string, string> = {
    taupe: "border border-ink/40 text-graphite",
    outline: "border border-ink text-ink",
    ink: "border border-ink bg-ink text-eggshell",
    muted: "border border-ink/25 text-smoke",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-none px-3 py-1 text-label font-medium uppercase ${styles[variant] ?? styles.taupe} ${className}`}
    >
      {children}
    </span>
  );
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="h-px w-full max-w-44 bg-ink/25">
        <div className="h-px bg-ink" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-label uppercase tracking-[1px] text-smoke">{pct}%</span>
    </div>
  );
}

export function SectionHeader({
  children,
  sub,
  tag,
  action,
}: {
  children: ReactNode;
  sub?: string;
  tag?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="max-w-2xl">
        {tag && <p className="le-label text-smoke mb-4">{tag}</p>}
        <h2 className="text-heading-sm font-medium tracking-[-2.24px] text-ink">{children}</h2>
        {sub ? <p className="mt-4 text-body-sm text-graphite">{sub}</p> : null}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Tracked-out label, set in the sans face (mono is reserved for code). */
export function MonoLabel({ children }: { children: ReactNode }) {
  return <p className="le-label text-smoke">{children}</p>;
}

export function Card({
  children,
  className = "",
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`border border-ink/70 p-7 transition-colors ${
        hover ? "hover:border-ink" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  value,
  label,
  sub,
}: {
  value: string;
  label: string;
  sub?: string;
}) {
  return (
    <div className="border border-ink/70 p-6 transition-colors hover:border-ink">
      <p className="text-heading-sm font-medium tracking-[-2.24px] text-ink">{value}</p>
      <p className="mt-3 text-body-sm text-ink">{label}</p>
      {sub && <p className="mt-1 text-label uppercase tracking-[1px] text-smoke">{sub}</p>}
    </div>
  );
}

export function ToolCard({
  tool,
  taskCount = 0,
}: {
  tool: ToolDefinition;
  taskCount?: number;
}) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col justify-between border border-ink/70 p-7 transition-colors hover:border-ink"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <div
            className="flex size-12 items-center justify-center border border-ink/50 text-ink transition-colors group-hover:border-ink"
            style={{ color: tool.color }}
          >
            <ToolIcon name={tool.iconName} className="size-6" color={tool.color} />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <Badge variant="muted">{tool.difficulty}</Badge>
            {taskCount > 0 && (
              <Badge variant="ink">
                {taskCount} {taskCount === 1 ? "Lab" : "Labs"}
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-5">
          <p className="le-label text-smoke">{tool.category}</p>
          <h3 className="mt-2 text-body-sm font-medium tracking-tight text-ink group-hover:text-ink">
            {tool.name}
          </h3>
          <p className="mt-2 text-caption text-graphite line-clamp-2 leading-relaxed">
            {tool.tagline}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-ink/30 pt-4 text-caption">
        <span className="text-label uppercase tracking-[1px] text-smoke">
          Est. {tool.estimatedHours} · {tool.relatedPathName}
        </span>
        <span className="font-medium text-ink transition-transform duration-200 group-">
          Explore →
        </span>
      </div>
    </Link>
  );
}
