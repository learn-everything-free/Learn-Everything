// Provider-agnostic AI tutor backend, server-side only.
//
// Configure via environment variables (see .env.example):
//   AI_PROVIDER  "openai" | "anthropic"   (default: openai)
//   AI_API_KEY   API key for the chosen provider (or OPENAI_API_KEY / ANTHROPIC_API_KEY)
//   AI_MODEL     model id (default per provider)
//   AI_BASE_URL  optional override — any OpenAI-compatible endpoint
//                (OpenRouter, Ollama, vLLM, Azure-style gateways, ...)
//
// The tutor is deliberately Socratic: it guides debugging, never emits the
// solution. The system prompt is the enforcement point.

export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TutorContext {
  taskTitle: string;
  taskDescription: string;
  requirements: string[];
  /** last commands the learner ran in the lab shell */
  recentCommands: string[];
  /** validator checks currently failing */
  failingChecks: { label: string; detail: string }[];
  allPassed: boolean;
}

export interface TutorConfig {
  provider: "openai" | "anthropic";
  apiKey: string;
  model: string;
  baseUrl: string;
}

const SYSTEM_PROMPT = `You are the AI tutor inside Learn Everything, a hands-on platform where tasks are validated against real environment state. Your student is mid-task.

Your job is Socratic guidance, never answers:
- Ask questions that point at what to inspect next (command output, logs, service state), one step at a time.
- Explain error messages and concepts freely, but NEVER output the exact command, config, or code that satisfies a validator requirement.
- Use the validator feedback you receive: name which requirement is still failing and suggest what evidence to gather, not what to type.
- If the student is genuinely stuck after repeated attempts, narrow the hint: describe the category of command or feature family to look into (e.g. "docker has subcommands for inspecting container state") — still not the full solution.
- If all checks pass, congratulate briefly and suggest one "what would break this in production" reflection.

Style: under 100 words, plain text, direct and encouraging, like a senior engineer pairing. No markdown headers.`;

const DEFAULT_MODELS: Record<TutorConfig["provider"], string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-haiku-latest",
};

export function getTutorConfig(): TutorConfig | null {
  const provider = (process.env.AI_PROVIDER ?? "openai") as TutorConfig["provider"];
  if (provider !== "openai" && provider !== "anthropic") return null;
  const apiKey =
    process.env.AI_API_KEY ??
    (provider === "openai" ? process.env.OPENAI_API_KEY : process.env.ANTHROPIC_API_KEY);
  if (!apiKey) return null;
  const baseUrl =
    process.env.AI_BASE_URL ??
    (provider === "openai" ? "https://api.openai.com/v1" : "https://api.anthropic.com");
  return { provider, apiKey, model: process.env.AI_MODEL ?? DEFAULT_MODELS[provider], baseUrl };
}

function contextBlock(ctx: TutorContext): string {
  const lines = [
    `Task: ${ctx.taskTitle}`,
    "",
    ctx.taskDescription,
    "",
    "Validator requirements:",
    ...ctx.requirements.map((r) => `- ${r}`),
    "",
  ];
  if (ctx.recentCommands.length) {
    lines.push("Student's recent commands:", ...ctx.recentCommands.map((c) => `$ ${c}`), "");
  }
  if (ctx.allPassed) {
    lines.push("All validator checks currently PASS.");
  } else if (ctx.failingChecks.length) {
    lines.push(
      "Currently failing checks:",
      ...ctx.failingChecks.map((c) => `- ${c.label} (${c.detail})`),
    );
  } else {
    lines.push("The student has not run the validator yet.");
  }
  return lines.join("\n");
}

/** Yield plain-text reply chunks from the configured provider. */
export async function* streamTutorReply(
  messages: TutorMessage[],
  ctx: TutorContext,
): AsyncGenerator<string> {
  const config = getTutorConfig();
  if (!config) throw new Error("tutor-not-configured");

  const last = messages[messages.length - 1];
  const userContent = `${contextBlock(ctx)}\n\nStudent says: ${last?.content ?? "(no message)"}`;
  const history = messages.slice(0, -1);

  const response =
    config.provider === "anthropic"
      ? await fetchAnthropic(config, history, userContent)
      : await fetchOpenAI(config, history, userContent);

  if (!response.ok || !response.body) {
    throw new Error(`tutor-provider-error:${response.status}`);
  }

  for await (const data of sseData(response.body)) {
    if (data === "[DONE]") return;
    let chunkText: string | undefined;
    try {
      const payload = JSON.parse(data);
      chunkText =
        config.provider === "anthropic"
          ? payload.type === "content_block_delta"
            ? payload.delta?.text
            : undefined
          : payload.choices?.[0]?.delta?.content;
    } catch {
      continue; // keep-alive or malformed line
    }
    if (chunkText) yield chunkText;
  }
}

async function fetchOpenAI(
  config: TutorConfig,
  history: TutorMessage[],
  userContent: string,
): Promise<Response> {
  return fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      stream: true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
        { role: "user", content: userContent },
      ],
    }),
  });
}

async function fetchAnthropic(
  config: TutorConfig,
  history: TutorMessage[],
  userContent: string,
): Promise<Response> {
  return fetch(`${config.baseUrl}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.model,
      stream: true,
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [...history, { role: "user", content: userContent }],
    }),
  });
}

/** Split a streaming SSE body into `data:` payload strings. */
async function* sseData(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("data:")) yield trimmed.slice(5).trim();
    }
  }
}
