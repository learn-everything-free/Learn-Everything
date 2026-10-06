"use client";

// Dedicated sign-in page. Provider buttons are rendered only for providers
// configured server-side (discovered via Auth.js's /api/auth/providers), and
// each sign-in returns the learner to where they came from (?callbackUrl=…).

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

interface ProviderInfo {
  id: string;
  name: string;
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.2-2.1 3.7-5.1 3.7-8.6z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.8-5.1L1.3 17.2C3.3 21.2 7.3 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.2 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.3 6.8C.5 8.4 0 10.1 0 12s.5 3.6 1.3 5.2l3.9-2.9z"
      />
      <path
        fill="#EA4335"
        d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.3 0 3.3 2.8 1.3 6.8l3.9 2.9c.9-3 3.6-5 6.8-5z"
      />
    </svg>
  );
}

function GithubMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.53-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

const PROVIDER_ICONS: Record<string, React.ReactNode> = {
  google: <GoogleMark />,
  github: <GithubMark />,
};

export function SignInClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [providers, setProviders] = useState<ProviderInfo[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/providers")
      .then((res) => (res.ok ? res.json() : {}))
      .then((data: Record<string, ProviderInfo>) => {
        if (!cancelled) setProviders(Object.values(data).filter((p) => p && typeof p.id === "string"));
      })
      .catch(() => {
        if (!cancelled) setProviders([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const choose = async (id: string) => {
    setBusy(id);
    await signIn(id, { callbackUrl });
    setBusy(null);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-60px)] max-w-[1280px] items-center justify-center px-6 py-16 lg:px-16">
      <div className="w-full max-w-md rounded-[26px] border border-stone/80 bg-warm-taupe/70 p-10 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-ink font-mono text-lg font-bold text-eggshell">
          L
        </span>
        <h1 className="mt-6 text-3xl font-light tracking-[-0.02em] text-ink">
          {status === "authenticated" ? "You're signed in" : "Sign in to save your progress"}
        </h1>
        <p className="mt-3 text-body-sm leading-relaxed text-smoke">
          {status === "authenticated"
            ? "Your labs, streak and achievements are syncing to your account automatically."
            : "Free forever. Your validated labs, streak and bookmarks follow you across devices."}
        </p>

        {status === "authenticated" ? (
          <div className="mt-8 space-y-3">
            <button
              onClick={() => router.push(callbackUrl)}
              className="w-full rounded-full bg-ink px-5 py-3 text-body-sm font-medium text-eggshell transition-opacity hover:opacity-85"
            >
              Continue to your dashboard →
            </button>
            <button
              onClick={() => void signOut()}
              className="w-full rounded-full border border-stone bg-eggshell px-5 py-3 text-body-sm font-medium text-graphite transition-colors hover:bg-stone hover:text-ink"
            >
              Sign out
            </button>
          </div>
        ) : providers === null ? (
          <p className="mt-8 font-mono text-mono-xs text-smoke">Loading sign-in options…</p>
        ) : providers.length === 0 ? (
          <div className="mt-8 rounded-[16px] border border-dashed border-stone bg-eggshell p-6">
            <p className="text-body-sm font-medium text-ink">No sign-in providers configured yet</p>
            <p className="mt-2 font-mono text-caption leading-relaxed text-smoke">
              This instance runs without OAuth. Add AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET (see
              .env.example) to enable Google sign-in — progress keeps working from this browser
              either way.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {providers.map((p) => (
              <button
                key={p.id}
                onClick={() => void choose(p.id)}
                disabled={busy !== null}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-stone bg-eggshell px-5 py-3 text-body-sm font-medium text-ink transition-colors hover:bg-stone/60 disabled:opacity-60"
              >
                {PROVIDER_ICONS[p.id]}
                {busy === p.id ? "Redirecting…" : `Continue with ${p.name}`}
              </button>
            ))}
          </div>
        )}

        <p className="mt-8 border-t border-stone pt-6 font-mono text-caption leading-relaxed text-ash">
          No account needed to practice —{" "}
          <Link href="/paths" className="underline transition-colors hover:text-ink">
            jump into a lab
          </Link>{" "}
          as a guest.
        </p>
      </div>
    </div>
  );
}
