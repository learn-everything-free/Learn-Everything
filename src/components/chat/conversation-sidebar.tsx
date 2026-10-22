"use client";

import Link from "next/link";
import { useState } from "react";
import type { ChatConversation } from "@/lib/chat-types";

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete,
}: {
  conversations: ChatConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  return (
    <aside className="flex h-full w-full flex-col border-b border-ink/70 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-3 border-b border-ink/20 px-4 py-3">
        <p className="text-label text-ash">Conversations</p>
        <button
          onClick={onNew}
          className="border border-ink px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-graphite transition-colors hover:bg-ink hover:text-eggshell"
        >
          New
        </button>
      </div>

      <div className="max-h-36 flex-1 overflow-y-auto lg:max-h-none">
        {conversations.length === 0 ? (
          <p className="px-4 py-6 text-caption leading-relaxed text-smoke">
            No conversations yet. Ask something to start one — the history stays in this browser.
          </p>
        ) : (
          <ul>
            {conversations.map((conversation) => {
              const active = conversation.id === activeId;
              return (
                <li key={conversation.id} className="border-b border-ink/15">
                  {editing === conversation.id ? (
                    <form
                      className="flex items-center gap-2 px-3 py-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        onRename(conversation.id, draft);
                        setEditing(null);
                      }}
                    >
                      <input
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        className="w-full border border-ink bg-eggshell px-2 py-1.5 text-[16px] text-ink focus:outline-none sm:text-caption"
                      />
                      <button
                        type="submit"
                        className="px-2 py-1.5 font-mono text-[10px] uppercase text-smoke hover:text-ink"
                      >
                        Save
                      </button>
                    </form>
                  ) : (
                    <div className="group flex items-center gap-1 px-3 py-2">
                      <button
                        onClick={() => onSelect(conversation.id)}
                        className={`min-w-0 flex-1 truncate text-left text-caption ${
                          active ? "text-ink underline underline-offset-4" : "text-graphite"
                        }`}
                        title={conversation.title}
                      >
                        {conversation.title}
                      </button>
                      <button
                        onClick={() => {
                          setEditing(conversation.id);
                          setDraft(conversation.title);
                        }}
                        aria-label="Rename conversation"
                        className="shrink-0 px-1.5 py-1 font-mono text-[11px] text-ash transition-opacity hover:text-ink lg:opacity-0 lg:group-hover:opacity-100"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => onDelete(conversation.id)}
                        aria-label="Delete conversation"
                        className="shrink-0 px-1.5 py-1 font-mono text-[11px] text-ash transition-opacity hover:text-ink lg:opacity-0 lg:group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-ink/20 px-4 py-3">
        <Link
          href="/paths"
          className="inline-flex min-h-6 items-center py-1 font-mono text-[10px] uppercase tracking-wider text-smoke transition-colors hover:text-ink"
        >
          ← Back to the curriculum
        </Link>
      </div>
    </aside>
  );
}
