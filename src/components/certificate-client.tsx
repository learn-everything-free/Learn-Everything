"use client";

// Printable completion certificate for a learning path. Unlocks when every
// lab in the path is validated; the learner's name is taken from their sign-in
// session, else typed once and remembered locally. window.print() produces the
// shareable PDF.

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useProgress } from "@/lib/progress";

const NAME_KEY = "learn-everything.certificate-name.v1";

// Read-once subscription to the locally stored display name. Empty on the
// server, so the input hydrates neutral and fills in after mount.
const subscribeToName = () => () => {};
const getStoredName = () => window.localStorage.getItem(NAME_KEY) ?? "";
const getServerName = () => "";

export function CertificateClient({
  pathSlug,
  pathTitle,
  role,
  taskSlugs,
}: {
  pathSlug: string;
  pathTitle: string;
  role: string;
  taskSlugs: string[];
}) {
  const { completed } = useProgress();
  const { data: session } = useSession();
  const storedName = useSyncExternalStore(subscribeToName, getStoredName, getServerName);
  // Draft holds edits so the stored value can stay the fallback source.
  const [draft, setDraft] = useState<string | null>(null);

  const doneSlugs = taskSlugs.filter((s) => s in completed);
  const complete = taskSlugs.length > 0 && doneSlugs.length === taskSlugs.length;
  // The certificate is dated the day the path was finished.
  const completedOn = doneSlugs.reduce(
    (latest, s) => (completed[s] > latest ? completed[s] : latest),
    "",
  );

  // Prefer the signed-in name; fall back to a locally chosen display name.
  const displayName = session?.user?.name ?? (draft ?? storedName);

  if (!complete) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-xl rounded-[24px] border border-stone/80 bg-warm-taupe/70 p-10 text-center">
          <p className="font-mono text-caption uppercase tracking-wider text-ash">
            Certificate locked
          </p>
          <h1 className="mt-3 text-3xl font-light tracking-[-0.02em] text-ink">{pathTitle}</h1>
          <p className="mt-4 text-body text-smoke">
            Finish every lab in this path to unlock its certificate —{" "}
            <span className="font-medium text-ink">
              {doneSlugs.length} of {taskSlugs.length}
            </span>{" "}
            validated so far.
          </p>
          <div className="mx-auto mt-6 h-2 max-w-xs overflow-hidden rounded-full bg-stone/80">
            <div
              className="h-full rounded-full bg-ink transition-all duration-500"
              style={{
                width: `${taskSlugs.length ? Math.round((doneSlugs.length / taskSlugs.length) * 100) : 0}%`,
              }}
            />
          </div>
          <Link
            href={`/paths/${pathSlug}`}
            className="mt-8 inline-flex rounded-full bg-ink px-5 py-2.5 text-body-sm font-medium text-eggshell transition-opacity hover:opacity-85"
          >
            Back to the path →
          </Link>
        </div>
      </div>
    );
  }

  const issued = completedOn
    ? new Date(completedOn).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-12 lg:px-16">
      <div className="no-print mx-auto mb-8 flex max-w-3xl flex-wrap items-center justify-between gap-4">
        <p className="font-mono text-caption uppercase tracking-wider text-ash">
          🏅 Path complete — this certificate is yours
        </p>
        <div className="flex gap-3">
          {!session && (
            <input
              value={draft ?? storedName}
              onChange={(e) => {
                setDraft(e.target.value);
                try {
                  window.localStorage.setItem(NAME_KEY, e.target.value);
                } catch {
                  // storage unavailable: name just won't persist
                }
              }}
              placeholder="Your name"
              maxLength={60}
              className="w-48 rounded-full border border-stone bg-eggshell px-4 py-2 text-body-sm text-ink outline-none placeholder:text-ash focus:border-ink/40"
            />
          )}
          <button
            onClick={() => window.print()}
            className="rounded-full bg-ink px-5 py-2 text-body-sm font-medium text-eggshell transition-opacity hover:opacity-85"
          >
            Print / Save as PDF
          </button>
        </div>
      </div>

      <div className="certificate-sheet mx-auto max-w-3xl rounded-[28px] border-2 border-ink bg-eggshell p-10 text-center shadow-md lg:p-16">
        <p className="font-mono text-caption uppercase tracking-[0.3em] text-ash">
          Certificate of Completion
        </p>
        <div className="mx-auto mt-8 h-px w-24 bg-ink" />
        <p className="mt-10 text-body text-smoke">This certifies that</p>
        <p className="mt-4 text-4xl font-light tracking-[-0.02em] text-ink lg:text-5xl">
          {displayName.trim() || "________________"}
        </p>
        <p className="mt-8 text-body text-smoke">
          has completed every validated hands-on lab in the
          <br />
          <span className="text-xl font-medium text-ink">{pathTitle}</span>
          <br />
          <span className="font-mono text-caption uppercase text-ash">{role} path</span>
        </p>
        <div className="mx-auto mt-10 grid max-w-md grid-cols-3 divide-x divide-stone rounded-[18px] border border-stone bg-warm-taupe/70 py-4">
          <div>
            <p className="text-xl font-light text-ink">{taskSlugs.length}</p>
            <p className="mt-1 font-mono text-caption uppercase text-ash">labs validated</p>
          </div>
          <div>
            <p className="text-xl font-light text-ink">{taskSlugs.length * 50}</p>
            <p className="mt-1 font-mono text-caption uppercase text-ash">XP earned</p>
          </div>
          <div>
            <p className="text-xl font-light text-ink">100%</p>
            <p className="mt-1 font-mono text-caption uppercase text-ash">validator-checked</p>
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-md items-end justify-between">
          <div className="text-left">
            <p className="font-mono text-caption uppercase text-ash">Issued</p>
            <p className="text-body-sm font-medium text-ink">{issued}</p>
          </div>
          <div className="text-right">
            <p className="border-t border-ink pt-2 font-mono text-body-sm text-ink">
              Learn Everything
            </p>
            <p className="mt-1 font-mono text-caption text-ash">validator-verified, not self-reported</p>
          </div>
        </div>
      </div>
    </div>
  );
}
