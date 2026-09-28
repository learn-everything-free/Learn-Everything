import type { ReactNode } from "react";
import Link from "next/link";
import { ToolIcon } from "./icons";
import type { ToolDefinition } from "@/lib/tools";

export function Badge({
  children,
  variant = "taupe",
  className = "",
}: {
  children: ReactNode;
  variant?:
    | "taupe"
    | "outline"
    | "ink"
    | "emerald"
    | "blue"
    | "amber"
    | "purple"
    | "violet";
  className?: string;
}) {
  const styles: Record<string, string> = {
    taupe: "bg-warm-taupe text-graphite border border-stone/60",
    outline: "border border-stone bg-eggshell text-ink",
    ink: "bg-ink text-eggshell",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
    blue: "bg-sky-50 text-sky-700 border border-sky-200/80",
    amber: "bg-amber-50 text-amber-800 border border-amber-200/80",
    purple: "bg-purple-50 text-purple-700 border border-purple-200/80",
    violet: "bg-indigo-50 text-indigo-700 border border-indigo-200/80",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-medium tracking-tight transition-colors ${styles[variant] ?? styles.taupe} ${className}`}
    >
      {children}
    </span>
  );
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 w-full max-w-44 rounded-full bg-stone/80 overflow-hidden">
        <div
          className="h-full rounded-full bg-ink transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-caption text-smoke font-medium">{pct}%</span>
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
        {tag && (
          <p className="font-mono text-caption uppercase text-ash tracking-wider mb-2">
            {tag}
          </p>
        )}
        <h2 className="text-heading font-light tracking-[-0.02em]">{children}</h2>
        {sub ? <p className="mt-3 text-body text-smoke">{sub}</p> : null}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Quiet metadata label in mono. */
export function MonoLabel({ children }: { children: ReactNode }) {
  return <p className="font-mono text-caption uppercase text-ash tracking-wider">{children}</p>;
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
      className={`rounded-[22px] border border-stone/80 bg-warm-taupe/90 p-7 transition-all duration-200 ${
        hover
          ? "hover:border-ink/25 hover:bg-warm-taupe hover:shadow-sm hover:-translate-y-0.5"
          : ""
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
    <div className="group rounded-[20px] border border-stone/80 bg-warm-taupe/70 p-6 transition-all hover:bg-warm-taupe hover:border-ink/20">
      <p className="text-3xl font-light tracking-[-0.03em] text-ink sm:text-4xl">{value}</p>
      <p className="mt-2 text-body-sm font-medium text-graphite">{label}</p>
      {sub && <p className="mt-1 font-mono text-caption text-smoke">{sub}</p>}
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
  const difficultyVariant =
    tool.difficulty === "beginner"
      ? "emerald"
      : tool.difficulty === "intermediate"
      ? "blue"
      : "purple";

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group relative flex flex-col justify-between rounded-[22px] border border-stone/90 bg-warm-taupe/80 p-7 transition-all duration-200 hover:-translate-y-1 hover:border-ink/30 hover:bg-warm-taupe hover:shadow-md"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <div
            className="flex size-12 items-center justify-center rounded-2xl border border-stone/60 bg-eggshell shadow-xs transition-transform duration-200 group-hover:scale-105"
            style={{ color: tool.color }}
          >
            <ToolIcon name={tool.iconName} className="size-6" color={tool.color} />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <Badge variant={difficultyVariant}>{tool.difficulty}</Badge>
            {taskCount > 0 && (
              <Badge variant="ink" className="font-mono text-[11px]">
                {taskCount} {taskCount === 1 ? "Lab" : "Labs"}
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-5">
          <p className="font-mono text-caption uppercase text-ash tracking-wider">
            {tool.category}
          </p>
          <h3 className="mt-1 text-xl font-medium tracking-tight text-ink group-hover:text-ink">
            {tool.name}
          </h3>
          <p className="mt-2 text-body-sm text-smoke line-clamp-2 leading-relaxed">
            {tool.tagline}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-stone/70 pt-4 text-body-sm">
        <span className="font-mono text-caption text-smoke">
          Est. {tool.estimatedHours} · {tool.relatedPathName}
        </span>
        <span className="flex items-center gap-1 font-medium text-ink transition-transform duration-200 group-hover:translate-x-1">
          Explore ↗
        </span>
      </div>
    </Link>
  );
}
