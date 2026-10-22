import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTask } from "@/lib/data";
import { buildCurriculumIndex } from "@/lib/curriculum-index";
import { LabClient } from "@/components/lab-client";

export async function generateMetadata({
  params,
}: PageProps<"/lab/[taskId]">): Promise<Metadata> {
  const { taskId } = await params;
  const found = getTask(taskId);
  return {
    title: found ? `${found.task.title} — Lab · Learn Everything` : "Lab · Learn Everything",
  };
}

export default async function LabPage({ params }: PageProps<"/lab/[taskId]">) {
  const { taskId } = await params;
  const found = getTask(taskId);
  if (!found) notFound();
  const { task, path, skill, topic } = found;

  // Position in the curriculum drives the prev/next pager and the
  // "next lab" call-to-action shown on pass.
  const curriculum = buildCurriculumIndex();
  const idx = curriculum.tasks.findIndex((t) => t.slug === task.slug);
  const prev = idx > 0 ? curriculum.tasks[idx - 1] : null;
  const next = idx !== -1 && idx < curriculum.tasks.length - 1 ? curriculum.tasks[idx + 1] : null;

  return (
    <div>
      <LabClient
        key={task.slug}
        task={task}
        path={path}
        skill={skill}
        topic={topic}
        nextTask={next ? { slug: next.slug, title: next.title } : null}
      />
      {(prev || next) && (
        <div className="mx-auto max-w-[1280px] px-4 pb-20 sm:px-6 lg:px-16">
          <div className="grid gap-4 border-t border-ink pt-8 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/lab/${prev.slug}`}
                className="group rounded-none border border-ink/80 bg-eggshell p-5 transition-colors hover:border-ink/25 hover:bg-eggshell"
              >
                <p className="text-label text-ash">
                  ← Previous lab
                </p>
                <p className="mt-1.5 text-body-sm font-medium text-ink group-hover:underline">
                  {prev.title}
                </p>
                <p className="mt-0.5 font-mono text-caption text-ash">{prev.skillTitle}</p>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={`/lab/${next.slug}`}
                className="group rounded-none border border-ink/80 bg-eggshell p-5 text-right transition-colors hover:border-ink/25 hover:bg-eggshell"
              >
                <p className="text-label text-ash">
                  Next lab →
                </p>
                <p className="mt-1.5 text-body-sm font-medium text-ink group-hover:underline">
                  {next.title}
                </p>
                <p className="mt-0.5 font-mono text-caption text-ash">{next.skillTitle}</p>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
