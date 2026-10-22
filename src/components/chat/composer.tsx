"use client";

import { useEffect, useRef, useState } from "react";

export function Composer({
  onSend,
  onStop,
  streaming,
  placeholder = "Ask anything — a command, an error, a concept…",
  context,
}: {
  onSend: (text: string) => void;
  onStop: () => void;
  streaming: boolean;
  placeholder?: string;
  context?: { label: string; detail: string } | null;
}) {
  const [value, setValue] = useState("");
  const areaRef = useRef<HTMLTextAreaElement>(null);

  // Grow with the content, up to a ceiling.
  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    area.style.height = "auto";
    area.style.height = `${Math.min(area.scrollHeight, 220)}px`;
  }, [value]);

  const send = () => {
    const text = value.trim();
    if (!text || streaming) return;
    onSend(text);
    setValue("");
  };

  return (
    <div className="border-t border-ink/70 bg-eggshell px-4 py-4">
      <div className="mx-auto max-w-3xl">
        {context && (
          <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-ash">
            <span className="border border-ink/40 px-2 py-0.5 text-graphite">
              {context.label}
            </span>
            <span className="truncate normal-case tracking-normal">{context.detail}</span>
          </p>
        )}
        <div className="flex items-end gap-3 border border-ink bg-eggshell p-3">
          <textarea
            ref={areaRef}
            value={value}
            rows={1}
            placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            className="max-h-[220px] min-h-[24px] flex-1 resize-none bg-transparent text-body-sm leading-relaxed text-ink placeholder:text-ash focus:outline-none"
            aria-label="Message"
          />
          {streaming ? (
            <button
              onClick={onStop}
              className="shrink-0 border border-ink bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-eggshell transition-opacity hover:opacity-85"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={send}
              disabled={!value.trim()}
              className="shrink-0 border border-ink bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-eggshell transition-opacity hover:opacity-85 disabled:opacity-40"
            >
              Send
            </button>
          )}
        </div>
        <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-wider text-ash">
          Enter to send · Shift + Enter for a new line
        </p>
      </div>
    </div>
  );
}
