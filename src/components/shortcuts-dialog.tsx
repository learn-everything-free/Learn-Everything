"use client";

// The keyboard shortcut sheet. Opened with "?" from anywhere that is not a
// text field, and linked from the footer.

import { useEffect, useState } from "react";

const SHORTCUTS: { keys: string[]; what: string }[] = [
  { keys: ["⌘", "K"], what: "Open the search palette" },
  { keys: ["Ctrl", "K"], what: "Open the search palette (Windows and Linux)" },
  { keys: ["Ctrl", "Enter"], what: "Submit the lab from the terminal" },
  { keys: ["?"], what: "Open this shortcut sheet" },
  { keys: ["Esc"], what: "Close a dialog" },
  { keys: ["G", "then", "L"], what: "Go to the lab catalogue" },
  { keys: ["G", "then", "P"], what: "Go to the learning paths" },
  { keys: ["G", "then", "D"], what: "Go to the dashboard" },
];

export function ShortcutsDialog() {
  const [open, setOpen] = useState(false);
  const [pendingG, setPendingG] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (typing) return;

      if (event.key === "?") {
        event.preventDefault();
        setOpen((v) => !v);
        return;
      }

      // "g" then a letter: a small, forgiving navigation layer.
      if (pendingG) {
        setPendingG(false);
        const dest =
          event.key === "l" ? "/labs" : event.key === "p" ? "/paths" : event.key === "d" ? "/dashboard" : null;
        if (dest) {
          event.preventDefault();
          window.location.href = dest;
        }
        return;
      }
      if (event.key === "g") {
        setPendingG(true);
        window.setTimeout(() => setPendingG(false), 1200);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pendingG]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg border border-ink bg-eggshell p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-label text-ash">Keyboard shortcuts</h2>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="font-mono text-caption text-ash transition-colors hover:text-ink"
          >
            ESC ✕
          </button>
        </div>

        <ul className="mt-6 divide-y divide-ink/15 border-t border-ink/20">
          {SHORTCUTS.map((s) => (
            <li key={s.what} className="flex items-center justify-between gap-6 py-3">
              <span className="text-body-sm text-graphite">{s.what}</span>
              <span className="flex shrink-0 items-center gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="border border-ink/50 bg-eggshell px-2 py-0.5 font-mono text-[11px] text-graphite"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
