import { Metadata } from "next";
import Link from "next/link";
import { tools } from "@/lib/tools";
import { paths, getTasksBySkillSlug } from "@/lib/data";
import { ToolsCatalogClient } from "./tools-catalog-client";
import { Badge, StatCard } from "@/components/ui";

export const metadata: Metadata = {
  title: "Tools Directory — Learn Everything",
  description:
    "Explore dedicated guides, interactive terminal sandboxes, architecture blueprints, and cheatsheets for every industry-standard DevOps, Cloud, and AI tool.",
};

export default function ToolsPage() {
  // Precompute task counts for each tool's skill
  const taskCounts: Record<string, number> = {};
  for (const tool of tools) {
    const tasks = getTasksBySkillSlug(tool.associatedSkillSlug);
    taskCounts[tool.associatedSkillSlug] = tasks.length;
  }

  const totalLabs = Object.values(taskCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-14 lg:px-16 lg:py-20">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <p className="font-mono text-caption uppercase text-ash tracking-wider">
            Directory & Reference
          </p>
          <span className="size-1 rounded-full bg-ash" />
          <Badge variant="ink" className="font-mono text-[11px]">
            {tools.length} Production Tools
          </Badge>
        </div>

        <h1 className="text-display font-light tracking-[-0.02em] text-ink max-w-4xl">
          Separate, in-depth hubs for every critical tool.
        </h1>
        <p className="max-w-2xl text-body text-smoke leading-relaxed">
          Deep-dive into individual technologies with dedicated pages. Every tool hub features
          interactive browser terminal labs, system architecture breakdowns, curated CLI cheatsheets,
          and production failure gotchas.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          value={String(tools.length)}
          label="Individual Tools"
          sub="Separate dedicated hubs"
        />
        <StatCard
          value={String(totalLabs)}
          label="Interactive Labs"
          sub="Automated verification"
        />
        <StatCard
          value="100%"
          label="Browser Terminal"
          sub="Zero installation needed"
        />
        <StatCard
          value="Free"
          label="Open Source"
          sub="Forever unrestricted"
        />
      </div>

      {/* Interactive Catalog */}
      <div className="mt-12">
        <ToolsCatalogClient taskCounts={taskCounts} />
      </div>
    </div>
  );
}
