import Link from "next/link";
import { notFound } from "next/navigation";
import { getSkill, taskTypeLabel } from "@/lib/data";
import { Badge } from "@/components/ui";

export default async function SkillPage({ params }: PageProps<"/paths/[slug]/[skill]">) {
  const { slug, skill: skillSlug } = await params;
  const found = getSkill(slug, skillSlug);
  if (!found) notFound();
  const { path, skill } = found;

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-16 lg:py-24">
      <p className="font-mono text-caption uppercase text-ash">
        <Link href="/paths" className="hover:text-ink">Paths</Link>
        {" / "}
        <Link href={`/paths/${path.slug}`} className="hover:text-ink">{path.title}</Link>
        {" / "}{skill.title}
      </p>
      <h1 className="mt-4 text-heading font-light tracking-[-0.02em]">{skill.title}</h1>
      <p className="mt-4 max-w-2xl text-body text-smoke">{skill.summary}</p>

      <div className="mt-14 space-y-16">
        {skill.topics.map((topic) => (
          <section key={topic.slug}>
            <p className="font-mono text-caption uppercase text-ash">TOPIC</p>
            <h2 className="mt-2 text-subheading tracking-[-0.01em]">{topic.title}</h2>
            <p className="mt-2 text-body-sm text-smoke">{topic.summary}</p>
            {topic.lesson ? (
              <div
                className="lesson mt-4 max-w-2xl text-body-sm text-graphite"
                dangerouslySetInnerHTML={{ __html: topic.lesson }}
              />
            ) : null}
            <div className="mt-6 grid gap-4">
              {topic.tasks.map((task) => (
                <Link
                  key={task.slug}
                  href={`/lab/${task.slug}`}
                  className="group flex flex-wrap items-center justify-between gap-4 rounded-[20px] bg-warm-taupe px-8 py-6 transition-colors hover:bg-stone"
                >
                  <div>
                    <p className="text-body">{task.title}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="ink">{taskTypeLabel[task.type]}</Badge>
                      <Badge>{task.difficulty}</Badge>
                    </div>
                  </div>
                  <span className="text-body-sm text-smoke transition-colors group-hover:text-ink">
                    Open lab ↗
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
