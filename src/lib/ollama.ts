// Where the learner's local model server lives. Ollama by default; any
// OpenAI-compatible server works too.

export function getOllamaBaseUrl(): string {
  return (process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434").replace(/\/+$/, "");
}

/** Models a learner can pull with Ollama, with the sizes Ollama reports. */
export const SUGGESTED_OLLAMA_MODELS = [
  { name: "llama3.2:3b", sizeMb: 2000, blurb: "A good default — solid quality, moderate size." },
  { name: "llama3.2:1b", sizeMb: 1300, blurb: "Small and fast, for a slow machine." },
  { name: "qwen2.5-coder:1.5b", sizeMb: 1000, blurb: "Code-tuned, good at reading a diff." },
  { name: "gemma2:2b", sizeMb: 1600, blurb: "A capable small model from Google." },
  { name: "phi3.5:3.8b", sizeMb: 2400, blurb: "Punches above its weight on reasoning." },
];
