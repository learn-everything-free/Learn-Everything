import Link from "next/link";
import { paths, countTasks } from "@/lib/data";
import { Badge, StatCard, SectionHeader } from "@/components/ui";
import { TaskProgressMeter, XpCounter } from "@/components/progress";

export const metadata = { title: "Learning Paths — Learn Everything" };

export default function PathsPage() {
  const totalSkills = paths.reduce((n, p) => n + p.skills.length, 0);
  const totalTasks = paths.reduce((n, p) => n + countTasks(p), 0);

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-14 lg:px-16 lg:py-20 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <p className="font-mono text-caption uppercase text-ash tracking-wider">
          Curriculum Index
        </p>
        <h1 className="text-heading-lg font-medium uppercase tracking-[-3.36px] text-ink">
          Structured paths, real environments.
        </h1>
        <p className="text-body text-smoke leading-relaxed">
          Every path is an end-to-end journey from fundamental principles to production architecture.
          Every skill breaks down into manageable topics mixing foundational knowledge with hands-on
          tasks verified by an automated validator.
        </p>
        <XpCounter />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          value={String(paths.length)}
          label="Learning Paths"
          sub="Career-oriented tracks"
        />
        <StatCard
          value={String(totalSkills)}
          label="Target Skills"
          sub="Tooling & core systems"
        />
        <StatCard
          value={String(totalTasks)}
          label="Hands-On Labs"
          sub="Live interactive tasks"
        />
        <StatCard
          value="100%"
          label="Free & Open"
          sub="No paywalls or subscriptions"
        />
      </div>

      {/* Path Cards Grid */}
      <div className="space-y-6">
        <SectionHeader
          tag="Curriculum Catalog"
          sub="Choose your engineering specialization and start practicing in an isolated browser sandbox."
        >
          Active Learning Tracks
        </SectionHeader>

        <div className="grid gap-8 lg:grid-cols-3">
          {paths.map((p) => {
            const pathTaskCount = countTasks(p);
            const pathTopicCount = p.skills.reduce((n, s) => n + s.topics.length, 0);
            return (
              <div
                key={p.slug}
                className="flex flex-col justify-between rounded-none border border-ink/80 bg-eggshell p-8 transition-all duration-200 hover:border-ink/30 hover:bg-eggshell hover:"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-caption uppercase text-ash font-medium tracking-wider">
                      {p.role}
                    </span>
                    <Badge variant="outline" className="text-label">
                      {pathTaskCount} Tasks Live
                    </Badge>
                  </div>

                  <h2 className="mt-4 text-heading-sm font-medium tracking-[-2.24px] text-ink">
                    {p.title}
                  </h2>
                  <p className="mt-3 text-body-sm text-smoke leading-relaxed">
                    {p.tagline}
                  </p>

                  <div className="mt-6 border-t border-ink/60 pt-4">
                    <p className="font-mono text-label uppercase text-ash tracking-wider mb-2">
                      Included Modules ({p.skills.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.skills.map((skill) => (
                        <Link
                          key={skill.slug}
                          href={`/paths/${p.slug}/${skill.slug}`}
                          className="rounded-none border border-ink/60 bg-eggshell/90 px-2.5 py-1 font-mono text-label text-graphite transition-colors hover:border-ink/30 hover:text-ink"
                        >
                          {skill.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-ink/70 pt-5 space-y-4">
                  <TaskProgressMeter
                    slugs={p.skills.flatMap((s) => s.topics.flatMap((t) => t.tasks.map((task) => task.slug)))}
                  />
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-label text-smoke">
                      {p.skills.length} skills · {pathTopicCount} topics · {pathTaskCount} tasks
                    </span>
                    <Link
                      href={`/paths/${p.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-none bg-ink px-4 py-2 text-label font-medium text-eggshell transition-opacity hover:opacity-85"
                    >
                      Open Curriculum ↗
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
