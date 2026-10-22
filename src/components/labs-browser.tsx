"use client";

// The lab catalogue: every lab in the curriculum on one page, searchable and
// filterable by track, skill, difficulty and task type. Until now a lab was
// only reachable by drilling down through a track — this is the front door.

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { useProgress } from "@/lib/progress";
import { taskTypeLabel } from "@/lib/data";

export interface LabEntry {
  slug: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  env: string;
  pathSlug: string;
  pathTitle: string;
  skillSlug: string;
  skillTitle: string;
  topicTitle: string;
}

const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
const TYPES = ["concept", "guided", "practice", "challenge", "scenario", "project"] as const;

export function LabsBrowser({ labs }: { labs: LabEntry[] }) {
  const { completed } = useProgress();
  const [query, setQuery] = useState("");
  const [pathSlug, setPathSlug] = useState("all");
  const [skillSlug, setSkillSlug] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [type, setType] = useState("all");
  const [hideDone, setHideDone] = useState(false);

  const paths = useMemo(() => {
    const map = new Map<string, string>();
    for (const lab of labs) map.set(lab.pathSlug, lab.pathTitle);
    return [...map.entries()].map(([slug, title]) => ({ slug, title }));
  }, [labs]);

  const skills = useMemo(() => {
    const map = new Map<string, { title: string; pathSlug: string }>();
    for (const lab of labs) {
      if (pathSlug !== "all" && lab.pathSlug !== pathSlug) continue;
      map.set(lab.skillSlug, { title: lab.skillTitle, pathSlug: lab.pathSlug });
    }
    return [...map.entries()].map(([slug, v]) => ({ slug, title: v.title }));
  }, [labs, pathSlug]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return labs.filter((lab) => {
      if (pathSlug !== "all" && lab.pathSlug !== pathSlug) return false;
      if (skillSlug !== "all" && lab.skillSlug !== skillSlug) return false;
      if (difficulty !== "all" && lab.difficulty !== difficulty) return false;
      if (type !== "all" && lab.type !== type) return false;
      if (hideDone && lab.slug in completed) return false;
      if (!q) return true;
      return (
        lab.title.toLowerCase().includes(q) ||
        lab.description.toLowerCase().includes(q) ||
        lab.skillTitle.toLowerCase().includes(q) ||
        lab.topicTitle.toLowerCase().includes(q) ||
        lab.pathTitle.toLowerCase().includes(q) ||
        lab.env.toLowerCase().includes(q)
      );
    });
  }, [labs, query, pathSlug, skillSlug, difficulty, type, hideDone, completed]);

  const selectClass =
    "w-full appearance-none border border-ink bg-eggshell px-3 py-2 text-caption text-graphite focus:border-ink focus:outline-none";

  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-24 pt-12 lg:px-16 lg:pt-16">
      <section className="space-y-3">
        <p className="text-label text-ash">Lab catalogue</p>
        <h1 className="text-heading font-light tracking-[-0.03em] text-ink sm:text-heading-lg">
          Every lab, on one page.
        </h1>
        <p className="max-w-2xl text-body text-smoke">
          {labs.length} validated labs across {paths.length} career tracks. Filter by what you
          need, then open a lab and work in a real terminal.
        </p>
      </section>

      {/* Filters */}
      <section className="mt-10 border-y border-ink/70 py-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="block lg:col-span-2">
            <span className="text-label text-ash">Search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="kubectl, terraform, redis, python…"
              className="mt-2 w-full border border-ink bg-eggshell px-3 py-2.5 text-body-sm text-ink placeholder:text-ash focus:border-ink focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-label text-ash">Track</span>
            <select
              value={pathSlug}
              onChange={(e) => {
                setPathSlug(e.target.value);
                setSkillSlug("all");
              }}
              className={`mt-2 ${selectClass}`}
            >
              <option value="all">All tracks</option>
              {paths.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-label text-ash">Skill</span>
            <select
              value={skillSlug}
              onChange={(e) => setSkillSlug(e.target.value)}
              className={`mt-2 ${selectClass}`}
            >
              <option value="all">All skills</option>
              {skills.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-label text-ash">Level</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className={`mt-2 ${selectClass}`}
            >
              <option value="all">Any level</option>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-label text-ash">Type</span>
            <select value={type} onChange={(e) => setType(e.target.value)} className={`mt-2 ${selectClass}`}>
              <option value="all">Any type</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {taskTypeLabel[t] ?? t}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-end gap-2 pb-2">
            <input
              type="checkbox"
              checked={hideDone}
              onChange={(e) => setHideDone(e.target.checked)}
              className="size-4 accent-[#403a34]"
            />
            <span className="text-caption text-graphite">Hide completed</span>
          </label>
        </div>

        <p className="mt-5 font-mono text-caption text-smoke">
          {filtered.length} of {labs.length} labs
          {query.trim() && ` · matching “${query.trim()}”`}
        </p>
      </section>

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="mt-16 border border-dashed border-ink px-6 py-16 text-center text-body-sm text-smoke">
          No lab matches that combination. Clear a filter and try again.
        </p>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((lab) => {
            const done = lab.slug in completed;
            return (
              <Link
                key={lab.slug}
                href={`/lab/${lab.slug}`}
                className="group flex flex-col justify-between border border-ink/70 bg-eggshell p-5 transition-colors hover:border-ink"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="muted">{lab.difficulty}</Badge>
                    <Badge variant="outline">{taskTypeLabel[lab.type as keyof typeof taskTypeLabel] ?? lab.type}</Badge>
                    {done && <Badge variant="ink">Done</Badge>}
                  </div>
                  <h2 className="mt-3 text-body-sm font-medium leading-snug text-ink group-hover:underline">
                    {lab.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-caption leading-relaxed text-smoke">
                    {lab.description}
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-ink/20 pt-3">
                  <span className="truncate font-mono text-[10px] uppercase tracking-wider text-ash">
                    {lab.pathTitle} · {lab.topicTitle}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-ink">
                    {lab.env}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
