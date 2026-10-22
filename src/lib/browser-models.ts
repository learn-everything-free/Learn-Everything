"use client";

// The in-browser engine: a model downloaded into the browser's cache and run
// on the user's own GPU through WebGPU. No key, no cost, no data leaving the
// machine.
//
// The heavy WebLLM bundle is imported lazily, so a learner who never picks a
// browser model never downloads it.

import type { MLCEngineInterface } from "@mlc-ai/web-llm";

export interface BrowserModel {
  id: string;
  name: string;
  /** approximate download size in megabytes */
  sizeMb: number;
  /** minimum WebGPU memory in megabytes */
  vramMb: number;
  blurb: string;
}

/** A curated set of small models that run on a laptop. */
export const BROWSER_MODELS: BrowserModel[] = [
  {
    id: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    name: "Llama 3.2 · 1B",
    sizeMb: 880,
    vramMb: 880,
    blurb: "Small, fast and surprisingly useful. The sensible default.",
  },
  {
    id: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
    name: "Llama 3.2 · 3B",
    sizeMb: 2100,
    vramMb: 2100,
    blurb: "Noticeably better reasoning, needs a real GPU.",
  },
  {
    id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    name: "Qwen 2.5 · 1.5B",
    sizeMb: 1100,
    vramMb: 1100,
    blurb: "Strong at code and structured output.",
  },
  {
    id: "Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC",
    name: "Qwen 2.5 Coder · 1.5B",
    sizeMb: 1100,
    vramMb: 1100,
    blurb: "A code-tuned model. Good at reading a diff.",
  },
  {
    id: "Phi-3.5-mini-instruct-q4f16_1-MLC",
    name: "Phi 3.5 mini",
    sizeMb: 2200,
    vramMb: 2200,
    blurb: "Punches above its weight, especially on reasoning.",
  },
  {
    id: "gemma-2-2b-it-q4f16_1-MLC",
    name: "Gemma 2 · 2B",
    sizeMb: 1900,
    vramMb: 1900,
    blurb: "A good all-rounder from Google.",
  },
  {
    id: "SmolLM2-1.7B-Instruct-q4f16_1-MLC",
    name: "SmolLM2 · 1.7B",
    sizeMb: 1100,
    vramMb: 1100,
    blurb: "The lightest useful option — a good first download.",
  },
];

export function webgpuAvailable(): boolean {
  if (typeof navigator === "undefined") return false;
  return "gpu" in navigator;
}

export interface DownloadProgress {
  /** 0..1, or null when the total is not known yet */
  progress: number | null;
  text: string;
}

let engine: MLCEngineInterface | null = null;
let engineModelId: string | null = null;

export interface LoadOptions {
  modelId: string;
  onProgress?: (progress: DownloadProgress) => void;
  /** keep the model warm between conversations */
  keepAlive?: boolean;
}

/**
 * Download (if needed) and load a model. The callback reports download
 * progress so the UI can show a real progress bar rather than a spinner.
 */
export async function loadBrowserModel({
  modelId,
  onProgress,
  keepAlive = true,
}: LoadOptions): Promise<MLCEngineInterface> {
  if (engine && engineModelId === modelId) return engine;

  const webllm = await import("@mlc-ai/web-llm");
  if (engine) {
    try {
      await engine.unload();
    } catch {
      // the old engine is already gone
    }
    engine = null;
    engineModelId = null;
  }

  engine = await webllm.CreateMLCEngine(modelId, {
    initProgressCallback: (report) => {
      onProgress?.({
        progress: typeof report.progress === "number" ? report.progress : null,
        text: report.text ?? "",
      });
    },
  });
  engineModelId = modelId;
  void keepAlive;
  return engine;
}

export function unloadBrowserModel(): void {
  const current = engine;
  engine = null;
  engineModelId = null;
  if (current) void current.unload().catch(() => {});
}

/** Which models are already downloaded into the browser cache. */
export async function cachedModelIds(): Promise<string[]> {
  try {
    const webllm = await import("@mlc-ai/web-llm");
    const flags = await Promise.all(
      BROWSER_MODELS.map((m) => webllm.hasModelInCache(m.id)),
    );
    return BROWSER_MODELS.filter((_, i) => flags[i]).map((m) => m.id);
  } catch {
    return [];
  }
}

/** Free the disk space a downloaded model is using. */
export async function deleteBrowserModel(modelId: string): Promise<void> {
  const webllm = await import("@mlc-ai/web-llm");
  if (engine && engineModelId === modelId) unloadBrowserModel();
  await webllm.deleteModelAllInfoInCache(modelId);
}

/** Stream a chat completion from the local engine. */
export async function* streamBrowserChat(
  modelId: string,
  messages: { role: string; content: string }[],
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const current = await loadBrowserModel({ modelId });
  const stream = await current.chat.completions.create({
    messages: messages as never,
    stream: true,
    temperature: 0.7,
    max_tokens: 1024,
  });
  for await (const chunk of stream) {
    if (signal?.aborted) break;
    const text = chunk.choices?.[0]?.delta?.content;
    if (text) yield text;
  }
}
