// Personal solve-time records per task, in localStorage. A speedrun PB adds
// a replay reason to labs you've already cleared.

import { useSyncExternalStore } from "react";

const KEY = "learn-everything.records.v1";

type Records = Record<string, number>; // slug -> best solve time in ms

let cached: Records = {};
let loaded = false;
const listeners = new Set<() => void>();

function load(): Records {
  if (loaded) return cached;
  loaded = true;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Records;
        if (parsed && typeof parsed === "object") {
          cached = Object.fromEntries(
            Object.entries(parsed).filter(([, v]) => typeof v === "number" && v > 0),
          );
        }
      }
    } catch {
      // corrupted records: start fresh
    }
  }
  return cached;
}

function persist(next: Records): void {
  cached = next;
  loaded = true;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage unavailable: records are session-only
  }
  for (const listener of listeners) listener();
}

/** Save a solve time. Returns true if it's a new personal best. */
export function saveRecord(slug: string, ms: number): boolean {
  const current = load()[slug];
  if (current !== undefined && current <= ms) return false;
  persist({ ...load(), [slug]: ms });
  return true;
}

export function formatMs(ms: number): string {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Reactive personal best (ms) for one task; undefined when none yet. */
export function useRecord(slug: string): number | undefined {
  return useSyncExternalStore(
    subscribe,
    () => load()[slug],
    () => undefined,
  );
}
