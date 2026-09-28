// Streaming AI tutor endpoint. POST { messages, context } → plain-text
// streamed reply. Returns 501 when no provider is configured, so the client
// can fall back to its built-in canned guidance.

import { getTutorConfig, streamTutorReply, type TutorContext, type TutorMessage } from "@/lib/ai";

export const runtime = "nodejs";

function isTutorMessage(value: unknown): value is TutorMessage {
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
    return Response.json(
      { error: "tutor-not-configured" },
      { status: 501 },
    );
  }

  let body: { messages?: unknown; context?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid-json" }, { status: 400 });
  }

  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const messages: TutorMessage[] = rawMessages.filter(isTutorMessage).slice(-10);
  if (messages.length === 0) {
    return Response.json({ error: "empty-messages" }, { status: 400 });
  }

  const raw = (body.context ?? {}) as Partial<TutorContext>;
  const context: TutorContext = {
    taskTitle: String(raw.taskTitle ?? "Unknown task"),
    taskDescription: String(raw.taskDescription ?? ""),
    requirements: Array.isArray(raw.requirements) ? raw.requirements.map(String) : [],
    recentCommands: Array.isArray(raw.recentCommands) ? raw.recentCommands.map(String) : [],
    failingChecks: Array.isArray(raw.failingChecks) ? raw.failingChecks.map((c) => ({
      label: String(c?.label ?? ""),
      detail: String(c?.detail ?? ""),
    })) : [],
    allPassed: raw.allPassed === true,
  };

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of streamTutorReply(messages, context)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (error) {
        const status = error instanceof Error && error.message.startsWith("tutor-provider-error")
          ? "the tutor provider returned an error"
          : "the tutor connection failed";
        controller.enqueue(encoder.encode(`[Tutor unavailable — ${status}. Try again.]`));
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
