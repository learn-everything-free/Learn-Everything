// Local model proxy. Talks to an Ollama server running on the learner's
// machine (OLLAMA_BASE_URL, default http://127.0.0.1:11434) so the browser
// never needs a CORS exception and the model never leaves the machine.
//
//   GET                    → the models already pulled
//   POST { action:"pull" } → download a model, streaming the progress
//   POST { action:"delete"}→ free the disk space of a model
//   POST { action:"chat" } → a streamed completion

import { getOllamaBaseUrl } from "@/lib/ollama";

export const runtime = "nodejs";

interface OllamaTag {
  name: string;
  size?: number;
  modified_at?: string;
}

export async function GET() {
  const base = getOllamaBaseUrl();
  try {
    const res = await fetch(`${base}/api/tags`, { cache: "no-store" });
    if (!res.ok) return Response.json({ error: "ollama-unreachable" }, { status: 502 });
    const data = (await res.json()) as { models?: OllamaTag[] };
    return Response.json({
      models: (data.models ?? []).map((m) => ({
        name: m.name,
        sizeMb: m.size ? Math.round(m.size / (1024 * 1024)) : null,
      })),
    });
  } catch {
    return Response.json({ error: "ollama-unreachable" }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const base = getOllamaBaseUrl();
  let body: {
    action?: string;
    model?: string;
    messages?: { role: string; content: string }[];
    system?: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid-json" }, { status: 400 });
  }

  const action = body.action ?? "chat";

  if (action === "pull") {
    const model = body.model;
    if (!model) return Response.json({ error: "model-required" }, { status: 400 });
    return pullModel(base, model);
  }

  if (action === "delete") {
    const model = body.model;
    if (!model) return Response.json({ error: "model-required" }, { status: 400 });
    try {
      const res = await fetch(`${base}/api/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model }),
      });
      return Response.json({ ok: res.ok });
    } catch {
      return Response.json({ error: "ollama-unreachable" }, { status: 502 });
    }
  }

  // chat
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return Response.json({ error: "empty-messages" }, { status: 400 });
  }
  const payload = body.system
    ? [{ role: "system", content: body.system }, ...messages]
    : messages;

  let res: Response;
  try {
    res = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: body.model ?? "llama3.2",
        messages: payload,
        stream: true,
        options: { temperature: 0.7, num_predict: 1024 },
      }),
    });
  } catch {
    return Response.json({ error: "ollama-unreachable" }, { status: 502 });
  }
  if (!res.ok || !res.body) {
    return Response.json({ error: "ollama-error" }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const data of ndjson(res.body!)) {
          try {
            const payloadJson = JSON.parse(data) as {
              message?: { content?: string };
              done?: boolean;
            };
            const text = payloadJson.message?.content;
            if (text) controller.enqueue(encoder.encode(text));
            if (payloadJson.done) return;
          } catch {
            continue; // keep-alive line
          }
        }
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

/** Download a model, forwarding Ollama's progress as plain text lines. */
function pullModel(base: string, model: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const res = await fetch(`${base}/api/pull`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model, stream: true }),
        });
        if (!res.ok || !res.body) {
          controller.enqueue(encoder.encode(`\n[could not download ${model}]`));
          return;
        }
        for await (const data of ndjson(res.body)) {
          try {
            const payloadJson = JSON.parse(data) as { status?: string };
            if (payloadJson.status) controller.enqueue(encoder.encode(`${payloadJson.status}\n`));
          } catch {
            continue;
          }
        }
      } catch {
        controller.enqueue(encoder.encode("\n[the local model server is unreachable]"));
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

/** Split a newline-delimited JSON stream into payloads. */
async function* ndjson(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
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
      if (line.trim()) yield line.trim();
    }
  }
  if (buffer.trim()) yield buffer.trim();
}
