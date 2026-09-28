import Link from "next/link";
import { paths, countTasks, getTask } from "@/lib/data";
import { ProgressBar, SectionHeader } from "@/components/ui";

const loop = [
  "Learn",
  "Understand",
  "Practice",
  "Experiment",
  "Break something",
  "Debug it",
  "Fix it",
  "Build something",
];

export default function Home() {
  const continueTasks = ["linux-create-project", "docker-run-app"]
    .map((slug) => getTask(slug)!)
    .filter(Boolean);
  const totalSkills = paths.reduce((n, p) => n + p.skills.length, 0);
  const totalTasks = paths.reduce((n, p) => n + countTasks(p), 0);

  return (
    <div className="mx-auto max-w-[1280px]">
      {/* Hero — asymmetric: light left headline, right body, pill buttons */}
      <section className="grid gap-10 px-6 pb-20 pt-16 lg:grid-cols-[3fr_2fr] lg:gap-16 lg:px-16 lg:pt-24">
        <h1 className="text-display font-light tracking-[-0.02em]">
          Don’t just learn how technology works. Learn how to actually use it.
        </h1>
        <div className="flex flex-col justify-end">
          <p className="text-body text-smoke">
            A free, open-source learning platform built around real environments.
            Take a task, break something, debug it, and let an automated validator
            check your work — not a multiple-choice quiz.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/paths"
              className="rounded-full border border-stone bg-ink px-4 py-2 text-body-sm font-medium text-eggshell transition-opacity hover:opacity-80"
            >
              Browse learning paths
            </Link>
            <Link
              href="/lab/linux-create-project"
              className="rounded-full border border-stone bg-eggshell px-3.5 py-2 text-body-sm font-medium text-ink transition-colors hover:bg-warm-taupe"
            >
              Open a lab
            </Link>
          </div>
        </div>
      </section>

      {/* Stats — taupe band, large card radius */}
      <section className="px-6 lg:px-16">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[24px] bg-stone sm:grid-cols-4">
          {[
            [String(paths.length), "learning paths"],
            [String(totalSkills), "skills"],
            [String(totalTasks), "hands-on tasks live"],
            ["100%", "free, forever"],
          ].map(([value, label]) => (
            <div key={label} className="bg-warm-taupe px-8 py-10">
              <p className="text-heading-sm font-light tracking-[-0.02em]">{value}</p>
              <p className="mt-2 text-body-sm text-smoke">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Continue learning — taupe feature cards */}
      <section className="px-6 py-20 lg:px-16 lg:py-24">
        <SectionHeader sub="Pick up where you left off. Tasks are validated against the real state of your lab environment.">
          Continue learning
        </SectionHeader>
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {continueTasks.map(({ task, path, skill }) => (
            <Link
              key={task.slug}
              href={`/lab/${task.slug}`}
              className="rounded-[20px] bg-warm-taupe px-8 py-7 transition-colors hover:bg-stone"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-subheading tracking-[-0.01em]">{task.title}</p>
                <span className="font-mono text-mono-xs text-smoke">↗</span>
              </div>
              <p className="mt-1 font-mono text-caption uppercase text-ash">
                {path.title} / {skill.title}
              </p>
              <div className="mt-5">
                <ProgressBar value={1} max={3} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Learning paths — hairline rows */}
      <section className="border-t border-stone px-6 py-20 lg:px-16 lg:py-24">
        <SectionHeader sub="Structured paths built from skills, topics and tasks — the same content engine covers everything from Linux to AI infrastructure.">
          Choose a path
        </SectionHeader>
        <div className="mt-10 divide-y divide-stone border-y border-stone">
          {paths.map((p) => (
            <Link
              key={p.slug}
              href={`/paths/${p.slug}`}
              className="group flex flex-wrap items-baseline justify-between gap-4 py-8 transition-colors hover:bg-warm-taupe sm:px-4"
            >
              <div className="max-w-xl">
                <p className="font-mono text-caption uppercase text-ash">{p.role}</p>
                <p className="mt-2 text-subheading tracking-[-0.01em]">{p.title}</p>
                <p className="mt-2 text-body-sm text-smoke">{p.tagline}</p>
              </div>
              <div className="flex items-center gap-6">
                <span className="font-mono text-mono-xs text-smoke">
                  {p.skills.length} skills · {countTasks(p)} tasks
                </span>
                <span className="text-body-sm text-smoke transition-colors group-hover:text-ink">↗</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Philosophy — large taupe feature panel */}
      <section className="border-t border-stone px-6 py-20 lg:px-16 lg:py-24">
        <div className="rounded-[24px] bg-warm-taupe px-8 py-12 lg:px-12 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[2fr_3fr] lg:gap-16">
            <div>
              <p className="font-mono text-caption uppercase text-ash">Core philosophy</p>
              <h2 className="mt-4 text-heading font-light tracking-[-0.02em]">
                Failure is part of the curriculum.
              </h2>
              <p className="mt-6 max-w-md text-body text-smoke">
                The platform doesn’t tell you the answer. It tells you what’s broken,
                hands you a terminal, and checks the environment when you’re done.
              </p>
            </div>
            <ol className="divide-y divide-stone">
              {[...loop, "Prove you can do it"].map((step, i) => (
                <li key={step} className="flex items-center justify-between py-3.5">
                  <span className="flex items-center gap-3 text-body">
                    {i === loop.length && (
                      <span className="size-2 rounded-full bg-ember-orange" aria-hidden />
                    )}
                    {step}
                  </span>
                  <span className="font-mono text-caption text-ash">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
