"use client";

// Bookmark toggle for labs. Persisted in the progress store (localStorage +
// cloud sync) so saved labs follow the learner across devices.

import { toggleBookmark, useProgress } from "@/lib/progress";

export function BookmarkButton({ slug, className = "" }: { slug: string; className?: string }) {
  const { bookmarks } = useProgress();
  const saved = Boolean(bookmarks && slug in bookmarks);

  return (
    <button
      onClick={() => toggleBookmark(slug)}
      aria-pressed={saved}
      title={saved ? "Remove from saved labs" : "Save this lab for later"}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-medium transition-colors ${
        saved
          ? "border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
          : "border-stone/70 bg-eggshell text-graphite hover:border-ink/30 hover:text-ink"
      } ${className}`}
    >
      {saved ? "★ Saved" : "☆ Save"}
    </button>
  );
}
