import Link from "next/link";
import { paths, countTasks, getTask } from "@/lib/data";
import { Badge, ProgressBar, SectionHeader } from "@/components/ui";

const loop = [
  "Learn",
  "Understand",
  "Practice",
  "Experiment",
  "Break something",
  "Debug it",
  "Fix it",
  "Build something",
  "Prove you can do it",
];

export default function Home() {
  const continueTasks = ["linux-create-project", "docker-run-app"]
    .map((slug) => getTask(slug)!)
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-[1200px]">
      {/* Hero — two-column editorial split, left-aligned, no image */}
      <section className="grid gap-10 px-6 pb-16 pt-16 lg:grid-cols-[3fr_2fr] lg:gap-16 lg:px-10 lg:pt-24">
        <h1 className="text-display tracking-[-0.05em]">
          Don’t just learn how technology <span className="text-amber">works.</span> Learn how to actually use it.
        </h1>
        <div className="flex flex-col justify-end">
          <p className="text-body tracking-[-0.04em] text-stone">
            A free, open-source learning platform built around real environments.
            Take a task, break something, debug it, and let an automated validator
            check your work — not a multiple-choice quiz.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/paths"
              className="rounded-[2px] bg-amber px-6 py-3 text-caption font-medium tracking-[-0.03em] transition-opacity hover:opacity-80"
            >
              Browse learning paths ↗
            </Link>
            <Link
              href="/lab/linux-create-project"
              className="rounded-[2px] border border-rule px-6 py-3 text-caption tracking-[-0.03em] transition-colors hover:bg-linen"
            >
              Open a lab
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-rule">
        <div className="grid grid-cols-2 divide-rule sm:grid-cols-4 sm:divide-x">
          {[
            ["3", "learning paths"],
            ["16", "skills"],
            ["6", "hands-on tasks live"],
            ["100%", "free, forever"],
          ].map(([value, label]) => (
            <div key={label} className="px-6 py-8 lg:px-10">
              <p className="text-heading tracking-[-0.05em]">{value}</p>
              <p className="mt-2 font-mono text-mono-sm uppercase text-stone">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Continue learning */}
      <section className="px-6 py-16 lg:px-10 lg:py-24">
        <SectionHeader sub="Pick up where you left off. Tasks are validated against the real state of your lab environment.">
          Continue <span className="text-amber">learning</span>
        </SectionHeader>
        <div className="mt-10 divide-y divide-rule border-y border-rule">
          {continueTasks.map(({ task, path, skill }) => (
            <Link
              key={task.slug}
              href={`/lab/${task.slug}`}
              className="group flex flex-wrap items-center justify-between gap-4 border-l-2 border-amber px-6 py-6 transition-colors hover:bg-linen sm:px-10"
            >
              <div>
                <p className="text-body tracking-[-0.04em]">{task.title}</p>
                <p className="mt-1 font-mono text-mono-xs uppercase text-stone">
                  {path.title} / {skill.title}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <ProgressBar value={1} max={3} />
                <span className="font-mono text-mono-sm text-stone transition-colors group-hover:text-ink">
                  Resume lab ↗
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Learning paths */}
      <section className="border-t border-rule px-6 py-16 lg:px-10 lg:py-24">
        <SectionHeader sub="Structured paths built from skills, topics and tasks — the same content engine covers everything from Linux to AI infrastructure.">
          Choose a <span className="text-amber">path</span>
        </SectionHeader>
        <div className="mt-10 divide-y divide-rule border-y border-rule">
          {paths.map((p) => (
            <Link
              key={p.slug}
              href={`/paths/${p.slug}`}
              className="group flex flex-wrap items-baseline justify-between gap-4 py-8 transition-colors hover:bg-linen sm:px-4"
            >
              <div className="max-w-xl">
                <p className="font-mono text-mono-xs uppercase text-stone">{p.role}</p>
                <p className="mt-2 text-subheading tracking-[-0.03em]">{p.title}</p>
                <p className="mt-2 text-body-sm tracking-[-0.04em] text-stone">{p.tagline}</p>
              </div>
              <div className="flex items-center gap-6">
                <span className="font-mono text-mono-sm text-stone">
                  {p.skills.length} skills · {countTasks(p)} tasks
                </span>
                <span className="font-mono text-mono-sm text-stone transition-colors group-hover:text-ink">↗</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Dark block — the loop */}
      <section className="border-t border-rule bg-ink px-6 py-16 text-cream lg:px-10 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[2fr_3fr] lg:gap-16">
          <div>
            <Badge variant="amber">Core philosophy</Badge>
            <h2 className="mt-6 text-heading-lg tracking-[-0.04em]">
              Failure is part of the curriculum.
            </h2>
            <p className="mt-6 max-w-md text-body tracking-[-0.04em] text-ash">
              The platform doesn’t tell you the answer. It tells you what’s broken,
              hands you a terminal, and checks the environment when you’re done.
            </p>
          </div>
          <ol className="divide-y divide-stone/40 border-y border-stone/40">
            {loop.map((step, i) => (
              <li key={step} className="flex items-center justify-between py-4">
                <span className={`text-body tracking-[-0.04em] ${i === loop.length - 1 ? "text-amber" : ""}`}>
                  {step}
                </span>
                <span className="font-mono text-mono-xs text-stone">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
