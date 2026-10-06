"use client";

// Per-lab scratchpad (section 04 on the lab page). Autosaves to localStorage
// on every keystroke — private to this browser, never synced.

import { useState } from "react";
import { useNote, setNote } from "@/lib/notes";

export function LabNotes({ slug }: { slug: string }) {
  const stored = useNote(slug);
  // Draft holds the live edit so the stored value stays the committed source.
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? stored;
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-mono text-caption uppercase tracking-wider text-ash">
          <span className="mr-2 text-stone">04</span>Notebook
        </h2>
        <span className="font-mono text-caption text-ash">
          {words > 0 ? `${words} ${words === 1 ? "word" : "words"} · ` : ""}saved locally in this browser
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => {
          setDraft(e.target.value);
          setNote(slug, e.target.value);
        }}
        rows={5}
        placeholder="What finally worked, gotchas hit, commands worth remembering…"
        className="mt-4 w-full resize-y rounded-[16px] border border-stone bg-eggshell p-4 font-mono text-mono-sm leading-relaxed text-graphite outline-none transition-colors placeholder:text-ash focus:border-ink/40"
      />
    </div>
  );
}
