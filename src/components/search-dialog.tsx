"use client";

// Site-wide command palette: a search button in the nav plus a ⌘K / Ctrl+K
// dialog that fuzzy-filters over paths, skills, labs, tools and static pages.

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SearchItem } from "@/lib/search-index";

const KIND_STYLES: Record<SearchItem["kind"], string> = {
  Path: "bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/30",
  Skill: "bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
  Lab: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
  Tool: "bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30",
  Page: "bg-warm-taupe text-graphite border-stone/60",
};

// Tie-breaker for equal title matches: a tool hub beats a path, which beats a
// bare skill listing, for the same name.
const KIND_RANK: Record<SearchItem["kind"], number> = {
  Tool: 0,
  Path: 1,
  Lab: 2,
  Skill: 3,
  Page: 4,
};

export function SearchDialog({ items }: { items: SearchItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 10);
    const scored = items
      .map((it, order) => {
        const title = it.title.toLowerCase();
        const haystack = `${it.subtitle} ${it.keywords ?? ""}`.toLowerCase();
        // Title hits rank above metadata hits so "kubernetes" surfaces the
        // Kubernetes hub, not the first path whose tagline mentions it.
        const score = title.startsWith(q) ? 0 : title.includes(q) ? 1 : haystack.includes(q) ? 2 : Infinity;
        return { it, order, score, kind: KIND_RANK[it.kind] };
      })
      .filter((s) => s.score !== Infinity);
    scored.sort((a, b) => a.score - b.score || a.kind - b.kind || a.order - b.order);
    return scored.slice(0, 12).map((s) => s.it);
  }, [items, query]);

  // The active row can outlive a shrinking result list; clamp before use.
  const selected = Math.min(active, results.length - 1);

  const choose = (item: SearchItem) => {
    setOpen(false);
    router.push(item.href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search the site"
        className="hidden items-center gap-2 whitespace-nowrap rounded-full border border-stone/80 bg-warm-taupe/60 px-3.5 py-1.5 text-caption text-smoke transition-colors hover:bg-stone/60 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:flex"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        Search
        <kbd className="rounded-md border border-stone/70 bg-eggshell px-1.5 py-0.5 font-mono text-[10px] text-ash">
          ⌘K
        </kbd>
      </button>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search the site"
        className="flex size-9 items-center justify-center rounded-full border border-stone/80 bg-eggshell text-graphite transition-colors hover:bg-warm-taupe md:hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 pt-[12vh] backdrop-blur-sm"
        >
          <div className="w-full max-w-lg overflow-hidden rounded-[20px] border border-stone bg-eggshell shadow-xl">
            <div className="flex items-center gap-3 border-b border-stone px-5 py-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 shrink-0 text-ash">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((i) => Math.min(i + 1, results.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((i) => Math.max(i - 1, 0));
                  } else if (e.key === "Enter" && results[selected]) {
                    choose(results[selected]);
                  } else if (e.key === "Escape") {
                    setOpen(false);
                  }
                }}
                placeholder="Search labs, tools, paths…"
                className="w-full bg-transparent text-body-sm text-ink outline-none placeholder:text-ash"
              />
              <kbd className="shrink-0 rounded-md border border-stone/70 bg-warm-taupe px-1.5 py-0.5 font-mono text-[10px] text-ash">
                esc
              </kbd>
            </div>

            <ul className="max-h-[50vh] overflow-y-auto p-2">
              {results.length === 0 && (
                <li className="px-4 py-6 text-center font-mono text-caption text-ash">
                  No matches for “{query}”
                </li>
              )}
              {results.map((item, i) => (
                <li key={`${item.kind}-${item.href}-${item.title}`}>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(item)}
                    className={`flex w-full items-center justify-between gap-3 rounded-[12px] px-3.5 py-2.5 text-left transition-colors ${
                      i === selected ? "bg-warm-taupe" : ""
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-body-sm font-medium text-ink">
                        {item.title}
                      </span>
                      <span className="block truncate font-mono text-caption text-ash">
                        {item.subtitle}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase ${KIND_STYLES[item.kind]}`}
                    >
                      {item.kind}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
