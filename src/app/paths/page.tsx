import Link from "next/link";
import { paths, countTasks } from "@/lib/data";

export const metadata = { title: "Learning Paths — Learn Everything" };

export default function PathsPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16 lg:px-10 lg:py-24">
      <p className="font-mono text-mono-xs uppercase text-stone">Index</p>
      <h1 className="mt-4 max-w-3xl text-display tracking-[-0.05em]">
        Structured paths, real <span className="text-amber">environments.</span>
      </h1>
      <p className="mt-6 max-w-2xl text-body tracking-[-0.04em] text-stone">
        Every path is a sequence of skills; every skill breaks into topics; every
        topic mixes concepts with hands-on tasks that a validator checks.
      </p>

      <div className="mt-14 divide-y divide-rule border-y border-rule">
        {paths.map((p) => (
          <Link
            key={p.slug}
            href={`/paths/${p.slug}`}
            className="group grid gap-4 py-10 transition-colors hover:bg-linen lg:grid-cols-[8fr_4fr] lg:px-4"
          >
            <div>
              <p className="font-mono text-mono-xs uppercase text-stone">{p.role}</p>
              <h2 className="mt-2 text-heading tracking-[-0.05em]">{p.title}</h2>
              <p className="mt-3 max-w-xl text-body tracking-[-0.04em] text-stone">{p.tagline}</p>
            </div>
            <div className="flex items-start justify-between lg:justify-end lg:gap-10">
              <div className="font-mono text-mono-sm text-stone">
                <p>{p.skills.length} SKILLS</p>
                <p className="mt-1">{countTasks(p)} TASKS</p>
              </div>
              <span className="font-mono text-mono-sm text-stone transition-colors group-hover:text-ink">↗</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
