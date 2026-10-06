"use client";

// Header account menu: sign in with the OAuth providers configured server-side
// (fetched from Auth.js's built-in /api/auth/providers), avatar + sign out when
// authenticated. On first authenticated render it merges cloud progress into
// the local store (see syncProgress in lib/progress.ts).

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { syncProgress } from "@/lib/progress";

interface ProviderInfo {
  id: string;
  name: string;
}

let syncedThisLoad = false;

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [providers, setProviders] = useState<ProviderInfo[] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // One-time cloud merge when a session appears.
  useEffect(() => {
    if (status === "authenticated" && !syncedThisLoad) {
      syncedThisLoad = true;
      void syncProgress();
    }
  }, [status]);

  useEffect(() => {
    if (!open) return;
    const onClickAway = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, [open]);

  const loadProviders = async () => {
    if (providers) return;
    try {
      const res = await fetch("/api/auth/providers");
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as Record<string, ProviderInfo>;
      setProviders(Object.values(data).filter((p) => p && typeof p.id === "string"));
    } catch {
      setProviders([]);
    }
  };

  if (status === "authenticated" && session.user) {
    const initial = (session.user.name ?? session.user.email ?? "?").charAt(0).toUpperCase();
    return (
      <div ref={containerRef} className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Account menu"
          className="flex size-9 items-center justify-center overflow-hidden rounded-full border border-stone/80 bg-eggshell transition-colors hover:bg-warm-taupe"
        >
          {session.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.user.image} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className="font-mono text-xs font-bold text-graphite">{initial}</span>
          )}
        </button>
        {open && (
          <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-[14px] border border-stone bg-eggshell p-2 shadow-[var(--shadow-subtle)]">
            <p className="truncate px-3 py-2 text-body-sm font-medium text-ink">
              {session.user.name ?? "Learner"}
            </p>
            {session.user.email && (
              <p className="truncate px-3 pb-2 font-mono text-caption text-ash">{session.user.email}</p>
            )}
            <p className="border-t border-stone px-3 pb-2 pt-2 font-mono text-caption uppercase text-ash">
              Progress syncs to your account
            </p>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="block w-full rounded-[10px] px-3 py-2 text-left text-body-sm text-graphite transition-colors hover:bg-warm-taupe hover:text-ink"
            >
              Your dashboard
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="w-full rounded-[10px] px-3 py-2 text-left text-body-sm text-graphite transition-colors hover:bg-warm-taupe hover:text-ink"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => {
          setOpen((o) => !o);
          void loadProviders();
        }}
        className="hidden whitespace-nowrap rounded-full bg-ink px-4 py-2 text-xs font-medium text-eggshell transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eggshell sm:block"
      >
        Sign in
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-[14px] border border-stone bg-eggshell p-2 shadow-[var(--shadow-subtle)]">
          <p className="px-3 pb-1.5 pt-2 font-mono text-caption uppercase text-ash">
            Save your progress
          </p>
          {providers === null ? (
            <p className="px-3 pb-2 font-mono text-mono-xs text-smoke">Loading…</p>
          ) : providers.length === 0 ? (
            <p className="px-3 pb-2 font-mono text-mono-xs text-smoke">
              OAuth not configured yet — see .env.example
            </p>
          ) : (
            providers.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setOpen(false);
                  void signIn(p.id, { callbackUrl: window.location.pathname });
                }}
                className="w-full rounded-[10px] px-3 py-2 text-left text-body-sm text-graphite transition-colors hover:bg-warm-taupe hover:text-ink"
              >
                Continue with {p.name}
              </button>
            ))
          )}
          <p className="border-t border-stone px-3 pb-1.5 pt-2 font-mono text-caption leading-relaxed text-ash">
            Free · your labs stay saved across devices
          </p>
        </div>
      )}
    </div>
  );
}
