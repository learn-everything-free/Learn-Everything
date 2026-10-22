// Shared chat types. The chat can run against four sources:
//
//   browser — a model downloaded into the browser (WebGPU, no key, private)
//   ollama  — a model on a local Ollama server (the server proxies it)
//   cloud   — the provider the site is configured with (AI_API_KEY)
//   byok    — the learner's own OpenAI-compatible key, used from the browser

export type ChatSource = "browser" | "ollama" | "cloud" | "byok";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  /** the model that produced an assistant message */
  model?: string;
  /** how long the answer took, in milliseconds */
  ms?: number;
  /** the message carries an error rather than an answer */
  failed?: boolean;
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  source: ChatSource;
  /** the model id for the chosen source */
  model: string;
  /** the system prompt preset id */
  preset: string;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  system: string;
}

export const PRESETS: Preset[] = [
  {
    id: "general",
    name: "General",
    description: "A helpful assistant for anything technical.",
    system:
      "You are a helpful technical assistant inside Learn Everything, a platform where engineers learn by running real tools in a browser sandbox. Be concise and concrete. Use markdown, and put commands and code in fenced code blocks with a language tag. When the learner is working on a lab, remember that answers are checked against real environment state, so prefer the exact command and the exact output to inspect.",
  },
  {
    id: "tutor",
    name: "Lab tutor",
    description: "Socratic guidance for a lab, never the answer.",
    system:
      "You are the tutor inside a lab on Learn Everything. The learner is mid-task and the task is validated against real environment state. Guide them: ask what the output shows, name which requirement is still open, and point at the thing to inspect. Never output the exact command or config that satisfies a validator. Under 100 words, plain text, no headers.",
  },
  {
    id: "explain",
    name: "Explain simply",
    description: "Plain-English explanations of hard concepts.",
    system:
      "You explain technical concepts clearly, to someone who is learning. Start with the one-sentence idea, then the detail, then a worked example. Use short sentences and concrete analogies. Put code in fenced blocks.",
  },
  {
    id: "review",
    name: "Code reviewer",
    description: "Reviews a diff the way a staff engineer would.",
    system:
      "You are a staff engineer reviewing a change. Lead with the verdict, then the findings, each with a file and a line. Focus on correctness, missing tests, security and the error paths. Be direct about what must change and brief about what is fine.",
  },
];

export function presetById(id: string): Preset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}

export function sourceLabel(source: ChatSource): string {
  switch (source) {
    case "browser":
      return "In your browser";
    case "ollama":
      return "Local Ollama";
    case "cloud":
      return "Cloud model";
    case "byok":
      return "Your own key";
  }
}
