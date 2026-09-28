import Link from "next/link";
import { notFound } from "next/navigation";
import { paths, getSkill, taskTypeLabel } from "@/lib/data";
import { getTool } from "@/lib/tools";
import { Badge, SectionHeader } from "@/components/ui";
import { CompletedBadge } from "@/components/progress";
import { ToolIcon } from "@/components/icons";

export function generateStaticParams() {
  const params: { slug: string; skill: string }[] = [];
  for (const p of paths) {
    for (const s of p.skills) {
      params.push({ slug: p.slug, skill: s.slug });
    }
  }
  return params;
}

interface PageProps {
  params: Promise<{ slug: string; skill: string }>;
}

export default async function SkillPage({ params }: PageProps) {
  const { slug, skill: skillSlug } = await params;
  const found = getSkill(slug, skillSlug);
  if (!found) notFound();
  const { path, skill } = found;

  const tool = getTool(skill.slug);

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-14 lg:px-16 lg:py-20 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-caption uppercase text-ash tracking-wider">
        <Link href="/" className="hover:text-ink transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/paths" className="hover:text-ink transition-colors">
          Paths
        </Link>
        <span>/</span>
        <Link href={`/paths/${path.slug}`} className="hover:text-ink transition-colors">
          {path.title}
        </Link>
        <span>/</span>
        <span className="text-graphite font-medium">{skill.title}</span>
      </nav>

      {/* Header Banner */}
      <div className="grid gap-8 rounded-[28px] border border-stone/80 bg-warm-taupe/70 p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="flex size-12 items-center justify-center rounded-2xl border border-stone/80 bg-eggshell shadow-2xs"
              style={{ color: tool?.color ?? "currentColor" }}
            >
              <ToolIcon name={tool?.iconName ?? skill.slug} className="size-6" color={tool?.color} />
            </div>
            <div>
              <p className="font-mono text-caption uppercase text-ash tracking-wider">
                Module · {path.title}
              </p>
              <h1 className="text-3xl font-light tracking-[-0.02em] text-ink sm:text-4xl">
                {skill.title}
              </h1>
            </div>
          </div>

          <p className="text-body text-smoke max-w-2xl leading-relaxed">
            {skill.summary}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Badge variant="ink">{skill.topics.length} topics</Badge>
            <Badge variant="taupe">
              {skill.topics.reduce((n, t) => n + t.tasks.length, 0)} interactive tasks
            </Badge>
          </div>
        </div>

        {/* Dedicated Tool Hub Callout if available */}
        {tool && (
          <div className="flex flex-col gap-3 rounded-2xl border border-stone/80 bg-eggshell p-6 shadow-xs lg:w-72">
            <p className="font-mono text-[10px] uppercase text-ash tracking-wider">
              Tool Deep-Dive Available
            </p>
            <p className="text-xs text-graphite font-medium">
              View full architecture diagrams, CLI cheatsheets, and production gotchas.
            </p>
            <Link
              href={`/tools/${tool.slug}`}
              className="mt-1 inline-flex items-center justify-center rounded-full bg-ink px-4 py-2 text-xs font-medium text-eggshell hover:opacity-85"
            >
              Open {tool.name} Hub ↗
            </Link>
          </div>
        )}
      </div>

      {/* Topics & Lessons */}
      <div className="space-y-16">
        {skill.topics.map((topic, i) => (
          <section
            key={topic.slug}
            className="rounded-[26px] border border-stone/80 bg-warm-taupe/50 p-8 sm:p-10 space-y-6"
          >
            <div>
              <p className="font-mono text-caption uppercase text-ash tracking-wider">
                TOPIC {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-1 text-2xl font-light tracking-tight text-ink">
                {topic.title}
              </h2>
              <p className="mt-2 text-body-sm text-smoke leading-relaxed">
                {topic.summary}
              </p>
            </div>

            {/* Compiled Lesson Content */}
            {topic.lesson ? (
              <div className="rounded-2xl border border-stone/70 bg-eggshell p-6 sm:p-8">
                <div
                  className="lesson max-w-3xl text-body-sm text-graphite"
                  dangerouslySetInnerHTML={{ __html: topic.lesson }}
                />
              </div>
            ) : null}

            {/* Hands-On Lab Tasks */}
            {topic.tasks.length > 0 && (
              <div className="space-y-4 pt-4">
                <p className="font-mono text-caption uppercase text-ash tracking-wider">
                  Hands-On Tasks in This Topic ({topic.tasks.length})
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {topic.tasks.map((task) => {
                    const diffBadge =
                      task.difficulty === "beginner"
                        ? "emerald"
                        : task.difficulty === "intermediate"
                        ? "blue"
                        : "purple";
                    return (
                      <Link
                        key={task.slug}
                        href={`/lab/${task.slug}`}
                        className="group flex flex-col justify-between rounded-2xl border border-stone/80 bg-eggshell p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-md"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={diffBadge}>{task.difficulty}</Badge>
                              <CompletedBadge slug={task.slug} />
                            </div>
                            <span className="font-mono text-[10px] text-smoke">
                              {taskTypeLabel[task.type]}
                            </span>
                          </div>
                          <h3 className="mt-3 text-base font-medium text-ink group-hover:text-ink">
                            {task.title}
                          </h3>
                          <p className="mt-2 text-body-sm text-smoke line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        </div>

                        <div className="mt-6 border-t border-stone/60 pt-3 flex items-center justify-between">
                          <span className="font-mono text-[10px] text-ash">
                            Environment: {task.env}
                          </span>
                          <span className="text-xs font-semibold text-ink group-hover:underline">
                            Launch Lab ⚡
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
