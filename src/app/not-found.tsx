import Link from "next/link";
import { buildCurriculumIndex } from "@/lib/curriculum-index";
import { tools } from "@/lib/tools";

export default function NotFound() {
  const { tasks } = buildCurriculumIndex();
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col items-center px-6 py-28 text-center lg:px-16">
      <div className="w-full max-w-md rounded-[22px] border border-stone bg-[#121417] p-6 text-left font-mono text-xs text-stone shadow-xl">
        <p>
          <span className="text-emerald-400">learner@lab:~$</span> cd /the-page-you-wanted
        </p>
        <p className="mt-2 text-rose-400">
          bash: cd: /the-page-you-wanted: No such file or directory
        </p>
        <p className="mt-3 text-ash">
          <span className="le-caret">▌</span>
        </p>
      </div>

      <h1 className="mt-10 text-4xl font-light tracking-[-0.02em] text-ink sm:text-5xl">
        Lost in the shell.
      </h1>
      <p className="mt-4 max-w-md text-body leading-relaxed text-smoke">
        This page doesn&apos;t exist — but {tasks.length} hands-on labs, {tools.length} tool hubs
        and 3 curriculum paths do. Press ⌘K anywhere to search, or start from one of these:
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-ink px-5 py-2.5 text-body-sm font-medium text-eggshell transition-opacity hover:opacity-85"
        >
          Back home
        </Link>
        <Link
          href="/paths"
          className="rounded-full border border-stone bg-warm-taupe/80 px-5 py-2.5 text-body-sm font-medium text-graphite transition-colors hover:bg-stone/80 hover:text-ink"
        >
          Learning Paths
        </Link>
        <Link
          href="/tools"
          className="rounded-full border border-stone bg-eggshell px-5 py-2.5 text-body-sm font-medium text-graphite transition-colors hover:bg-warm-taupe hover:text-ink"
        >
          Tool Hubs
        </Link>
      </div>
    </div>
  );
}
