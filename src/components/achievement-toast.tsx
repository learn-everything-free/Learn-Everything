"use client";

// Global achievement-unlock toaster. Watches the progress store; whenever a
// new achievement becomes unlocked during a session (e.g. right after a lab
// validates), it pops a corner toast. Already-unlocked achievements are
// remembered in localStorage so returning learners aren't spammed.

import { useEffect, useSyncExternalStore } from "react";
import { useProgress } from "@/lib/progress";
import { evaluateAchievements } from "@/lib/achievements";
import type { AchievementIndex } from "@/lib/curriculum-index";

const SEEN_KEY = "learn-everything.achievements.seen.v1";

interface ToastItem {
  id: string;
  title: string;
  glyph: string;
}

// Active toasts live in a tiny module-level store so the watcher effect never
// calls setState directly (the toast lifecycle is external to React render).
let active: ToastItem[] = [];
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function pushToast(item: ToastItem): void {
  active = [...active, item];
  emit();
  window.setTimeout(() => removeToast(item.id), 6000);
}

function removeToast(id: string): void {
  active = active.filter((t) => t.id !== id);
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function AchievementToaster({ index }: { index: AchievementIndex }) {
  const state = useProgress();
  const toasts = useSyncExternalStore(subscribe, () => active, () => [] as ToastItem[]);

  useEffect(() => {
    const unlocked = evaluateAchievements(state, index).filter((a) => a.unlocked);
    let seen: string[] | null = null;
    try {
      const raw = window.localStorage.getItem(SEEN_KEY);
      seen = raw ? (JSON.parse(raw) as string[]) : null;
    } catch {
      seen = null;
    }
    if (seen === null) {
      // First visit with this browser: adopt current unlocks silently.
      try {
        window.localStorage.setItem(SEEN_KEY, JSON.stringify(unlocked.map((a) => a.id)));
      } catch {
        // storage unavailable: toasts would repeat per visit, still harmless
      }
      return;
    }
    const fresh = unlocked.filter((a) => !seen.includes(a.id));
    if (fresh.length === 0) return;
    try {
      window.localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, ...fresh.map((a) => a.id)]));
    } catch {
      // ignore — worst case the same unlock toasts again next visit
    }
    // A large batch means a backfill (existing learner's first visit after
    // this feature shipped) — acknowledge silently instead of toasting a wall.
    if (fresh.length > 2) return;
    for (const def of fresh) {
      pushToast({ id: def.id, title: def.title, glyph: def.glyph });
    }
  }, [state, index]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[60] flex w-72 flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto flex items-center gap-4 rounded-[18px] border border-stone bg-eggshell px-5 py-4 shadow-[var(--shadow-subtle)] le-toast-in"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-stone/60 bg-warm-taupe text-xl">
            {t.glyph}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-caption uppercase tracking-wider text-ash">
              Achievement unlocked
            </p>
            <p className="truncate text-body-sm font-medium text-ink">{t.title}</p>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            aria-label="Dismiss"
            className="shrink-0 rounded-full px-1.5 text-smoke transition-colors hover:text-ink"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
