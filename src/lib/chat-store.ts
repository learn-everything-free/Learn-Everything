"use client";

// Conversations live in localStorage — the same promise as the rest of the
// learner's state: instant, offline, and never uploaded unless the learner
// signs in and syncs it themselves.

import { useSyncExternalStore } from "react";
import type { ChatConversation, ChatMessage, ChatSource } from "./chat-types";

const KEY = "learn-everything.chat.v1";
const MAX_CONVERSATIONS = 50;

const listeners = new Set<() => void>();
let cached: ChatConversation[] = [];
let loaded = false;

function load(): ChatConversation[] {
  if (loaded) return cached;
  loaded = true;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatConversation[];
        if (Array.isArray(parsed)) {
          cached = parsed.filter(
            (c) => c && typeof c.id === "string" && Array.isArray(c.messages),
          );
        }
      }
    } catch {
      // corrupted state: start fresh rather than crash the page
    }
  }
  return cached;
}

function persist(next: ChatConversation[]): void {
  cached = next.slice(0, MAX_CONVERSATIONS);
  loaded = true;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cached));
  } catch {
    // storage unavailable (private mode, quota): keep the session in memory
  }
  for (const listener of listeners) listener();
}

export function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function createConversation(
  source: ChatSource = "browser",
  model = "",
  preset = "general",
): ChatConversation {
  return {
    id: newId("c"),
    title: "New chat",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    source,
    model,
    preset,
  };
}

export function saveConversation(conversation: ChatConversation): void {
  const rest = load().filter((c) => c.id !== conversation.id);
  persist([{ ...conversation, updatedAt: Date.now() }, ...rest]);
}

export function deleteConversation(id: string): void {
  persist(load().filter((c) => c.id !== id));
}

export function renameConversation(id: string, title: string): void {
  persist(
    load().map((c) => (c.id === id ? { ...c, title: title.trim() || c.title, updatedAt: Date.now() } : c)),
  );
}

/** Patch a conversation by id — used while a stream is writing into it. */
export function updateConversation(
  id: string,
  updater: (conversation: ChatConversation) => ChatConversation,
): void {
  persist(
    load().map((c) => (c.id === id ? { ...updater(c), updatedAt: Date.now() } : c)),
  );
}

/** Title a conversation from its first user message. */
export function titleFromMessage(content: string): string {
  const line = content
    .split("\n")
    .map((l) => l.trim())
    .find(Boolean);
  if (!line) return "New chat";
  return line.length > 48 ? `${line.slice(0, 48)}…` : line;
}

export function exportConversation(conversation: ChatConversation): string {
  const lines = [`# ${conversation.title}`, ""];
  for (const message of conversation.messages) {
    lines.push(message.role === "user" ? "**You**" : "**Assistant**", "", message.content, "");
  }
  return lines.join("\n");
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Reactive list of conversations, newest first. */
export function useConversations(): ChatConversation[] {
  return useSyncExternalStore(subscribe, load, () => [] as ChatConversation[]);
}

/** The learner's own key for a bring-your-own-key provider. */
const KEYSTORE = "learn-everything.chat.key.v1";

export interface ByokSettings {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export function loadByok(): ByokSettings {
  if (typeof window === "undefined") return { apiKey: "", baseUrl: "https://api.openai.com/v1", model: "" };
  try {
    const raw = window.localStorage.getItem(KEYSTORE);
    if (!raw) return { apiKey: "", baseUrl: "https://api.openai.com/v1", model: "" };
    const parsed = JSON.parse(raw) as Partial<ByokSettings>;
    return {
      apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : "",
      baseUrl: typeof parsed.baseUrl === "string" ? parsed.baseUrl : "https://api.openai.com/v1",
      model: typeof parsed.model === "string" ? parsed.model : "",
    };
  } catch {
    return { apiKey: "", baseUrl: "https://api.openai.com/v1", model: "" };
  }
}

export function saveByok(settings: ByokSettings): void {
  try {
    window.localStorage.setItem(KEYSTORE, JSON.stringify(settings));
  } catch {
    // storage unavailable: the key simply does not persist
  }
}

export type { ChatConversation, ChatMessage };
