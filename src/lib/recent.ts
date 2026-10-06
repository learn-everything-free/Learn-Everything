// Recently viewed labs, in localStorage only. Lets the dashboard offer
// "jump back in" without any server-side view tracking.

import { useSyncExternalStore } from "react";

const KEY = "learn-everything.recent.v1";
const MAX = 12;

export interface RecentEntry {
  slug: string;
  ts: string;
}

let cached: RecentEntry[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function load(): RecentEntry[] {
  if (loaded) return cached;
  loaded = true;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(KEY);
      const parsed = raw ? (JSON.parse(raw) as RecentEntry[]) : null;
      if (Array.isArray(parsed)) {
        cached = parsed.filter((e) => e && typeof e.slug === "string" && typeof e.ts === "string");
      }
    } catch {
      // corrupted list: start fresh
    }
  }
  return cached;
}

function persist(next: RecentEntry[]): void {
  cached = next;
  loaded = true;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage unavailable: session-only recents
  }
  for (const listener of listeners) listener();
}

/** Record a lab visit — most recent first, deduped, capped. */
export function recordVisit(slug: string): void {
  const rest = load().filter((e) => e.slug !== slug);
  persist([{ slug, ts: new Date().toISOString() }, ...rest].slice(0, MAX));
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useRecent(): RecentEntry[] {
  return useSyncExternalStore(
    subscribe,
    load,
    () => [] as RecentEntry[],
  );
}
