import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTask } from "@/lib/data";
import { LabClient } from "@/components/lab-client";

export async function generateMetadata({
  params,
}: PageProps<"/lab/[taskId]">): Promise<Metadata> {
  const { taskId } = await params;
  const found = getTask(taskId);
  return {
    title: found ? `${found.task.title} — Lab · Learn Everything` : "Lab · Learn Everything",
  };
}

export default async function LabPage({ params }: PageProps<"/lab/[taskId]">) {
  const { taskId } = await params;
  const found = getTask(taskId);
  if (!found) notFound();
  const { task, path, skill, topic } = found;

  return <LabClient key={task.slug} task={task} path={path} skill={skill} topic={topic} />;
}
