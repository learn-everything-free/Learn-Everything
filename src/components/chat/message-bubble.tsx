"use client";

import { useState } from "react";
import { Markdown, CopyButton } from "@/lib/markdown";
import type { ChatMessage } from "@/lib/chat-types";

export function MessageBubble({
  message,
  onRegenerate,
  onEdit,
}: {
  message: ChatMessage;
  onRegenerate?: () => void;
  onEdit?: (content: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%]">
          {editing ? (
            <div className="border border-ink bg-eggshell p-3">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={4}
                className="w-full resize-y border border-ink/40 bg-eggshell p-2 text-body-sm text-ink focus:outline-none"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => {
                    setEditing(false);
                    setDraft(message.content);
                  }}
                  className="border border-ink/50 px-2.5 py-1 font-mono text-[10px] uppercase text-graphite hover:border-ink hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    onEdit?.(draft);
                  }}
                  className="border border-ink bg-ink px-2.5 py-1 font-mono text-[10px] uppercase text-eggshell"
                >
                  Save & resend
                </button>
              </div>
            </div>
          ) : (
            <div className="group border border-ink/60 bg-warm-taupe px-4 py-3">
              <p className="whitespace-pre-wrap text-body-sm leading-relaxed text-ink">
                {message.content}
              </p>
              <div className="mt-2 flex justify-end gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => {
                    setDraft(message.content);
                    setEditing(true);
                  }}
                  className="font-mono text-[10px] uppercase tracking-wider text-smoke hover:text-ink"
                >
                  Edit
                </button>
                <CopyButton text={message.content} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      <div className="flex items-center gap-2">
        <span
          className="flex size-6 items-center justify-center bg-ink font-mono text-[10px] font-bold text-eggshell"
          aria-hidden
        >
          A
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-ash">
          Assistant
          {message.model && ` · ${message.model}`}
          {message.ms !== undefined && ` · ${(message.ms / 1000).toFixed(1)}s`}
        </span>
        {message.failed && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-ember-orange">
            failed
          </span>
        )}
      </div>
      <div className="mt-2 pl-8">
        <Markdown content={message.content} />
        <div className="mt-3 flex gap-4 opacity-0 transition-opacity group-hover:opacity-100">
          <CopyButton text={message.content} label="Copy answer" />
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="font-mono text-[10px] uppercase tracking-wider text-smoke transition-colors hover:text-ink"
            >
              Regenerate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
