import Link from "next/link";
import { paths, countTasks, getTasksBySkillSlug } from "@/lib/data";
import { buildCurriculumIndex } from "@/lib/curriculum-index";
import { tools } from "@/lib/tools";
import { Badge, SectionHeader, StatCard, ToolCard } from "@/components/ui";
import { ShowreelSection, UsefulnessSection } from "@/components/showreel";
import { ContinueLearning } from "@/components/continue-learning";
import { LabOfTheDay } from "@/components/lab-of-the-day";
import { LoopsSection } from "@/components/loops-section";
import { TerminalGif, type GifLine } from "@/components/terminal-gif";

const HERO_LINES: GifLine[] = [
  { kind: "out", text: "1. inspect the running container", tone: "dim" },
  { kind: "cmd", text: "docker ps -a" },
  { kind: "out", text: "9a4f21e018ab   nginx:alpine   Up 4 minutes   0.0.0.0:8080->80" },
  { kind: "out", text: "2. automated validator checks real state", tone: "dim" },
  { kind: "cmd", text: "validate-lab" },
  { kind: "out", text: "✓ Port 8080 mapped to container port 80", tone: "ok" },
  { kind: "out", text: "✓ HTTP 200 returned from the endpoint", tone: "ok" },
  { kind: "out", text: "PASSED — +50 XP earned", tone: "ok" },
];

export default function Home() {
  const curriculum = buildCurriculumIndex();

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
      <section className="relative grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        {/* Soft product-accent glows behind the content */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-24 -z-10 size-[420px] rounded-full bg-[radial-gradient(circle,rgba(255,71,4,0.12),transparent_65%)] blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-1/3 -z-10 size-[380px] rounded-full bg-[radial-gradient(circle,rgba(4,71,255,0.10),transparent_65%)] blur-2xl"
        />
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

        {/* Live terminal — loops like a GIF, pauses on hover */}
        <TerminalGif
          lines={HERO_LINES}
          title="ubuntu@learn-sandbox:~"
          badge="Validator active"
          footer={
            <>
              <span className="font-mono text-[11px] text-ash">Ready to try yourself?</span>
              <Link
                href="/lab/docker-run-app"
                className="whitespace-nowrap font-mono text-xs font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
              >
                Open Docker Lab →
              </Link>
            </>
          }
        />
      </section>

      {/* Looping terminal GIFs — three real scenarios on infinite replay */}
      <LoopsSection totalLabs={totalTasks} />

      {/* Animated showreel — video-style product tour */}
      <ShowreelSection />

      {/* Why the platform is useful, per audience */}
      <UsefulnessSection />

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
          tag="Picks Up Where You Left Off"
          sub="Labs are ordered into a curriculum. Completed ones are checked off automatically by the validator — the next four up are always ready below."
          action={
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-sm font-semibold text-ink hover:text-smoke transition-colors"
            >
              Your Dashboard →
            </Link>
          }
        >
          Jump Directly Into a Lab
        </SectionHeader>

        <LabOfTheDay tasks={curriculum.tasks} />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ContinueLearning order={curriculum.tasks} />
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
