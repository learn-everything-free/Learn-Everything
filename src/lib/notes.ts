// Per-lab learner notes, persisted in localStorage only — never synced. A
// scratchpad for "what finally worked" on each task.

import { useSyncExternalStore } from "react";

const KEY = "learn-everything.notes.v1";

type Notes = Record<string, string>;

let cached: Notes = {};
let loaded = false;
const listeners = new Set<() => void>();

function load(): Notes {
  if (loaded) return cached;
  loaded = true;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Notes;
        if (parsed && typeof parsed === "object") cached = parsed;
      }
    } catch {
      // corrupted notes: start fresh rather than crash the lab
    }
  }
  return cached;
}

function persist(next: Notes): void {
  cached = next;
  loaded = true;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage unavailable: keep notes in memory for this session
  }
  for (const listener of listeners) listener();
}

export function setNote(slug: string, text: string): void {
  const next = { ...load() };
  if (text.trim()) next[slug] = text;
  else delete next[slug];
  persist(next);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Reactive note text for one task (server snapshot: empty string). */
export function useNote(slug: string): string {
  return useSyncExternalStore(
    subscribe,
    () => load()[slug] ?? "",
    () => "",
  );
}
