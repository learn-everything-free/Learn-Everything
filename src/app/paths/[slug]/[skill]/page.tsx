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
    <div className="mx-auto max-w-[1200px] px-6 py-16 lg:px-10 lg:py-24">
      <p className="font-mono text-mono-xs uppercase text-stone">
        <Link href="/paths" className="hover:text-ink">Paths</Link>
        {" / "}
        <Link href={`/paths/${path.slug}`} className="hover:text-ink">{path.title}</Link>
        {" / "}{skill.title}
      </p>
      <h1 className="mt-4 text-heading-lg tracking-[-0.04em]">{skill.title}</h1>
      <p className="mt-4 max-w-2xl text-body tracking-[-0.04em] text-stone">{skill.summary}</p>

      <div className="mt-14 space-y-16">
        {skill.topics.map((topic) => (
          <section key={topic.slug}>
            <p className="font-mono text-mono-xs uppercase text-stone">TOPIC</p>
            <h2 className="mt-2 text-subheading tracking-[-0.03em]">{topic.title}</h2>
            <p className="mt-2 text-body-sm tracking-[-0.04em] text-stone">{topic.summary}</p>
            <div className="mt-6 divide-y divide-rule border-t border-rule">
              {topic.tasks.map((task) => (
                <Link
                  key={task.slug}
                  href={`/lab/${task.slug}`}
                  className="group flex flex-wrap items-center justify-between gap-4 border-l-2 border-amber py-5 pl-6 pr-2 transition-colors hover:bg-linen sm:pl-10"
                >
                  <div>
                    <p className="text-body tracking-[-0.04em]">{task.title}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="amber">{taskTypeLabel[task.type]}</Badge>
                      <Badge>{task.difficulty}</Badge>
                    </div>
                  </div>
                  <span className="font-mono text-mono-sm text-stone transition-colors group-hover:text-ink">
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
