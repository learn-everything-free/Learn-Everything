import Link from "next/link";
import { paths, countTasks, getTask, getTasksBySkillSlug, getAllTasks } from "@/lib/data";
import { tools } from "@/lib/tools";
import { Badge, Card, ProgressBar, SectionHeader, StatCard, ToolCard } from "@/components/ui";

export default function Home() {
  const continueTasks = [
    "linux-create-project",
    "docker-run-app",
    "k8s-first-pod",
    "tf-init-plan",
  ]
    .map((slug) => getTask(slug)!)
    .filter(Boolean);

  const totalSkills = paths.reduce((n, p) => n + p.skills.length, 0);
  const totalTasks = paths.reduce((n, p) => n + countTasks(p), 0);

  // Precompute task counts for tools
  const toolTaskCounts: Record<string, number> = {};
  for (const tool of tools) {
    toolTaskCounts[tool.associatedSkillSlug] = getTasksBySkillSlug(tool.associatedSkillSlug).length;
  }

  // Curated featured tools for homepage showcase
  const featuredToolSlugs = [
    "docker",
    "kubernetes",
    "linux",
    "terraform",
    "aws",
    "rag",
    "agents",
    "observability",
    "cicd",
  ];
  const featuredTools = tools.filter((t) => featuredToolSlugs.includes(t.slug));

  return (
    <div className="mx-auto max-w-[1280px] space-y-24 px-6 pb-24 pt-12 lg:px-16 lg:pt-16">
      {/* Hero Section */}
      <section className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-stone/80 bg-warm-taupe/80 px-4 py-1.5 shadow-2xs">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs font-medium text-graphite">
              Interactive Terminal Sandboxes Live
            </span>
          </div>

          <h1 className="text-4xl font-light tracking-[-0.03em] text-ink sm:text-5xl lg:text-[56px] lg:leading-[1.1]">
            Don’t just read about tools.{" "}
            <span className="font-normal italic">Actually use them</span> in real environments.
          </h1>

          <p className="text-lg text-smoke max-w-xl leading-relaxed">
            A free, open platform built around real terminal environments. Take a task,
            break configurations, debug failures, and let automated validators check your real
            system state — no multiple-choice quizzes.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/tools"
              className="rounded-full bg-ink px-6 py-3 text-body-sm font-medium text-eggshell transition-opacity hover:opacity-85 shadow-xs"
            >
              Explore Tool Hubs →
            </Link>
            <Link
              href="/paths"
              className="rounded-full border border-stone bg-warm-taupe/80 px-5 py-3 text-body-sm font-medium text-graphite transition-colors hover:bg-stone/80 hover:text-ink"
            >
              Browse Curriculum Paths
            </Link>
            <Link
              href="/lab/linux-create-project"
              className="rounded-full border border-stone bg-eggshell px-5 py-3 text-body-sm font-medium text-graphite transition-colors hover:bg-warm-taupe hover:text-ink"
            >
              Launch First Lab ⚡
            </Link>
          </div>
        </div>

        {/* Terminal Teaser Card */}
        <div className="overflow-hidden rounded-[26px] border border-stone/90 bg-[#121417] p-6 shadow-xl text-eggshell">
          <div className="flex items-center justify-between border-b border-stone/20 pb-4">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-rose-500/80" />
              <span className="size-3 rounded-full bg-amber-500/80" />
              <span className="size-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="font-mono text-[11px] text-ash">ubuntu@learn-sandbox:~</span>
            <span className="rounded-full bg-emerald-950 px-2 py-0.5 font-mono text-[10px] text-emerald-400 border border-emerald-800/40">
              VALIDATOR ACTIVE
            </span>
          </div>

          <div className="mt-5 space-y-3 font-mono text-xs text-stone">
            <p className="text-ash"># 1. Inspect running container status</p>
            <p>
              <span className="text-emerald-400">$</span> docker ps -a
            </p>
            <div className="rounded-lg bg-black/40 p-2.5 text-[11px] text-stone/80">
              CONTAINER ID &nbsp;IMAGE &nbsp; &nbsp; &nbsp; &nbsp;STATUS &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; PORTS<br />
              9a4f21e018ab &nbsp;nginx:alpine &nbsp; Up 4 minutes &nbsp; &nbsp;0.0.0.0:8080-&gt;80
            </div>

            <p className="text-ash pt-1"># 2. Automated test verification</p>
            <p>
              <span className="text-emerald-400">$</span> validate-lab
            </p>
            <div className="space-y-1 text-[11px]">
              <p className="text-emerald-400">✓ Port 8080 mapped to container port 80 [PASS]</p>
              <p className="text-emerald-400">✓ HTTP status 200 returned from endpoint [PASS]</p>
              <p className="text-emerald-400">✓ Container restart policy enabled [PASS]</p>
            </div>
          </div>

          <div className="mt-5 border-t border-stone/20 pt-4 flex items-center justify-between">
            <span className="font-mono text-[11px] text-ash">Ready to try yourself?</span>
            <Link
              href="/lab/docker-run-app"
              className="font-mono text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Open Docker Lab →
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            value={String(tools.length)}
            label="Dedicated Tool Hubs"
            sub="Docker, K8s, Terraform, RAG..."
          />
          <StatCard
            value={String(totalTasks)}
            label="Hands-On Labs"
            sub="Automated verification"
          />
          <StatCard
            value={String(paths.length)}
            label="Structured Paths"
            sub="DevOps, AI & MLOps"
          />
          <StatCard
            value="100%"
            label="Free Forever"
            sub="Open source curriculum"
          />
        </div>
      </section>

      {/* Dedicated Tool Hubs Showcase (Good Cards for All Stuff) */}
      <section className="space-y-8">
        <SectionHeader
          tag="Separate Pages for Each Tool"
          sub="Explore individual, in-depth hubs for every major technology. Each tool page features architecture blueprints, cheatsheets, common pitfalls, and hands-on browser labs."
          action={
            <Link
              href="/tools"
              className="inline-flex items-center gap-1 text-sm font-semibold text-ink hover:text-smoke transition-colors"
            >
              View All {tools.length} Tools →
            </Link>
          }
        >
          Featured Production Tools
        </SectionHeader>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTools.map((tool) => (
            <ToolCard
              key={tool.slug}
              tool={tool}
              taskCount={toolTaskCounts[tool.associatedSkillSlug] ?? 0}
            />
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Link
            href="/tools"
            className="rounded-full border border-stone bg-warm-taupe/80 px-6 py-3 text-body-sm font-medium text-ink hover:bg-stone transition-colors shadow-2xs"
          >
            Explore Complete Tool Catalog ({tools.length} Tools) →
          </Link>
        </div>
      </section>

      {/* Structured Learning Paths Section with Good Cards */}
      <section className="space-y-8">
        <SectionHeader
          tag="Curriculum Tracks"
          sub="End-to-end paths connecting skills, architectural patterns, and practical tasks into career-ready capability."
          action={
            <Link
              href="/paths"
              className="inline-flex items-center gap-1 text-sm font-semibold text-ink hover:text-smoke transition-colors"
            >
              All Paths →
            </Link>
          }
        >
          Role-Based Learning Paths
        </SectionHeader>

        <div className="grid gap-6 lg:grid-cols-3">
          {paths.map((p) => {
            const pathTaskCount = countTasks(p);
            return (
              <Link
                key={p.slug}
                href={`/paths/${p.slug}`}
                className="group flex flex-col justify-between rounded-[24px] border border-stone/80 bg-warm-taupe/70 p-8 transition-all duration-200 hover:-translate-y-1 hover:border-ink/30 hover:bg-warm-taupe hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-caption uppercase text-ash font-medium tracking-wider">
                      {p.role}
                    </span>
                    <Badge variant="ink" className="font-mono text-[11px]">
                      {pathTaskCount} Tasks
                    </Badge>
                  </div>

                  <h3 className="mt-3 text-2xl font-light tracking-tight text-ink group-hover:text-ink">
                    {p.title}
                  </h3>

                  <p className="mt-3 text-body-sm text-smoke leading-relaxed">
                    {p.tagline}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-1.5">
                    {p.skills.slice(0, 5).map((skill) => (
                      <span
                        key={skill.slug}
                        className="rounded-md border border-stone/60 bg-eggshell/80 px-2.5 py-1 font-mono text-[10px] text-graphite uppercase"
                      >
                        {skill.title}
                      </span>
                    ))}
                    {p.skills.length > 5 && (
                      <span className="rounded-md border border-stone/60 bg-eggshell/80 px-2 py-1 font-mono text-[10px] text-ash">
                        +{p.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-8 border-t border-stone/70 pt-4 flex items-center justify-between text-body-sm">
                  <span className="font-mono text-caption text-smoke">
                    {p.skills.length} skills included
                  </span>
                  <span className="font-medium text-ink transition-transform duration-200 group-hover:translate-x-1">
                    Explore Path ↗
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Hands-On Virtual Labs Preview */}
      <section className="space-y-8">
        <SectionHeader
          tag="Zero Setup Required"
          sub="Pick up a real task directly. Everything runs in an isolated browser terminal evaluated by our automated validation engine."
        >
          Jump Directly Into a Lab
        </SectionHeader>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {continueTasks.map(({ task, path, skill }) => (
            <Link
              key={task.slug}
              href={`/lab/${task.slug}`}
              className="group flex flex-col justify-between rounded-[22px] border border-stone/80 bg-warm-taupe/70 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-ink/25 hover:bg-warm-taupe hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase text-ash tracking-wider">
                    {skill.title}
                  </span>
                  <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-medium">
                    {task.difficulty}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-medium text-ink group-hover:text-ink">
                  {task.title}
                </h3>
                <p className="mt-2 text-xs text-smoke line-clamp-2 leading-relaxed">
                  {task.description}
                </p>
              </div>

              <div className="mt-6 border-t border-stone/60 pt-3 flex items-center justify-between">
                <span className="font-mono text-[10px] text-ash">
                  Env: {task.env}
                </span>
                <span className="text-xs font-semibold text-ink group-hover:underline">
                  Launch ⚡
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Platform Philosophy Section */}
      <section className="rounded-[28px] border border-stone/80 bg-warm-taupe/70 p-8 lg:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_2fr] lg:gap-16">
          <div className="space-y-4">
            <p className="font-mono text-caption uppercase text-ash tracking-wider">
              Educational Philosophy
            </p>
            <h2 className="text-3xl font-light tracking-[-0.02em] text-ink sm:text-4xl">
              Failure is part of the curriculum.
            </h2>
            <p className="text-body text-smoke leading-relaxed">
              Real engineering expertise isn’t built by memorizing slide decks or watching videos.
              It is forged when a container crashes, a network port refuses connections, or a
              syntax mistake triggers an error — and you diagnose, fix, and verify it yourself.
            </p>
            <div className="pt-2">
              <Link
                href="/lab/linux-create-project"
                className="inline-flex rounded-full bg-ink px-5 py-2.5 text-body-sm font-medium text-eggshell transition-opacity hover:opacity-85 shadow-xs"
              >
                Experience the Lab Loop
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                num: "01",
                title: "Pick a Tool or Track",
                desc: "Choose from 15+ dedicated tool guides or structured role paths.",
              },
              {
                num: "02",
                title: "Instant In-Browser Shell",
                desc: "No local installs, VM setups, or cloud billing accounts needed.",
              },
              {
                num: "03",
                title: "Break Something & Debug",
                desc: "Real commands, real filesystem modifications, real container lifecycles.",
              },
              {
                num: "04",
                title: "Automated Verification",
                desc: "An automated validator engine checks true state, giving instant feedback.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="rounded-2xl border border-stone/80 bg-eggshell p-6"
              >
                <span className="font-mono text-sm font-bold text-ink">
                  {step.num}
                </span>
                <h3 className="mt-2 text-base font-medium text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-body-sm text-smoke leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
