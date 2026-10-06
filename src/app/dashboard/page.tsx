import type { Metadata } from "next";
import { buildCurriculumIndex } from "@/lib/curriculum-index";
import { DashboardClient } from "@/components/dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard — Learn Everything",
  description:
    "Track your XP, streak, per-path progress, and achievements across every validated hands-on lab.",
};

export default function DashboardPage() {
  return <DashboardClient index={buildCurriculumIndex()} />;
}
