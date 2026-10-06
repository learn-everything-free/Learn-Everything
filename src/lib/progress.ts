"use client";

// Learner progress, persisted in localStorage. Validator passes are recorded
// per task slug; pages subscribe reactively. When real accounts + a backend
// land, this store is the swap point: keep the API, replace the storage.

import { useSyncExternalStore } from "react";

const KEY = "learn-everything.progress.v1";

export interface StreakState {
  /** consecutive days with at least one new completion */
  count: number;
  /** local day key (YYYY-MM-DD) of the last completion */
  lastDate: string;
  /** longest streak achieved */
  best: number;
}

export interface ProgressState {
  /** task slug -> ISO timestamp of first completion */
  completed: Record<string, string>;
  /** task slug -> ISO timestamp of when it was bookmarked */
  bookmarks?: Record<string, string>;
  streak?: StreakState;
}

const EMPTY: ProgressState = { completed: {} };

let cached: ProgressState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load(): ProgressState {
  if (loaded) return cached;
  loaded = true;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ProgressState;
        if (parsed && typeof parsed.completed === "object" && parsed.completed !== null) {
          cached = parsed;
        }
      }
    } catch {
      // corrupted state: start fresh rather than crash the app
    }
  }
  return cached;
}

function persist(next: ProgressState): void {
  cached = next;
  loaded = true;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage unavailable (private mode, quota): keep in-memory progress
  }
  for (const listener of listeners) listener();
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function bumpStreak(state: ProgressState): StreakState {
  const today = dayKey(new Date());
  const current = state.streak;
  if (current?.lastDate === today) return current;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const count = current?.lastDate === dayKey(yesterday) ? current.count + 1 : 1;
  return { count, lastDate: today, best: Math.max(count, current?.best ?? 0) };
}

export function markCompleted(slug: string): void {
  const state = load();
  // Re-submitting an already-passed task must not farm streaks or XP.
  if (state.completed[slug]) return;
  persist({
    ...state,
    completed: { ...state.completed, [slug]: new Date().toISOString() },
    streak: bumpStreak(state),
  });
  scheduleCloudSync();
}

export function toggleBookmark(slug: string): void {
  const state = load();
  const bookmarks = { ...(state.bookmarks ?? {}) };
  if (bookmarks[slug]) {
    delete bookmarks[slug];
  } else {
    bookmarks[slug] = new Date().toISOString();
  }
  persist({ ...state, bookmarks });
  scheduleCloudSync();
}

// ---- cloud sync ----------------------------------------------------------
// Progress lives in localStorage first (instant, offline); a signed-in
// learner's state is mirrored to /api/progress. On login the two states are
// merged (union of completions, best streak) so neither device can lose work.

function mergeStates(a: ProgressState, b: ProgressState): ProgressState {
  const completed = { ...a.completed };
  for (const [slug, ts] of Object.entries(b.completed)) {
    const current = completed[slug];
    if (!current || ts < current) completed[slug] = ts;
  }
  const bookmarks = { ...(a.bookmarks ?? {}) };
  for (const [slug, ts] of Object.entries(b.bookmarks ?? {})) {
    const current = bookmarks[slug];
    if (!current || ts < current) bookmarks[slug] = ts;
  }
  let streak = a.streak ?? b.streak;
  if (a.streak && b.streak) {
    streak = {
      count: Math.max(a.streak.count, b.streak.count),
      best: Math.max(a.streak.best, b.streak.best),
      lastDate: a.streak.lastDate >= b.streak.lastDate ? a.streak.lastDate : b.streak.lastDate,
    };
  }
  return { completed, bookmarks, streak };
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let pushPending = false;

async function pushCloudState(): Promise<void> {
  pushPending = false;
  await fetch("/api/progress", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(load()),
  }).catch(() => {});
}

/** Debounced push of local progress; a no-op when signed out (server 401s). */
function scheduleCloudSync(): void {
  pushPending = true;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    void pushCloudState();
  }, 2500);
}

/**
 * Fire any unsent progress push immediately. Called on page hide so closing
 * the tab right after completing a lab can't drop the last completion.
 */
export function flushPendingSync(): void {
  if (!pushPending) return;
  if (typeof navigator === "undefined" || typeof navigator.sendBeacon !== "function") return;
  pushPending = false;
  if (syncTimer) clearTimeout(syncTimer);
  try {
    navigator.sendBeacon(
      "/api/progress",
      new Blob([JSON.stringify(load())], { type: "application/json" }),
    );
  } catch {
    // beacon refused: the debounced push (or next load's merge) still covers it
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flushPendingSync);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushPendingSync();
  });
}

/**
 * Pull cloud progress, merge it with local, and push the merged result back.
 * Called once when a session is detected (see user-menu.tsx).
 */
export async function syncProgress(): Promise<"synced" | "anonymous" | "unavailable"> {
  try {
    const res = await fetch("/api/progress", { cache: "no-store" });
    if (res.status === 401) return "anonymous";
    if (!res.ok) return "unavailable";
    const remote = (await res.json()) as ProgressState;
    const merged = mergeStates(load(), remote);
    if (JSON.stringify(merged) !== JSON.stringify(load())) persist(merged);
    await fetch("/api/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(merged),
    });
    return "synced";
  } catch {
    return "unavailable";
  }
}

export function completedCount(slugs: string[]): number {
  const { completed } = load();
  return slugs.reduce((n, slug) => n + (slug in completed ? 1 : 0), 0);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Reactive progress state for client components. */
export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, load, () => EMPTY);
}

export const XP_PER_TASK = 50;

export function totalXp(state: ProgressState): number {
  return Object.keys(state.completed).length * XP_PER_TASK;
}

// ---- data ownership -------------------------------------------------------
// Learners can download their whole progress blob and re-import it on another
// device. Import merges (like cloud sync) — it can never erase completions.

export function exportProgress(): string {
  return JSON.stringify(load(), null, 2);
}

export function importProgress(json: string): "ok" | "invalid" {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return "invalid";
  }
  if (typeof parsed !== "object" || parsed === null) return "invalid";
  const raw = parsed as Record<string, unknown>;
  if (typeof raw.completed !== "object" || raw.completed === null) return "invalid";

  const completed: Record<string, string> = {};
  for (const [slug, ts] of Object.entries(raw.completed as Record<string, unknown>)) {
    if (typeof slug === "string" && typeof ts === "string") completed[slug] = ts;
  }
  const bookmarks: Record<string, string> = {};
  if (typeof raw.bookmarks === "object" && raw.bookmarks !== null) {
    for (const [slug, ts] of Object.entries(raw.bookmarks as Record<string, unknown>)) {
      if (typeof slug === "string" && typeof ts === "string") bookmarks[slug] = ts;
    }
  }
  const streak =
    typeof raw.streak === "object" && raw.streak !== null
      ? (raw.streak as ProgressState["streak"])
      : undefined;

  persist(mergeStates(load(), { completed, bookmarks, streak }));
  scheduleCloudSync();
  return "ok";
}
