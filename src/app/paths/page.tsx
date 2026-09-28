import Link from "next/link";
import { paths, countTasks } from "@/lib/data";
import { Badge, StatCard, SectionHeader } from "@/components/ui";

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
        <h1 className="text-display font-light tracking-[-0.02em] text-ink">
          Structured paths, real environments.
        </h1>
        <p className="text-body text-smoke leading-relaxed">
          Every path is an end-to-end journey from fundamental principles to production architecture.
          Every skill breaks down into manageable topics mixing foundational knowledge with hands-on
          tasks verified by an automated validator.
        </p>
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
            return (
              <div
                key={p.slug}
                className="flex flex-col justify-between rounded-[26px] border border-stone/80 bg-warm-taupe/70 p-8 transition-all duration-200 hover:-translate-y-1 hover:border-ink/30 hover:bg-warm-taupe hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-caption uppercase text-ash font-medium tracking-wider">
                      {p.role}
                    </span>
                    <Badge variant="ink" className="font-mono text-xs">
                      {pathTaskCount} Tasks Live
                    </Badge>
                  </div>

                  <h2 className="mt-4 text-2xl font-light tracking-tight text-ink">
                    {p.title}
                  </h2>
                  <p className="mt-3 text-body-sm text-smoke leading-relaxed">
                    {p.tagline}
                  </p>

                  <div className="mt-6 border-t border-stone/60 pt-4">
                    <p className="font-mono text-[10px] uppercase text-ash tracking-wider mb-2">
                      Included Modules ({p.skills.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.skills.map((skill) => (
                        <span
                          key={skill.slug}
                          className="rounded-lg border border-stone/60 bg-eggshell/90 px-2.5 py-1 font-mono text-[11px] text-graphite"
                        >
                          {skill.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-stone/70 pt-5 flex items-center justify-between">
                  <span className="font-mono text-xs text-smoke">
                    {p.skills.length} skills · {pathTaskCount} tasks
                  </span>
                  <Link
                    href={`/paths/${p.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-medium text-eggshell transition-opacity hover:opacity-85"
                  >
                    Open Curriculum ↗
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
