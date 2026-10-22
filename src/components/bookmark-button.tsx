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
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-label font-medium transition-colors ${
        saved
          ? "border-ink/40 bg-eggshell text-graphite dark:border-ink/40 dark:bg-ink/10 dark:text-graphite"
          : "border-ink/70 bg-eggshell text-graphite hover:border-ink/30 hover:text-ink"
      } ${className}`}
    >
      {saved ? "★ Saved" : "☆ Save"}
    </button>
  );
}
