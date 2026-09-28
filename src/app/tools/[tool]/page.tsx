import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { tools, getTool, type ToolDefinition } from "@/lib/tools";
import { getTasksBySkillSlug, taskTypeLabel } from "@/lib/data";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { ToolIcon } from "@/components/icons";

export function generateStaticParams() {
  return tools.map((t) => ({ tool: t.slug }));
}

interface PageProps {
  params: Promise<{ tool: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tool: slug } = await params;
  const tool = getTool(slug);
  if (!tool) return { title: "Tool Not Found — Learn Everything" };
  return {
    title: `${tool.name} — Architecture, Labs & Cheatsheet | Learn Everything`,
    description: tool.summary,
  };
}

export default async function ToolDetailPage({ params }: PageProps) {
  const { tool: slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  const relatedTasks = getTasksBySkillSlug(tool.associatedSkillSlug);

  const difficultyVariant =
    tool.difficulty === "beginner"
      ? "emerald"
      : tool.difficulty === "intermediate"
      ? "blue"
      : "purple";

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-12 lg:px-16 lg:py-20">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 font-mono text-caption uppercase text-ash tracking-wider">
        <Link href="/" className="hover:text-ink transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/tools" className="hover:text-ink transition-colors">
          Tools
        </Link>
        <span>/</span>
        <span className="text-graphite font-medium">{tool.name}</span>
      </nav>

      {/* Tool Hero Header */}
      <header className="mt-8 grid gap-8 rounded-[28px] border border-stone/80 bg-warm-taupe/70 p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="flex size-14 items-center justify-center rounded-2xl border border-stone/80 bg-eggshell shadow-xs"
              style={{ color: tool.color }}
            >
              <ToolIcon name={tool.iconName} className="size-8" color={tool.color} />
            </div>
            <div>
              <p className="font-mono text-caption uppercase text-ash tracking-wider">
                {tool.category}
              </p>
              <h1 className="text-3xl font-light tracking-[-0.02em] text-ink sm:text-4xl">
                {tool.name}
              </h1>
            </div>
          </div>

          <p className="text-subheading font-normal text-graphite max-w-3xl leading-relaxed">
            {tool.tagline}
          </p>

          <p className="text-body text-smoke max-w-3xl leading-relaxed">
            {tool.summary}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Badge variant={difficultyVariant}>{tool.difficulty}</Badge>
            <Badge variant="taupe">Est. {tool.estimatedHours} study time</Badge>
            <Badge variant="ink">
              {relatedTasks.length} {relatedTasks.length === 1 ? "Live Lab" : "Live Labs"}
            </Badge>
            <Link
              href={`/paths/${tool.relatedPathSlug}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-smoke hover:text-ink transition-colors pl-2"
            >
              Part of {tool.relatedPathName} Path ↗
            </Link>
          </div>
        </div>

        {/* Quick Launch CTA Card */}
        {relatedTasks.length > 0 && (
          <div className="flex flex-col gap-3 rounded-[22px] border border-stone bg-eggshell p-6 shadow-xs lg:w-72">
            <p className="font-mono text-caption uppercase text-ash tracking-wider">
              Virtual Lab Ready
            </p>
            <p className="text-sm font-medium text-graphite">
              Automated testing sandbox running in your browser.
            </p>
            <Link
              href={`/lab/${relatedTasks[0].task.slug}`}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-ink px-4 py-2.5 text-body-sm font-medium text-eggshell transition-opacity hover:opacity-85 shadow-xs"
            >
              Launch First Lab ⚡
            </Link>
            <p className="text-center font-mono text-[10px] text-smoke">
              No local installation required
            </p>
          </div>
        )}
      </header>

      {/* Main Content Sections */}
      <div className="mt-16 space-y-20">
        {/* Section 1: Hands-on Interactive Labs */}
        <section id="labs">
          <SectionHeader
            tag="Hands-on Practice"
            sub="Real environment tasks with automated validation. Write real commands, verify state, and debug errors."
            action={
              <span className="font-mono text-xs text-smoke">
                {relatedTasks.length} {relatedTasks.length === 1 ? "task" : "tasks"} available
              </span>
            }
          >
            Interactive Terminal Labs
          </SectionHeader>

          {relatedTasks.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedTasks.map(({ task, topic }, index) => {
                const diffBadge =
                  task.difficulty === "beginner"
                    ? "emerald"
                    : task.difficulty === "intermediate"
                    ? "blue"
                    : "purple";
                return (
                  <div
                    key={task.slug}
                    className="flex flex-col justify-between rounded-[22px] border border-stone/80 bg-warm-taupe/70 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-ink/25 hover:bg-warm-taupe hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-caption text-ash font-medium">
                          LAB {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={diffBadge}>{task.difficulty}</Badge>
                          <Badge variant="taupe">{taskTypeLabel[task.type]}</Badge>
                        </div>
                      </div>

                      <h3 className="mt-3 text-lg font-medium tracking-tight text-ink">
                        {task.title}
                      </h3>
                      <p className="mt-1 font-mono text-[11px] text-ash">
                        Topic: {topic.title}
                      </p>
                      <p className="mt-3 text-body-sm text-smoke line-clamp-3 leading-relaxed">
                        {task.description}
                      </p>

                      <div className="mt-4 rounded-xl border border-stone/60 bg-eggshell/60 p-3">
                        <p className="font-mono text-[10px] uppercase text-ash tracking-wider">
                          Key Checks:
                        </p>
                        <ul className="mt-1 space-y-1">
                          {task.requirements.slice(0, 2).map((req, i) => (
                            <li
                              key={i}
                              className="font-mono text-[11px] text-graphite truncate flex items-center gap-1.5"
                            >
                              <span className="size-1 rounded-full bg-ink/40" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-stone/60 flex items-center justify-between">
                      <span className="font-mono text-[11px] text-smoke">
                        Env: {task.env}
                      </span>
                      <Link
                        href={`/lab/${task.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-eggshell transition-opacity hover:opacity-80"
                      >
                        Open Lab ↗
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-[24px] border border-dashed border-stone bg-warm-taupe/40 p-8 text-center">
              <p className="text-body font-medium text-graphite">
                Additional sandbox scenarios in active development
              </p>
              <p className="mt-2 text-body-sm text-smoke">
                Explore the architecture, cheatsheet, and common gotchas below while new labs are authored.
              </p>
            </div>
          )}
        </section>

        {/* Section 2: Architecture & Mental Model */}
        <section id="architecture">
          <SectionHeader
            tag="System Design"
            sub="Understand how this tool operates internally before running production workloads."
          >
            {tool.architecture.title}
          </SectionHeader>

          <div className="mt-8 grid gap-8 rounded-[24px] border border-stone/80 bg-warm-taupe/60 p-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
            <div>
              <p className="font-mono text-caption uppercase text-ash tracking-wider">
                Internal Mechanics
              </p>
              <p className="mt-3 text-body text-graphite leading-relaxed">
                {tool.architecture.explanation}
              </p>

              <div className="mt-6 rounded-2xl border border-stone/80 bg-eggshell p-5">
                <p className="font-mono text-caption uppercase text-ash tracking-wider">
                  Mental Model Rule of Thumb
                </p>
                <p className="mt-2 text-body-sm text-graphite font-medium">
                  Never treat {tool.name} as a black box. Understanding its boundary with the kernel,
                  filesystem, and network stack prevents 90% of production outages.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="font-mono text-caption uppercase text-ash tracking-wider">
                Core Architectural Subsystems
              </p>
              <div className="divide-y divide-stone/70 rounded-2xl border border-stone/80 bg-eggshell">
                {tool.architecture.components.map((comp) => (
                  <div key={comp.name} className="p-4 sm:p-5">
                    <p className="font-mono text-xs font-semibold text-ink">
                      {comp.name}
                    </p>
                    <p className="mt-1 text-body-sm text-smoke leading-relaxed">
                      {comp.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Essential Cheatsheet & CLI Reference */}
        <section id="cheatsheet">
          <SectionHeader
            tag="Developer Reference"
            sub="Curated commands, flags, and one-liners tested for everyday operational productivity."
          >
            Command Reference & Cheatsheet
          </SectionHeader>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {tool.cheatsheet.map((item, i) => (
              <div
                key={i}
                className="group flex flex-col justify-between rounded-2xl border border-stone/80 bg-warm-taupe/60 p-5 transition-all hover:bg-warm-taupe hover:border-ink/20"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase text-ash tracking-wider">
                      {item.category}
                    </span>
                  </div>
                  <div className="mt-3 overflow-x-auto rounded-xl border border-stone bg-ink px-4 py-3 text-eggshell">
                    <code className="font-mono text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      {item.command}
                    </code>
                  </div>
                </div>
                <p className="mt-3 text-body-sm text-smoke">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Key Concepts & Primitives */}
        <section id="concepts">
          <SectionHeader
            tag="Fundamental Primitives"
            sub="Core abstractions you must master to communicate and build with confidence."
          >
            Key Terminology & Primitives
          </SectionHeader>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {tool.keyConcepts.map((concept) => (
              <div
                key={concept.term}
                className="rounded-2xl border border-stone/80 bg-warm-taupe/60 p-6"
              >
                <h3 className="text-base font-medium text-ink">
                  {concept.term}
                </h3>
                <p className="mt-2 text-body-sm text-smoke leading-relaxed">
                  {concept.definition}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Real-World Pitfalls & Debugging Playbook */}
        <section id="pitfalls">
          <SectionHeader
            tag="Production War-Stories"
            sub="The exact errors that take down production systems and how to diagnose and resolve them."
          >
            Common Pitfalls & Debugging Playbook
          </SectionHeader>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {tool.pitfalls.map((pitfall, i) => (
              <div
                key={i}
                className="rounded-[22px] border border-amber-200/80 bg-amber-50/40 p-7 dark:border-amber-500/25 dark:bg-amber-500/5"
              >
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-900 dark:bg-amber-500/20 dark:text-amber-300">
                    !
                  </span>
                  <h3 className="text-base font-semibold text-graphite">
                    {pitfall.issue}
                  </h3>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase text-ash tracking-wider">
                      Symptom
                    </p>
                    <p className="mt-1 text-body-sm font-mono text-amber-950 bg-amber-100/60 p-2.5 rounded-lg border border-amber-200/60 dark:text-amber-200 dark:bg-amber-500/10 dark:border-amber-500/25">
                      {pitfall.symptom}
                    </p>
                  </div>

                  <div>
                    <p className="font-mono text-[10px] uppercase text-ash tracking-wider">
                      Resolution
                    </p>
                    <p className="mt-1 text-body-sm text-smoke leading-relaxed">
                      {pitfall.fix}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Production Engineering Checklist */}
        <section id="checklist">
          <SectionHeader
            tag="Reliability Standards"
            sub="Review this checklist before deploying workloads to staging or production clusters."
          >
            Production Readiness Checklist
          </SectionHeader>

          <div className="mt-8 rounded-[24px] border border-stone/80 bg-warm-taupe/70 p-6 sm:p-8">
            <ul className="grid gap-4 sm:grid-cols-2">
              {tool.productionChecklist.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-stone/60 bg-eggshell p-4"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mt-0.5 dark:bg-emerald-500/15 dark:text-emerald-300">
                    ✓
                  </span>
                  <span className="text-body-sm text-graphite leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section 7: Associated Path Banner */}
        <section className="rounded-[28px] border border-stone bg-ink p-8 text-eggshell lg:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <p className="font-mono text-caption uppercase text-ash tracking-wider">
                Full Curriculum Track
              </p>
              <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-eggshell">
                Master {tool.name} as part of the {tool.relatedPathName} path
              </h2>
              <p className="text-body-sm text-ash leading-relaxed">
                Tools do not exist in isolation. Learn how {tool.name} connects with other systems,
                CI/CD pipelines, and infrastructure patterns.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href={`/paths/${tool.relatedPathSlug}`}
                className="rounded-full bg-eggshell px-6 py-3 text-body-sm font-medium text-ink transition-opacity hover:opacity-90 shadow-xs"
              >
                View Full Path ↗
              </Link>
              <Link
                href="/tools"
                className="rounded-full border border-stone/40 bg-ink px-6 py-3 text-body-sm font-medium text-eggshell transition-colors hover:bg-stone/20"
              >
                Browse All Tools
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
