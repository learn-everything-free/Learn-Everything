// Cloud progress store. GET returns the signed-in learner's persisted state;
// PUT merges the posted state into it (union of completed tasks, best streak)
// so a device that was offline can never erase newer cloud progress.
//
// Storage is Upstash Redis over HTTP — a key-value record per user, no
// database. Without Upstash credentials the endpoints return 501 and the
// client keeps working from localStorage alone.

import { auth } from "@/auth";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

const MAX_TASKS = 2000;
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365 * 2;

interface StoredProgress {
  completed: Record<string, string>;
  streak?: { count: number; lastDate: string; best: number };
}

function isStoredProgress(value: unknown): value is StoredProgress {
  if (typeof value !== "object" || value === null) return false;
  const { completed, streak } = value as Record<string, unknown>;
  if (typeof completed !== "object" || completed === null) return false;
  const entries = Object.entries(completed);
  if (entries.length > MAX_TASKS) return false;
  if (!entries.every(([k, v]) => typeof k === "string" && typeof v === "string")) return false;
  if (streak !== undefined) {
    if (typeof streak !== "object" || streak === null) return false;
    const s = streak as Record<string, unknown>;
    if (typeof s.count !== "number" || typeof s.best !== "number" || typeof s.lastDate !== "string") {
      return false;
    }
  }
  return true;
}

function merge(a: StoredProgress, b: StoredProgress): StoredProgress {
  const completed: Record<string, string> = { ...a.completed };
  for (const [slug, ts] of Object.entries(b.completed)) {
    const current = completed[slug];
    // Keep the earliest completion timestamp.
    if (!current || ts < current) completed[slug] = ts;
  }
  let streak: StoredProgress["streak"];
  if (a.streak && b.streak) {
    streak = {
      count: Math.max(a.streak.count, b.streak.count),
      best: Math.max(a.streak.best, b.streak.best),
      lastDate: a.streak.lastDate >= b.streak.lastDate ? a.streak.lastDate : b.streak.lastDate,
    };
  } else {
    streak = a.streak ?? b.streak;
  }
  return { completed, streak };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "unauthenticated" }, { status: 401 });
  }
  if (!redis) {
    return Response.json({ error: "progress-storage-not-configured" }, { status: 501 });
  }
  const raw = await redis.get(`le:progress:${session.user.id}`);
  if (!raw) return Response.json({ completed: {} });
  const state: unknown = typeof raw === "string" ? JSON.parse(raw) : raw;
  return Response.json(isStoredProgress(state) ? state : { completed: {} });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "unauthenticated" }, { status: 401 });
  }
  if (!redis) {
    return Response.json({ error: "progress-storage-not-configured" }, { status: 501 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid-json" }, { status: 400 });
  }
  if (!isStoredProgress(body)) {
    return Response.json({ error: "invalid-progress" }, { status: 400 });
  }

  const key = `le:progress:${session.user.id}`;
  const raw = await redis.get(key);
  const existing: unknown = raw ? (typeof raw === "string" ? JSON.parse(raw) : raw) : { completed: {} };
  const merged = merge(
    isStoredProgress(existing) ? existing : { completed: {} },
    body,
  );
  await redis.set(key, JSON.stringify(merged), { ex: MAX_AGE_SECONDS });
  return Response.json(merged);
}
