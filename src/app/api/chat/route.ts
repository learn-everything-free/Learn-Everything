// Cloud chat endpoint: the provider the site is configured with (see
// .env.example) answering a general conversation rather than a lab tutor.
//
// POST { messages, system } → the reply streamed as plain text.

import { getTutorConfig, type TutorMessage } from "@/lib/ai";

export const runtime = "nodejs";

/** GET — is a cloud model configured, and which one? */
export async function GET() {
  const config = getTutorConfig();
  return Response.json({
    configured: Boolean(config),
    model: config?.model ?? null,
    provider: config?.provider ?? null,
  });
}

function isMessage(value: unknown): value is TutorMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as TutorMessage).role === "user" &&
    typeof (value as TutorMessage).content === "string"
  );
}

export async function POST(request: Request) {
  const config = getTutorConfig();
  if (!config) {
    return Response.json({ error: "chat-not-configured" }, { status: 501 });
  }

  let body: { messages?: unknown; system?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid-json" }, { status: 400 });
  }

  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const messages: TutorMessage[] = rawMessages.filter(isMessage).slice(-24);
  if (messages.length === 0) {
    return Response.json({ error: "empty-messages" }, { status: 400 });
  }

  const system =
    typeof body.system === "string" && body.system.trim()
      ? body.system
      : "You are a helpful technical assistant. Answer in markdown, and put commands in fenced code blocks.";

  const response =
    config.provider === "anthropic"
      ? await fetch(`${config.baseUrl}/v1/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": config.apiKey,
            "anthropic-version": "2023-06-23",
          },
          body: JSON.stringify({
            model: config.model,
            stream: true,
            max_tokens: 2048,
            system,
            messages,
          }),
        })
      : await fetch(`${config.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            model: config.model,
            stream: true,
            messages: [{ role: "system", content: system }, ...messages],
          }),
        });

  if (!response.ok || !response.body) {
    return Response.json({ error: "chat-provider-error" }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const data of sseData(response.body!)) {
          if (data === "[DONE]") return;
          let text: string | undefined;
          try {
            const payload = JSON.parse(data);
            text =
              config.provider === "anthropic"
                ? payload.type === "content_block_delta"
                  ? payload.delta?.text
                  : undefined
                : payload.choices?.[0]?.delta?.content;
          } catch {
            continue; // keep-alive or malformed line
          }
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch {
        controller.enqueue(encoder.encode("\n\n[the connection dropped mid-answer]"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
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
