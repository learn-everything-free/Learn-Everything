"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ConversationSidebar } from "./conversation-sidebar";
import { MessageBubble } from "./message-bubble";
import { Composer } from "./composer";
import { ModelPanel, type ModelProgress, type OllamaModel } from "./model-panel";
import {
  createConversation,
  deleteConversation,
  exportConversation,
  loadByok,
  newId,
  renameConversation,
  saveByok,
  saveConversation,
  titleFromMessage,
  updateConversation,
  useConversations,
} from "@/lib/chat-store";
import { presetById, sourceLabel, type ChatConversation, type ChatSource } from "@/lib/chat-types";
import { startStream } from "@/lib/chat-engine";
import {
  deleteBrowserModel,
  loadBrowserModel,
  unloadBrowserModel,
} from "@/lib/browser-models";
import type { LabContext } from "@/app/chat/page";

interface Pending {
  id: string;
  text: string;
}

export function ChatClient({ labContext }: { labContext?: LabContext }) {
  const conversations = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draftMessages, setDraftMessages] = useState<ChatConversation["messages"]>([]);
  const [streaming, setStreaming] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [source, setSource] = useState<ChatSource>("browser");
  const [model, setModel] = useState("");
  const [preset, setPreset] = useState("general");
  const [byok, setByok] = useState(loadByok());
  const [progress, setProgress] = useState<ModelProgress | null>(null);
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [ollamaStatus, setOllamaStatus] = useState<"checking" | "connected" | "offline">("checking");
  const [cloud, setCloud] = useState<{ configured: boolean; model: string | null; provider: string | null }>({
    configured: false,
    model: null,
    provider: null,
  });
  const [showModels, setShowModels] = useState(true);
  const abortRef = useRef<(() => void) | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const messages = active ? active.messages : draftMessages;

  // Load the cloud configuration and the local model list on mount.
  useEffect(() => {
    void fetch("/api/chat")
      .then((r) => r.json())
      .then((data: { configured: boolean; model: string | null; provider: string | null }) => {
        setCloud(data);
        if (data.configured && data.model) setModel((m) => m || data.model!);
      })
      .catch(() => {});

    const loadLocal = async () => {
      try {
        const res = await fetch("/api/chat/local");
        if (!res.ok) throw new Error("offline");
        const data = (await res.json()) as { models: OllamaModel[] };
        setOllamaModels(data.models ?? []);
        setOllamaStatus("connected");
      } catch {
        setOllamaStatus("offline");
      }
    };
    void loadLocal();
  }, []);

  // Keep the thread pinned to the newest message.
  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, pending?.text]);

  // Warn before a refresh throws away an in-flight answer.
  useEffect(() => {
    if (!streaming) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [streaming]);

  const persist = useCallback((conversation: ChatConversation) => {
    saveConversation(conversation);
  }, []);

  // The conversation a stream is writing into. Kept in a ref so the answer
  // lands in the right thread even when the first message creates it.
  const currentIdRef = useRef<string | null>(null);
  useEffect(() => {
    currentIdRef.current = activeId;
  }, [activeId]);

  const appendToConversation = useCallback(
    (
      id: string | null,
      updater: (messages: ChatConversation["messages"]) => ChatConversation["messages"],
    ) => {
      if (!id) {
        setDraftMessages((prev) => updater(prev));
        return;
      }
      updateConversation(id, (conversation) => ({
        ...conversation,
        messages: updater(conversation.messages),
      }));
    },
    [],
  );

  const systemPrompt = useMemo(() => {
    const base = presetById(preset).system;
    if (!labContext) return base;
    return [
      base,
      "",
      "The learner is working on this lab right now:",
      `Task: ${labContext.title}`,
      labContext.description,
      "Validator requirements:",
      ...labContext.requirements.map((r) => `- ${r}`),
    ].join("\n");
  }, [preset, labContext]);

  const run = useCallback(
    (history: { role: "user" | "assistant"; content: string }[], assistantId: string) => {
      setStreaming(true);
      setPending({ id: assistantId, text: "" });

      const handle = startStream({
        source,
        model,
        messages: history,
        system: systemPrompt,
        byok,
        onText: (chunk) =>
          setPending((p) => (p ? { ...p, text: p.text + chunk } : p)),
        onDone: (full) => {
          setPending(null);
          setStreaming(false);
          abortRef.current = null;
          appendToConversation(currentIdRef.current, (prev) => [
            ...prev,
            {
              id: assistantId,
              role: "assistant",
              content: full || "(no answer)",
              createdAt: Date.now(),
              model: model || sourceLabel(source),
            },
          ]);
        },
        onError: (error) => {
          setPending(null);
          setStreaming(false);
          abortRef.current = null;
          appendToConversation(currentIdRef.current, (prev) => [
            ...prev,
            {
              id: assistantId,
              role: "assistant",
              content: error,
              createdAt: Date.now(),
              model: model || sourceLabel(source),
              failed: true,
            },
          ]);
        },
      });
      abortRef.current = handle.abort;
    },
    [appendToConversation, byok, model, source, systemPrompt],
  );

  const send = useCallback(
    (text: string) => {
      const userMessage = {
        id: newId("m"),
        role: "user" as const,
        content: text,
        createdAt: Date.now(),
      };
      const assistantId = newId("m");
      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const next = [...messages, userMessage];
      if (active) {
        persist({
          ...active,
          title: active.messages.length === 0 ? titleFromMessage(text) : active.title,
          messages: next,
        });
        currentIdRef.current = active.id;
      } else {
        const conversation = createConversation(source, model, preset);
        conversation.title = titleFromMessage(text);
        conversation.messages = next;
        persist(conversation);
        setActiveId(conversation.id);
        currentIdRef.current = conversation.id;
      }
      run(history, assistantId);
    },
    [active, messages, model, persist, preset, run, source],
  );

  const regenerate = useCallback(() => {
    const id = currentIdRef.current;
    if (!id) return;
    const conversation = conversations.find((c) => c.id === id);
    if (!conversation || conversation.messages.length === 0) return;
    const withoutLast = [...conversation.messages];
    // Drop the final assistant answer, keep the question.
    if (withoutLast[withoutLast.length - 1]?.role === "assistant") withoutLast.pop();
    const last = withoutLast[withoutLast.length - 1];
    if (!last) return;
    const history = withoutLast.map((m) => ({ role: m.role, content: m.content }));
    updateConversation(id, (c) => ({ ...c, messages: withoutLast }));
    run(history, newId("m"));
  }, [conversations, run]);

  const editLastUserMessage = useCallback(
    (content: string) => {
      const id = currentIdRef.current;
      if (!id) return;
      const conversation = conversations.find((c) => c.id === id);
      if (!conversation) return;
      const withoutLast = [...conversation.messages];
      if (withoutLast[withoutLast.length - 1]?.role === "assistant") withoutLast.pop();
      const last = withoutLast[withoutLast.length - 1];
      if (!last) return;
      const edited = { ...last, content };
      const history = [...withoutLast.slice(0, -1), edited].map((m) => ({
        role: m.role,
        content: m.content,
      }));
      updateConversation(id, (c) => ({ ...c, messages: [...withoutLast.slice(0, -1), edited] }));
      run(history, newId("m"));
    },
    [conversations, run],
  );

  const newChat = useCallback(() => {
    setActiveId(null);
    setDraftMessages([]);
    setPending(null);
  }, []);

  const selectConversation = useCallback((id: string) => {
    setActiveId(id);
    setPending(null);
  }, []);

  const removeConversation = useCallback(
    (id: string) => {
      deleteConversation(id);
      if (activeId === id) newChat();
    },
    [activeId, newChat],
  );

  // --- model management ---------------------------------------------------

  const downloadBrowserModel = useCallback(async (modelId: string) => {
    setProgress({ label: "Downloading the model", ratio: null, text: "starting…" });
    try {
      await loadBrowserModel({
        modelId,
        onProgress: (p) =>
          setProgress({
            label: "Downloading the model",
            ratio: p.progress,
            text: p.text,
          }),
      });
      setModel(modelId);
    } catch (error) {
      setProgress({
        label: "The download failed",
        ratio: null,
        text: error instanceof Error ? error.message : "unknown error",
      });
      return;
    }
    setProgress(null);
  }, []);

  const removeBrowserModel = useCallback(async (modelId: string) => {
    await deleteBrowserModel(modelId);
    if (model === modelId) setModel("");
  }, [model]);

  const refreshOllama = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/local");
      if (!res.ok) throw new Error("offline");
      const data = (await res.json()) as { models: OllamaModel[] };
      setOllamaModels(data.models ?? []);
      setOllamaStatus("connected");
    } catch {
      setOllamaStatus("offline");
    }
  }, []);

  const pullOllamaModel = useCallback(
    async (name: string) => {
      setProgress({ label: `Pulling ${name}`, ratio: null, text: "starting…" });
      try {
        const res = await fetch("/api/chat/local", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "pull", model: name }),
        });
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (reader) {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            const line = decoder.decode(value, { stream: true }).trim();
            if (line) {
              setProgress({ label: `Pulling ${name}`, ratio: null, text: line });
            }
          }
        }
        setModel(name);
        await refreshOllama();
      } catch {
        setProgress({
          label: "The download failed",
          ratio: null,
          text: "the local model server did not answer",
        });
        return;
      }
      setProgress(null);
    },
    [refreshOllama],
  );

  const removeOllamaModel = useCallback(
    async (name: string) => {
      await fetch("/api/chat/local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", model: name }),
      });
      await refreshOllama();
    },
    [refreshOllama],
  );

  const updateByok = useCallback((settings: typeof byok) => {
    setByok(settings);
    saveByok(settings);
  }, []);

  const exportCurrent = useCallback(() => {
    if (!active) return;
    const blob = new Blob([exportConversation(active)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${active.title.replace(/[^\w-]+/g, "-").toLowerCase()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }, [active]);

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");

  return (
    <div className="mx-auto flex min-h-[calc(100vh-68px)] max-w-[1400px] flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="lg:sticky lg:top-[68px] lg:h-[calc(100vh-68px)]">
        <ConversationSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={selectConversation}
          onNew={newChat}
          onRename={renameConversation}
          onDelete={removeConversation}
        />
      </div>

      {/* Thread */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-ink/20 px-4 py-3">
          <button
            onClick={() => setShowModels((v) => !v)}
            className="flex items-center gap-2 border border-ink px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-graphite transition-colors hover:bg-ink hover:text-eggshell"
          >
            {model || sourceLabel(source)}
            <span aria-hidden>▾</span>
          </button>

          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            aria-label="Assistant behaviour"
            className="border border-ink/50 bg-eggshell px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-graphite focus:outline-none"
          >
            {[
              ["general", "General"],
              ["tutor", "Lab tutor"],
              ["explain", "Explain simply"],
              ["review", "Code reviewer"],
            ].map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          <div className="ml-auto flex items-center gap-3">
            {active && (
              <button
                onClick={exportCurrent}
                className="font-mono text-[10px] uppercase tracking-wider text-smoke transition-colors hover:text-ink"
              >
                Export
              </button>
            )}
            {source === "browser" && (
              <button
                onClick={() => unloadBrowserModel()}
                className="font-mono text-[10px] uppercase tracking-wider text-smoke transition-colors hover:text-ink"
                title="Free the GPU memory the model is holding"
              >
                Unload
              </button>
            )}
          </div>
        </div>

        {/* Model manager */}
        {showModels && (
          <div className="border-b border-ink/20 p-4">
            <ModelPanel
              source={source}
              model={model}
              onSourceChange={(next) => {
                setSource(next);
                // Each source has its own model list — pick the sensible default for it.
                if (next === "ollama") setModel(ollamaModels[0]?.name ?? "");
                else if (next === "cloud") setModel(cloud.model ?? "");
                else if (next === "byok") setModel(byok.model);
                else setModel("");
              }}
              onModelChange={setModel}
              byok={byok}
              onByokChange={updateByok}
              progress={progress}
              onDownloadBrowser={downloadBrowserModel}
              onDeleteBrowser={removeBrowserModel}
              onPullOllama={pullOllamaModel}
              onDeleteOllama={removeOllamaModel}
              ollamaModels={ollamaModels}
              ollamaStatus={ollamaStatus}
              cloud={cloud}
            />
          </div>
        )}

        {/* Messages */}
        <div ref={threadRef} className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-3xl space-y-7">
            {messages.length === 0 && !pending && (
              <div className="border border-dashed border-ink px-6 py-14 text-center">
                <h1 className="text-heading-sm font-light tracking-[-0.03em] text-ink">
                  What do you want to understand?
                </h1>
                <p className="mx-auto mt-3 max-w-lg text-body-sm text-smoke">
                  Ask about a command, an error message, or a concept. Pick a model in the top
                  bar — you can download one that runs entirely in this browser.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {[
                    "Explain what a container is",
                    "Why does kubectl apply say no objects passed",
                    "What does idempotent mean for a POST?",
                    "How do I read a stack trace",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="border border-ink/50 px-3 py-1.5 text-[12px] text-graphite transition-colors hover:border-ink hover:text-ink"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, i) => (
              <MessageBubble
                key={message.id}
                message={message}
                onRegenerate={
                  i === messages.length - 1 && message.role === "assistant" ? regenerate : undefined
                }
                onEdit={
                  i === messages.length - 1 && message.role === "user" ? editLastUserMessage : undefined
                }
              />
            ))}

            {pending && (
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="flex size-6 items-center justify-center bg-ink font-mono text-[10px] font-bold text-eggshell"
                    aria-hidden
                  >
                    A
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ash">
                    Thinking
                  </span>
                </div>
                <div className="mt-2 pl-8">
                  {pending.text ? (
                    <div className="whitespace-pre-wrap text-body-sm leading-relaxed text-graphite">
                      {pending.text}
                    </div>
                  ) : (
                    <div className="h-1 w-24 animate-pulse bg-ink/30" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <Composer
          onSend={send}
          onStop={() => abortRef.current?.()}
          streaming={streaming}
          context={
            labContext
              ? { label: "Lab context", detail: labContext.title }
              : lastUserMessage
                ? { label: "In this chat", detail: lastUserMessage.content.slice(0, 80) }
                : null
          }
        />
      </div>
    </div>
  );
}
