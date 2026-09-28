import Link from "next/link";
import { paths, countTasks } from "@/lib/data";

export const metadata = { title: "Learning Paths — Learn Everything" };

export default function PathsPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-16 lg:py-24">
      <p className="font-mono text-caption uppercase text-ash">Index</p>
      <h1 className="mt-4 max-w-3xl text-display font-light tracking-[-0.02em]">
        Structured paths, real environments.
      </h1>
      <p className="mt-6 max-w-2xl text-body text-smoke">
        Every path is a sequence of skills; every skill breaks into topics; every
        topic mixes concepts with hands-on tasks that a validator checks.
      </p>

      <div className="mt-14 divide-y divide-stone border-y border-stone">
        {paths.map((p) => (
          <Link
            key={p.slug}
            href={`/paths/${p.slug}`}
            className="group grid gap-4 py-10 transition-colors hover:bg-warm-taupe lg:grid-cols-[8fr_4fr] lg:px-4"
          >
            <div>
              <p className="font-mono text-caption uppercase text-ash">{p.role}</p>
              <h2 className="mt-2 text-heading font-light tracking-[-0.02em]">{p.title}</h2>
              <p className="mt-3 max-w-xl text-body text-smoke">{p.tagline}</p>
            </div>
            <div className="flex items-start justify-between lg:justify-end lg:gap-10">
              <div className="font-mono text-mono-xs text-smoke">
                <p>{p.skills.length} SKILLS</p>
                <p className="mt-1">{countTasks(p)} TASKS</p>
              </div>
              <span className="text-body-sm text-smoke transition-colors group-hover:text-ink">↗</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
