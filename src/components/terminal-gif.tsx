"use client";

// TerminalGif: an infinitely looping, self-typing terminal — a "living GIF".
// Types each command character by character, prints output, holds, restarts.
// Hover/focus pauses; prefers-reduced-motion renders the finished frame.

import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export interface GifLine {
  kind: "cmd" | "out";
  text: string;
  tone?: "ok" | "warn" | "dim";
}

const reduceMotionStore = {
  subscribe(onChange: () => void): () => void {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  },
  get(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  },
  getServer(): boolean {
    return false;
  },
};

interface Op {
  li: number;
  chars: number; // -1 = whole line appears at once (output lines)
}

export function TerminalGif({
  lines,
  title = "learner@lab:~",
  badge,
  footer,
  charMs = 26,
  holdMs = 2600,
  className = "",
}: {
  lines: GifLine[];
  title?: string;
  badge?: ReactNode;
  footer?: ReactNode;
  charMs?: number;
  holdMs?: number;
  className?: string;
}) {
  const reduceMotion = useSyncExternalStore(
    reduceMotionStore.subscribe,
    reduceMotionStore.get,
    reduceMotionStore.getServer,
  );

  // One op per typed character (commands) or per output line.
  const ops = useMemo<Op[]>(() => {
    const list: Op[] = [];
    lines.forEach((line, li) => {
      if (line.kind === "cmd") {
        for (let c = 1; c <= line.text.length; c++) list.push({ li, chars: c });
      } else {
        list.push({ li, chars: -1 });
      }
    });
    return list;
  }, [lines]);

  const holdTicks = Math.round(holdMs / charMs);
  const total = ops.length + holdTicks;

  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = window.setInterval(() => setTick((t) => (t + 1) % total), charMs);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion, total, charMs]);

  // What's on screen at `tick`: fully-typed lines plus the partial one.
  const rows = useMemo(() => {
    const limit = Math.min(tick, ops.length);
    const typed = new Map<number, string>();
    for (let i = 0; i < limit; i++) {
      const op = ops[i];
      typed.set(op.li, op.chars === -1 ? lines[op.li].text : lines[op.li].text.slice(0, op.chars));
    }
    const lastLine = typed.size ? Math.max(...typed.keys()) + 1 : 0;
    return lines.slice(0, lastLine).map((line, li) => ({
      key: `${li}-${line.text}`,
      line,
      text: typed.get(li) ?? "",
      partial: (typed.get(li)?.length ?? 0) < line.text.length,
    }));
  }, [tick, ops, lines]);

  const atEnd = !reduceMotion && tick >= ops.length;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      tabIndex={0}
      aria-label={`Looping terminal demo: ${title}`}
      className={`overflow-hidden rounded-[26px] border border-stone/90 bg-[#121417] p-6 text-[#edece0] shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${className}`}
    >
      {/* Window chrome */}
      <div className="flex items-center justify-between gap-3 border-b border-stone/20 pb-4">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-rose-500/80" />
          <span className="size-3 rounded-full bg-amber-500/80" />
          <span className="size-3 rounded-full bg-emerald-500/80" />
        </div>
        <span className="hidden truncate font-mono text-[11px] text-ash sm:block">{title}</span>
        {paused ? (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-stone/40 bg-stone/10 px-2 py-0.5 font-mono text-[10px] uppercase text-ash">
            ❙❙ Paused
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-800/40 bg-emerald-950 px-2 py-0.5 font-mono text-[10px] uppercase text-emerald-400">
            <span className={`size-1.5 rounded-full bg-emerald-400 ${reduceMotion ? "" : "animate-pulse"}`} />
            {badge ?? "Live"}
          </span>
        )}
      </div>

      {/* Animated body — min-height keeps multi-card grids visually aligned */}
      <div className="mt-5 min-h-[13.5rem] space-y-2.5 font-mono text-xs leading-relaxed" aria-hidden>
        {rows.map(({ key, line, text, partial }) =>
          line.kind === "cmd" ? (
            <p key={key} className="break-all text-stone">
              <span className="text-emerald-400">$ </span>
              {text}
              {partial && !atEnd && <span className="le-caret ml-0.5 text-emerald-400">▌</span>}
            </p>
          ) : (
            <p
              key={key}
              className={`break-all rounded-lg ${
                line.tone === "ok"
                  ? "text-emerald-400"
                  : line.tone === "warn"
                    ? "text-amber-400"
                    : line.tone === "dim"
                      ? "text-ash"
                      : "text-stone/90"
              }`}
            >
              {line.tone === "dim" ? `# ${text}` : text}
            </p>
          ),
        )}
        {atEnd && (
          <p className="text-stone">
            <span className="text-emerald-400">$ </span>
            <span className="le-caret text-emerald-400">▌</span>
          </p>
        )}
      </div>

      {footer && (
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-stone/20 pt-4">
          {footer}
        </div>
      )}
    </div>
  );
}
