"use client";

// One streaming interface over four sources: a model downloaded in the
// browser, a local Ollama server, the provider the site is configured with,
// and the learner's own key used straight from the browser.

import { streamBrowserChat } from "./browser-models";
import type { ByokSettings } from "./chat-store";
import type { ChatSource } from "./chat-types";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface StreamHandle {
  /** the text produced so far */
  text: string;
  /** stop the stream */
  abort: () => void;
}

export interface StreamOptions {
  source: ChatSource;
  model: string;
  messages: ChatTurn[];
  system: string;
  byok?: ByokSettings;
  onText: (chunk: string) => void;
  onDone?: (full: string) => void;
  onError?: (message: string) => void;
}

/** Start a streaming answer. Returns a handle that can stop it. */
export function startStream(options: StreamOptions): StreamHandle {
  const controller = new AbortController();
  const state = { text: "" };
  const { onText, onDone, onError, source, model, messages, system, byok } = options;

  const push = (chunk: string) => {
    if (!chunk) return;
    state.text += chunk;
    onText(chunk);
  };

  const fail = (message: string) => {
    onError?.(message);
  };

  const run = async () => {
    try {
      switch (source) {
        case "browser": {
          for await (const chunk of streamBrowserChat(model, messages, controller.signal)) {
            push(chunk);
          }
          break;
        }
        case "ollama": {
          await readPlainStream(
            "/api/chat/local",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "chat", model, messages, system }),
              signal: controller.signal,
            },
            push,
            fail,
            controller,
          );
          break;
        }
        case "cloud": {
          await readPlainStream(
            "/api/chat",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ messages, system }),
              signal: controller.signal,
            },
            push,
            fail,
            controller,
          );
          break;
        }
        case "byok": {
          if (!byok?.apiKey) {
            fail("Add your key and endpoint first.");
            return;
          }
          const res = await fetch(`${byok.baseUrl.replace(/\/+$/, "")}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${byok.apiKey}`,
            },
            body: JSON.stringify({
              model: byok.model || "gpt-4o-mini",
              stream: true,
              messages: [{ role: "system", content: system }, ...messages],
            }),
            signal: controller.signal,
          });
          if (!res.ok || !res.body) {
            fail(`The provider returned ${res.status}.`);
            return;
          }
          await readSseStream(res.body, push, fail, controller);
          break;
        }
      }
      onDone?.(state.text);
    } catch (error) {
      if (controller.signal.aborted) {
        onDone?.(state.text);
        return;
      }
      fail(error instanceof Error ? error.message : "the connection failed");
    }
  };

  void run();

  return {
    get text() {
      return state.text;
    },
    abort: () => controller.abort(),
  };
}

/** Read a plain-text streaming response. */
async function readPlainStream(
  url: string,
  init: RequestInit,
  push: (chunk: string) => void,
  fail: (message: string) => void,
  controller: AbortController,
): Promise<void> {
  const res = await fetch(url, init);
  if (!res.ok || !res.body) {
    const body = await res.json().catch(() => null);
    const code = (body as { error?: string } | null)?.error;
    fail(code ? describeError(code) : `The request failed with ${res.status}.`);
    return;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (controller.signal.aborted) {
      void reader.cancel().catch(() => {});
      return;
    }
    push(decoder.decode(value, { stream: true }));
  }
}

/** Read an OpenAI-style SSE stream and pull the deltas out. */
async function readSseStream(
  body: ReadableStream<Uint8Array>,
  push: (chunk: string) => void,
  fail: (message: string) => void,
  controller: AbortController,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (controller.signal.aborted) {
      void reader.cancel().catch(() => {});
      return;
    }
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const parsed = JSON.parse(payload) as {
          choices?: { delta?: { content?: string } }[];
          error?: { message?: string };
        };
        if (parsed.error?.message) {
          fail(parsed.error.message);
          return;
        }
        const text = parsed.choices?.[0]?.delta?.content;
        if (text) push(text);
      } catch {
        continue;
      }
    }
  }
}

/** Turn an API error code into something a learner can act on. */
export function describeError(code: string): string {
  switch (code) {
    case "chat-not-configured":
      return "This site has no cloud model configured. Download a model in your browser, or run Ollama locally.";
    case "ollama-unreachable":
      return "No local model server found. Start Ollama, then try again.";
    case "ollama-error":
      return "The local model server returned an error.";
    default:
      return code;
  }
}
