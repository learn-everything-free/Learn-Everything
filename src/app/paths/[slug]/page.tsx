import Link from "next/link";
import { notFound } from "next/navigation";
import { getPath, countTasks } from "@/lib/data";
import { Badge } from "@/components/ui";

export function generateStaticParams() {
  return [{ slug: "devops-engineer" }, { slug: "ai-engineer" }, { slug: "mlops-engineer" }];
}

export default async function PathPage({ params }: PageProps<"/paths/[slug]">) {
  const { slug } = await params;
  const path = getPath(slug);
  if (!path) notFound();

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16 lg:px-10 lg:py-24">
      <p className="font-mono text-mono-xs uppercase text-stone">
        <Link href="/paths" className="hover:text-ink">Paths</Link> / {path.role}
      </p>
      <h1 className="mt-4 text-display tracking-[-0.05em]">{path.title}</h1>
      <p className="mt-6 max-w-2xl text-body tracking-[-0.04em] text-stone">{path.tagline}</p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Badge variant="ink">{path.skills.length} skills</Badge>
        <Badge>{countTasks(path)} tasks live</Badge>
      </div>

      <div className="mt-14 divide-y divide-rule border-y border-rule">
        {path.skills.map((skill, i) => {
          const topicCount = skill.topics.length;
          const taskCount = skill.topics.reduce((n, t) => n + t.tasks.length, 0);
          return (
            <div key={skill.slug} className="py-8 sm:px-4">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <p className="font-mono text-mono-xs uppercase text-stone">
                    SKILL {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-2 text-subheading tracking-[-0.03em]">{skill.title}</h2>
                  <p className="mt-2 max-w-xl text-body-sm tracking-[-0.04em] text-stone">{skill.summary}</p>
                </div>
                <span className="font-mono text-mono-sm text-stone">
                  {topicCount} topics · {taskCount} tasks
                </span>
              </div>

              {topicCount > 0 ? (
                <div className="mt-6 divide-y divide-rule border-t border-rule">
                  {skill.topics.map((topic) => (
                    <div key={topic.slug} className="flex flex-wrap items-center justify-between gap-4 py-5">
                      <div>
                        <p className="text-body-sm tracking-[-0.04em]">{topic.title}</p>
                        <p className="mt-1 font-mono text-mono-xs uppercase text-stone">{topic.summary}</p>
                      </div>
                      <Link
                        href={`/paths/${path.slug}/${skill.slug}`}
                        className="font-mono text-mono-sm text-stone transition-colors hover:text-ink"
                      >
                        Open skill ↗
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 border-t border-rule pt-5 font-mono text-mono-xs uppercase text-stone">
                  Content in progress — contributions welcome via Git
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
