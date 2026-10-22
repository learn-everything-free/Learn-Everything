import type { Metadata } from "next";
import { ChatClient } from "@/components/chat/chat-client";
import { getTask } from "@/lib/data";

export const metadata: Metadata = {
  title: "AI Chat — Learn Everything",
  description:
    "Chat with a model you choose: download one that runs in your browser, use a local Ollama model, or bring your own key.",
};

// The page reads ?task= on the server, so it has to be rendered per request —
// a hard load of /chat?task=… must still carry the lab context.
export const dynamic = "force-dynamic";

/** The lab the learner came from, if any — the chat keeps that context. */
export interface LabContext {
  slug: string;
  title: string;
  description: string;
  requirements: string[];
}

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ task?: string }>;
}) {
  const { task: taskSlug } = await searchParams;
  const found = taskSlug ? getTask(taskSlug) : undefined;

  const labContext: LabContext | undefined = found
    ? {
        slug: found.task.slug,
        title: found.task.title,
        description: found.task.description,
        requirements: found.task.requirements,
      }
    : undefined;

  return <ChatClient labContext={labContext} />;
}
