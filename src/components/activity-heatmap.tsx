"use client";

// GitHub-style activity heatmap built from real completion timestamps in the
// progress store. 26 week-columns, oldest on the left; future days invisible.

import { useMemo } from "react";
import { useProgress } from "@/lib/progress";

const WEEKS = 26;

// Frozen at module load: keeps the grid stable for the whole page view.
const TODAY = new Date();

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ActivityHeatmap() {
  const { completed } = useProgress();

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const ts of Object.values(completed)) {
      const key = dayKey(new Date(ts));
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [completed]);

  const grid = useMemo(() => {
    // Column per week, row per weekday (Sun..Sat), ending on the current week.
    const end = new Date(TODAY);
    const start = new Date(TODAY);
    start.setDate(start.getDate() - (WEEKS * 7 - 1));
    start.setDate(start.getDate() - start.getDay()); // back to Sunday

    const weeks: { key: string; date: Date; inFuture: boolean; count: number }[][] = [];
    const cursor = new Date(start);
    while (cursor <= end || cursor.getDay() !== 0) {
      const week: { key: string; date: Date; inFuture: boolean; count: number }[] = [];
      for (let d = 0; d < 7; d++) {
        week.push({
          key: dayKey(cursor),
          date: new Date(cursor),
          inFuture: cursor > TODAY,
          count: counts.get(dayKey(cursor)) ?? 0,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
      if (weeks.length >= WEEKS + 1) break;
    }
    return weeks;
  }, [counts]);

  const inPeriod = useMemo(() => {
    const cutoff = new Date(TODAY);
    cutoff.setDate(cutoff.getDate() - WEEKS * 7);
    return Object.entries(completed).filter(([, ts]) => new Date(ts) >= cutoff).length;
  }, [completed]);

  const levelClass = (count: number): string => {
    if (count === 0) return "bg-stone/50 dark:bg-stone/20";
    if (count === 1) return "bg-emerald-200 dark:bg-emerald-500/30";
    if (count === 2) return "bg-emerald-400 dark:bg-emerald-500/60";
    return "bg-emerald-600 dark:bg-emerald-400";
  };

  return (
    <div className="rounded-[24px] border border-stone/80 bg-warm-taupe/70 p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="font-mono text-caption uppercase tracking-wider text-ash">
          Activity — last {WEEKS} weeks
        </p>
        <span className="font-mono text-caption text-smoke">
          {inPeriod} {inPeriod === 1 ? "lab" : "labs"} validated in this window
        </span>
      </div>
      <div className="mt-6 overflow-x-auto pb-1">
        <div className="flex gap-[3px]">
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((cell) => (
                <span
                  key={cell.key}
                  title={
                    cell.inFuture
                      ? ""
                      : `${cell.count} ${cell.count === 1 ? "lab" : "labs"} — ${cell.date.toLocaleDateString()}`
                  }
                  className={`size-3 rounded-[3px] ${cell.inFuture ? "invisible" : levelClass(cell.count)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className="font-mono text-caption text-ash">less</span>
        {[0, 1, 2, 3].map((level) => (
          <span key={level} className={`size-3 rounded-[3px] ${levelClass(level)}`} />
        ))}
        <span className="font-mono text-caption text-ash">more</span>
      </div>
    </div>
  );
}
