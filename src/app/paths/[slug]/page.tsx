import Link from "next/link";
import { notFound } from "next/navigation";
import { getPath, countTasks } from "@/lib/data";
import { getTool } from "@/lib/tools";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { TaskProgressMeter } from "@/components/progress";
import { ToolIcon } from "@/components/icons";

export function generateStaticParams() {
  return [
    { slug: "devops-engineer" },
    { slug: "ai-engineer" },
    { slug: "mlops-engineer" },
  ];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PathPage({ params }: PageProps) {
  const { slug } = await params;
  const path = getPath(slug);
  if (!path) notFound();

  const totalTasks = countTasks(path);

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
        <span className="text-graphite font-medium">{path.role}</span>
      </nav>

      {/* Header */}
      <div className="space-y-4">
        <p className="font-mono text-caption uppercase text-ash tracking-wider">
          Learning Path Curriculum
        </p>
        <h1 className="text-display font-light tracking-[-0.02em] text-ink max-w-4xl">
          {path.title}
        </h1>
        <p className="text-subheading text-smoke max-w-3xl leading-relaxed">
          {path.tagline}
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Badge variant="ink">{path.skills.length} target skills</Badge>
          <Badge variant="taupe">{totalTasks} interactive tasks live</Badge>
          <Badge variant="emerald">100% Free Sandbox</Badge>
        </div>

        <div className="pt-4">
          <TaskProgressMeter slugs={path.skills.flatMap((s) => s.topics.flatMap((t) => t.tasks.map((task) => task.slug)))} />
        </div>
      </div>

      {/* Skills Grid */}
      <div className="space-y-8">
        <SectionHeader
          tag="Modules & Skills"
          sub="Master the technical stack through sequence-oriented modules with real hands-on lab tasks."
        >
          Curriculum Modules
        </SectionHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {path.skills.map((skill, i) => {
            const topicCount = skill.topics.length;
            const taskCount = skill.topics.reduce((n, t) => n + t.tasks.length, 0);
            const tool = getTool(skill.slug);

            return (
              <div
                key={skill.slug}
                className="flex flex-col justify-between rounded-[24px] border border-stone/80 bg-warm-taupe/70 p-7 transition-all duration-200 hover:-translate-y-1 hover:border-ink/25 hover:bg-warm-taupe hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-xl border border-stone/80 bg-eggshell shadow-2xs">
                        <ToolIcon
                          name={tool?.iconName ?? skill.slug}
                          className="size-5"
                          color={tool?.color ?? "currentColor"}
                        />
                      </div>
                      <div>
                        <span className="font-mono text-[10px] uppercase text-ash tracking-wider">
                          SKILL {String(i + 1).padStart(2, "0")}
                        </span>
                        <h2 className="text-xl font-medium text-ink tracking-tight">
                          {skill.title}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge variant="ink" className="font-mono text-[10px]">
                        {taskCount} {taskCount === 1 ? "Task" : "Tasks"}
                      </Badge>
                    </div>
                  </div>

                  <p className="mt-3 text-body-sm text-smoke leading-relaxed">
                    {skill.summary}
                  </p>

                  <div className="mt-4">
                    <TaskProgressMeter
                      slugs={skill.topics.flatMap((t) => t.tasks.map((task) => task.slug))}
                      label="done"
                    />
                  </div>

                  {/* Topics breakdown */}
                  {topicCount > 0 ? (
                    <div className="mt-5 space-y-2 border-t border-stone/60 pt-4">
                      <p className="font-mono text-[10px] uppercase text-ash tracking-wider">
                        Topics Covered ({topicCount})
                      </p>
                      <div className="space-y-1.5">
                        {skill.topics.map((t) => (
                          <div
                            key={t.slug}
                            className="flex items-center justify-between text-xs py-1"
                          >
                            <span className="text-graphite font-medium">
                              • {t.title}
                            </span>
                            <span className="font-mono text-[10px] text-smoke">
                              {t.tasks.length} {t.tasks.length === 1 ? "task" : "tasks"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-5 border-t border-stone/60 pt-4 font-mono text-[10px] uppercase text-ash">
                      Foundation module · Interactive labs expanding
                    </p>
                  )}
                </div>

                <div className="mt-6 border-t border-stone/70 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                  {tool ? (
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="font-mono text-caption text-graphite hover:text-ink font-semibold flex items-center gap-1"
                    >
                      Dedicated {tool.name} Hub →
                    </Link>
                  ) : (
                    <span className="font-mono text-caption text-ash">Curriculum Track</span>
                  )}
                  <Link
                    href={`/paths/${path.slug}/${skill.slug}`}
                    className="inline-flex items-center gap-1 rounded-full bg-ink px-3.5 py-1.5 font-medium text-eggshell hover:opacity-85"
                  >
                    Open Skill Lessons ↗
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
