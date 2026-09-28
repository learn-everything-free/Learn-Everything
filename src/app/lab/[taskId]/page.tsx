import { notFound } from "next/navigation";
import { getTask } from "@/lib/data";
import { LabClient } from "@/components/lab-client";

export default async function LabPage({ params }: PageProps<"/lab/[taskId]">) {
  const { taskId } = await params;
  const found = getTask(taskId);
  if (!found) notFound();
  const { task, path, skill, topic } = found;

  return <LabClient task={task} path={path} skill={skill} topic={topic} />;
}
