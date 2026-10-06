import { paths, taskTypeLabel } from "./data";
import { tools } from "./tools";

// Lightweight site-wide search index, built on the server (layout) and passed
// down to the client-side command palette. No lesson markdown included — just
// titles, labels, and destinations.

export interface SearchItem {
  title: string;
  subtitle: string;
  kind: "Path" | "Skill" | "Lab" | "Tool" | "Page";
  href: string;
  keywords?: string;
}

export function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [
    { title: "Home", subtitle: "Start here", kind: "Page", href: "/" },
    { title: "Learning Paths", subtitle: "Role-based curriculum tracks", kind: "Page", href: "/paths" },
    { title: "Tools", subtitle: "Tool hubs, cheatsheets & pitfalls", kind: "Page", href: "/tools" },
    { title: "Dashboard", subtitle: "Your progress, streak & achievements", kind: "Page", href: "/dashboard" },
  ];

  for (const path of paths) {
    items.push({
      title: path.title,
      subtitle: `Path · ${path.role}`,
      kind: "Path",
      href: `/paths/${path.slug}`,
      keywords: `${path.slug} ${path.tagline}`,
    });
    for (const skill of path.skills) {
      items.push({
        title: skill.title,
        subtitle: `Skill · ${path.title}`,
        kind: "Skill",
        href: `/paths/${path.slug}/${skill.slug}`,
        keywords: `${skill.slug} ${skill.summary ?? ""}`,
      });
    }
  }

  for (const tool of tools) {
    items.push({
      title: tool.name,
      subtitle: `Tool hub · ${tool.category}`,
      kind: "Tool",
      href: `/tools/${tool.slug}`,
      keywords: `${tool.slug} ${tool.tagline}`,
    });
  }

  for (const path of paths) {
    for (const skill of path.skills) {
      for (const topic of skill.topics) {
        for (const task of topic.tasks) {
          items.push({
            title: task.title,
            subtitle: `Lab · ${skill.title}`,
            kind: "Lab",
            href: `/lab/${task.slug}`,
            keywords: `${task.slug} ${taskTypeLabel[task.type] ?? task.type} ${task.difficulty} ${task.description}`,
          });
        }
      }
    }
  }

  return items;
}
