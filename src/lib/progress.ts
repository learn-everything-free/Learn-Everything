"use client";

// Learner progress, persisted in localStorage. Validator passes are recorded
// per task slug; pages subscribe reactively. When real accounts + a backend
// land, this store is the swap point: keep the API, replace the storage.

import { useSyncExternalStore } from "react";

const KEY = "learn-everything.progress.v1";

export interface ProgressState {
  /** task slug -> ISO timestamp of first completion */
  completed: Record<string, string>;
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

export function markCompleted(slug: string): void {
  const state = load();
  if (state.completed[slug]) return;
  persist({ completed: { ...state.completed, [slug]: new Date().toISOString() } });
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
