import type { Metadata } from "next";
import { paths } from "@/lib/data";
import { LabsBrowser, type LabEntry } from "@/components/labs-browser";

export const metadata: Metadata = {
  title: "All Labs — Learn Everything",
  description:
    "Every hands-on lab in the curriculum on one page — search and filter by track, skill, level and task type.",
};

export default function LabsPage() {
  const labs: LabEntry[] = [];
  for (const path of paths) {
    for (const skill of path.skills) {
      for (const topic of skill.topics) {
        for (const task of topic.tasks) {
          labs.push({
            slug: task.slug,
            title: task.title,
            description: task.description,
            type: task.type,
            difficulty: task.difficulty,
            env: task.env,
            pathSlug: path.slug,
            pathTitle: path.title,
            skillSlug: skill.slug,
            skillTitle: skill.title,
            topicTitle: topic.title,
          });
        }
      }
    }
  }

  return <LabsBrowser labs={labs} />;
}
