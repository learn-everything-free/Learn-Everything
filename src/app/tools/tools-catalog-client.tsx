"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { tools, toolCategories, type ToolDefinition } from "@/lib/tools";
import { ToolCard, Badge } from "@/components/ui";

interface ToolsCatalogClientProps {
  taskCounts: Record<string, number>;
}

export function ToolsCatalogClient({ taskCounts }: ToolsCatalogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesCategory =
        selectedCategory === "All" || tool.category === selectedCategory;
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const totalLabs = Object.values(taskCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-10">
      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col gap-6 rounded-[24px] border border-stone/80 bg-warm-taupe/60 p-6 md:p-8">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-smoke">
            <svg
              className="size-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search tools by name, technology, or concept (e.g., Docker, K8s, RAG, Terraform)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-stone bg-eggshell py-3.5 pl-12 pr-6 text-body-sm text-ink placeholder:text-ash focus:border-ink focus:outline-hidden focus:ring-1 focus:ring-ink"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-caption uppercase text-ash hover:text-ink"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              selectedCategory === "All"
                ? "bg-ink text-eggshell shadow-xs"
                : "border border-stone bg-eggshell text-graphite hover:bg-stone/60"
            }`}
          >
            All Tools ({tools.length})
          </button>
          {toolCategories.map((cat) => {
            const count = tools.filter((t) => t.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-ink text-eggshell shadow-xs"
                    : "border border-stone bg-eggshell text-graphite hover:bg-stone/60"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Tool Cards */}
      {filteredTools.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.slug}
              tool={tool}
              taskCount={taskCounts[tool.associatedSkillSlug] ?? 0}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-stone bg-warm-taupe/40 p-12 text-center">
          <p className="text-body font-medium text-graphite">No tools found</p>
          <p className="mt-2 text-body-sm text-smoke">
            No production tools matched &ldquo;{searchQuery}&rdquo;. Try another search term or reset filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="mt-6 rounded-full border border-stone bg-eggshell px-4 py-2 text-body-sm font-medium text-ink hover:bg-stone"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
