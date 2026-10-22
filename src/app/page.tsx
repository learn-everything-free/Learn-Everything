import Link from "next/link";
import { paths, countTasks } from "@/lib/data";
import { buildCurriculumIndex } from "@/lib/curriculum-index";
import { Hero } from "@/components/landing/hero";
import {
  TrackGrid,
  SplitSection,
  CurriculumTable,
  Process,
  Faq,
  FinalCta,
} from "@/components/landing/sections";
import { LabOfTheDay } from "@/components/lab-of-the-day";
import { ContinueLearning } from "@/components/continue-learning";

export default function Home() {
  const curriculum = buildCurriculumIndex();

  const totalTasks = paths.reduce((n, p) => n + countTasks(p), 0);
  const totalSkills = paths.reduce((n, p) => n + p.skills.length, 0);
  const totalTopics = paths.reduce(
    (n, p) => n + p.skills.reduce((m, s) => m + s.topics.length, 0),
    0,
  );

  // The opening labs of the first track — the hero thumbnail strip.
  const tiles = curriculum.tasks
    .filter((t) => t.pathSlug === "devops-engineer")
    .slice(0, 4)
    .map((t) => ({ slug: t.slug, title: t.title, skillTitle: t.skillTitle }));

  const bars = paths
    .map((p) => ({ label: p.title, value: countTasks(p) }))
    .sort((a, b) => b.value - a.value);

  const totals = [
    { label: "Career tracks", value: String(paths.length) },
    { label: "Skills", value: String(totalSkills) },
    { label: "Topics", value: String(totalTopics) },
    { label: "Validated labs", value: String(totalTasks) },
  ];

  return (
    <div className="bg-eggshell">
      <Hero tiles={tiles} />

      <TrackGrid />

      <SplitSection />

      <CurriculumTable bars={bars} totals={totals} />

      <Process />

      {/* Pick up where you left off */}
      <section className="border-b border-ink/70">
        <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:py-28">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="le-label text-smoke">Keep going</p>
              <h2 className="mt-6 text-[30px] font-medium uppercase leading-[1.15] tracking-[-0.056em] text-ink sm:text-[40px]">
                Pick up where
                <br />
                you left off
              </h2>
              <p className="mt-6 max-w-[52ch] text-body-sm text-graphite leading-[1.5]">
                The labs are ordered into a curriculum, so the next one is always waiting. One new
                lab drops every midnight.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 self-start md:self-auto">
              <Link href="/dashboard" className="le-outline">
                Open your dashboard
              </Link>
              <Link href="/labs" className="le-outline">
                Browse all labs
              </Link>
            </div>
          </div>

          <div className="mt-14">
            <LabOfTheDay tasks={curriculum.tasks} />
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <ContinueLearning order={curriculum.tasks} />
          </div>
        </div>
      </section>

      <Faq />

      <FinalCta />
    </div>
  );
}
