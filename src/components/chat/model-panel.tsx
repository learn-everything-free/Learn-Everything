"use client";

// The model manager: pick where the model runs, and download it.
//
//   In your browser — the weights are fetched into the browser cache and the
//                      model runs on the learner's own GPU. Private, free,
//                      and it needs a download of a few hundred megabytes.
//   Local Ollama   — a model on the learner's own machine, proxied by the site.
//   Cloud model    — the provider this site is configured with.
//   Your own key   — any OpenAI-compatible endpoint, used straight from the
//                    browser and stored only in this browser.

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  BROWSER_MODELS,
  cachedModelIds,
  webgpuAvailable,
} from "@/lib/browser-models";
import { SUGGESTED_OLLAMA_MODELS } from "@/lib/ollama";
import type { ByokSettings } from "@/lib/chat-store";
import type { ChatSource } from "@/lib/chat-types";

export interface ModelProgress {
  label: string;
  /** 0..1 when known */
  ratio: number | null;
  text: string;
}

export interface OllamaModel {
  name: string;
  sizeMb: number | null;
}

const SOURCES: { id: ChatSource; label: string; blurb: string }[] = [
  {
    id: "browser",
    label: "In your browser",
    blurb: "Download a model once — it runs on your GPU, nothing leaves this browser.",
  },
  {
    id: "ollama",
    label: "Local Ollama",
    blurb: "Use a model on your own machine, pulled with ollama.",
  },
  {
    id: "cloud",
    label: "Cloud model",
    blurb: "The provider this site is configured with.",
  },
  {
    id: "byok",
    label: "Your own key",
    blurb: "Any OpenAI-compatible endpoint, straight from the browser.",
  },
];

export function ModelPanel({
  source,
  model,
  onSourceChange,
  onModelChange,
  byok,
  onByokChange,
  progress,
  onDownloadBrowser,
  onDeleteBrowser,
  onPullOllama,
  onDeleteOllama,
  ollamaModels,
  ollamaStatus,
  cloud,
}: {
  source: ChatSource;
  model: string;
  onSourceChange: (source: ChatSource) => void;
  onModelChange: (model: string) => void;
  byok: ByokSettings;
  onByokChange: (settings: ByokSettings) => void;
  progress: ModelProgress | null;
  onDownloadBrowser: (modelId: string) => void;
  onDeleteBrowser: (modelId: string) => void;
  onPullOllama: (modelName: string) => void;
  onDeleteOllama: (modelName: string) => void;
  ollamaModels: OllamaModel[];
  ollamaStatus: "checking" | "connected" | "offline";
  cloud: { configured: boolean; model: string | null; provider: string | null };
}) {
  const [cached, setCached] = useState<string[]>([]);
  // WebGPU only exists in the browser: the server snapshot is false, the
  // client snapshot is the truth, and React swaps them in after hydration.
  const gpu = useSyncExternalStore(
    () => () => {},
    () => webgpuAvailable(),
    () => false,
  );

  useEffect(() => {
    let cancelled = false;
    void cachedModelIds().then((ids) => {
      if (!cancelled) setCached(ids);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const busy = progress !== null;

  return (
    <div className="border border-ink/70 bg-eggshell">
      {/* Source tabs */}
      <div className="flex flex-wrap border-b border-ink/20">
        {SOURCES.map((s) => (
          <button
            key={s.id}
            onClick={() => onSourceChange(s.id)}
            className={`flex-1 border-r border-ink/15 px-4 py-3 text-left transition-colors last:border-r-0 ${
              source === s.id ? "bg-ink text-eggshell" : "text-graphite hover:bg-warm-taupe"
            }`}
          >
            <span className="block text-[11px] font-medium uppercase tracking-[0.08em]">
              {s.label}
            </span>
            <span
              className={`mt-1 block text-[10px] leading-snug ${
                source === s.id ? "text-eggshell/70" : "text-ash"
              }`}
            >
              {s.blurb}
            </span>
          </button>
        ))}
      </div>

      <div className="p-4">
        {progress && (
          <div className="mb-4 border border-ink/60 p-3">
            <p className="text-[11px] font-medium text-ink">{progress.label}</p>
            {progress.ratio !== null && (
              <div className="mt-2 h-1.5 w-full bg-stone/70">
                <div
                  className="h-1.5 bg-ink transition-all duration-300"
                  style={{ width: `${Math.round(progress.ratio * 100)}%` }}
                />
              </div>
            )}
            <p className="mt-2 truncate font-mono text-[10px] text-smoke">{progress.text}</p>
          </div>
        )}

        {/* Browser models */}
        {source === "browser" && (
          <div>
            {!gpu && (
              <p className="mb-4 border border-ink/60 bg-warm-taupe p-3 text-[12px] leading-relaxed text-graphite">
                This browser has no WebGPU, so a model cannot run here. Chrome or Edge on a
                machine with a GPU will work — or pick a local Ollama model instead.
              </p>
            )}
            <ul className="divide-y divide-ink/15">
              {BROWSER_MODELS.map((m) => {
                const isCached = cached.includes(m.id);
                const selected = model === m.id;
                return (
                  <li key={m.id} className="flex items-center gap-4 py-3">
                    <button
                      onClick={() => onModelChange(m.id)}
                      className="min-w-0 flex-1 text-left"
                      disabled={!isCached && !gpu}
                    >
                      <span className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[13px] font-medium ${
                            selected ? "text-ink underline underline-offset-4" : "text-graphite"
                          }`}
                        >
                          {m.name}
                        </span>
                        {isCached && (
                          <span className="border border-ink/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-graphite">
                            downloaded
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-ash">
                          ~{Math.round(m.sizeMb / 100) / 10} GB
                        </span>
                      </span>
                      <span className="mt-1 block text-[11px] leading-snug text-smoke">
                        {m.blurb}
                      </span>
                    </button>
                    {isCached ? (
                      <button
                        onClick={() => onDeleteBrowser(m.id)}
                        className="shrink-0 border border-ink/50 px-2.5 py-1 font-mono text-[10px] uppercase text-graphite transition-colors hover:border-ink hover:text-ink"
                        disabled={busy}
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => onDownloadBrowser(m.id)}
                        className="shrink-0 border border-ink bg-ink px-2.5 py-1 font-mono text-[10px] uppercase text-eggshell transition-opacity hover:opacity-85"
                        disabled={busy || !gpu}
                      >
                        Download
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Ollama */}
        {source === "ollama" && (
          <div>
            {ollamaStatus === "offline" && (
              <p className="mb-4 border border-ink/60 bg-warm-taupe p-3 text-[12px] leading-relaxed text-graphite">
                No local model server answered. Install Ollama, run <code>ollama serve</code>,
                then pull a model below.
              </p>
            )}
            {ollamaModels.length > 0 && (
              <>
                <p className="le-label text-ash">Installed</p>
                <ul className="mt-2 divide-y divide-ink/15 border-t border-ink/15">
                  {ollamaModels.map((m) => (
                    <li key={m.name} className="flex items-center gap-4 py-2.5">
                      <button
                        onClick={() => onModelChange(m.name)}
                        className={`min-w-0 flex-1 truncate text-left text-[13px] ${
                          model === m.name
                            ? "text-ink underline underline-offset-4"
                            : "text-graphite"
                        }`}
                      >
                        {m.name}
                      </button>
                      {m.sizeMb && (
                        <span className="font-mono text-[10px] text-ash">
                          ~{Math.round(m.sizeMb / 100) / 10} GB
                        </span>
                      )}
                      <button
                        onClick={() => onDeleteOllama(m.name)}
                        className="shrink-0 border border-ink/50 px-2.5 py-1 font-mono text-[10px] uppercase text-graphite transition-colors hover:border-ink hover:text-ink"
                        disabled={busy}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <p className="le-label mt-5 text-ash">Download a model</p>
            <ul className="mt-2 divide-y divide-ink/15 border-t border-ink/15">
              {SUGGESTED_OLLAMA_MODELS.map((m) => (
                <li key={m.name} className="flex items-center gap-4 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-[12px] text-graphite">
                      {m.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-smoke">
                      {m.blurb} · ~{Math.round(m.sizeMb / 100) / 10} GB
                    </span>
                  </span>
                  <button
                    onClick={() => onPullOllama(m.name)}
                    className="shrink-0 border border-ink bg-ink px-2.5 py-1 font-mono text-[10px] uppercase text-eggshell transition-opacity hover:opacity-85"
                    disabled={busy || ollamaStatus === "offline"}
                  >
                    Pull
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cloud */}
        {source === "cloud" && (
          <div>
            {cloud.configured ? (
              <p className="text-[12px] leading-relaxed text-graphite">
                This site is configured with <strong className="text-ink">{cloud.provider}</strong>{" "}
                and the model <strong className="text-ink">{cloud.model}</strong>. The answer is
                generated on the server — the conversation text still stays in your browser.
              </p>
            ) : (
              <p className="text-[12px] leading-relaxed text-graphite">
                This site has no cloud model configured. Download a model to run in your browser,
                or start a local Ollama server — both keep the conversation on your machine.
              </p>
            )}
          </div>
        )}

        {/* Bring your own key */}
        {source === "byok" && (
          <div className="space-y-3">
            <label className="block">
              <span className="le-label text-ash">API key</span>
              <input
                type="password"
                value={byok.apiKey}
                onChange={(e) => onByokChange({ ...byok, apiKey: e.target.value })}
                placeholder="sk-…"
                className="mt-1.5 w-full border border-ink bg-eggshell px-3 py-2 font-mono text-[12px] text-ink focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="le-label text-ash">OpenAI-compatible endpoint</span>
              <input
                value={byok.baseUrl}
                onChange={(e) => onByokChange({ ...byok, baseUrl: e.target.value })}
                placeholder="https://api.openai.com/v1"
                className="mt-1.5 w-full border border-ink bg-eggshell px-3 py-2 font-mono text-[12px] text-ink focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="le-label text-ash">Model</span>
              <input
                value={byok.model}
                onChange={(e) => onByokChange({ ...byok, model: e.target.value })}
                placeholder="gpt-4o-mini"
                className="mt-1.5 w-full border border-ink bg-eggshell px-3 py-2 font-mono text-[12px] text-ink focus:outline-none"
              />
            </label>
            <p className="text-[11px] leading-relaxed text-smoke">
              The key is stored in this browser only and sent straight to the endpoint above. It
              never touches this site’s server.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
