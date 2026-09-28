"use client";

// Video-style animated sections for the homepage: a self-playing showreel
// (four scenes, chapter markers, player chrome) and an animated "why hands-on"
// band. All motion is CSS-driven and honours prefers-reduced-motion — with
// animations disabled every scene renders in its final, readable state.

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/ui";

const SCENE_MS = 5200;

const CHAPTERS = [
  "Choose a track",
  "Run real commands",
  "Validate real state",
  "Build your streak",
];

function ScenePath() {
  return (
    <div className="grid h-full content-center gap-3 p-6 sm:p-10">
      {[
        { role: "DEVOPS ENGINEER", title: "Linux → Docker → K8s → AWS", active: false },
        { role: "AI ENGINEER", title: "Python → LLMs → RAG → Agents", active: true },
        { role: "MLOPS ENGINEER", title: "Pipelines → Tracking → Serving", active: false },
      ].map((p, i) => (
        <div
          key={p.role}
          className={`flex items-center justify-between rounded-[14px] border px-5 py-4 ${
            p.active ? "border-ember-orange/60 bg-[#1d1f22]" : "border-white/10 bg-[#181a1d]"
          }`}
          style={{ animation: `le-fade-up 0.5s ease-out ${i * 0.25}s both` }}
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ash">{p.role}</p>
            <p className="mt-1 font-mono text-sm text-[#edece0]">{p.title}</p>
          </div>
          {p.active && (
            <span className="rounded-full bg-ember-orange/15 px-3 py-1 font-mono text-[10px] uppercase text-ember-orange">
              you are here
            </span>
          )}
        </div>
      ))}
      <p
        className="mt-2 text-center font-mono text-[11px] uppercase tracking-wider text-ash"
        style={{ animation: "le-fade-up 0.5s ease-out 1.1s both" }}
      >
        every skill breaks into topics · every topic into validated labs
      </p>
    </div>
  );
}

function SceneTerminal() {
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 p-6 font-mono text-[13px] leading-relaxed sm:p-10">
      <p className="text-[#8a9199]"># every lab is a real, disposable environment</p>
      <p className="le-typing text-[#edece0]" style={{ "--w": "34ch", "--delay": "0.3s" } as CSSProperties}>
        <span className="text-emerald-400">$ </span>docker build -t app:latest .
      </p>
      <p className="text-[#8a9199]" style={{ animation: "le-fade-up 0.4s ease-out 1.3s both" }}>
        ✓ image built — 6 layers, 24.1MB
      </p>
      <p className="le-typing text-[#edece0]" style={{ "--w": "38ch", "--delay": "1.7s" } as CSSProperties}>
        <span className="text-emerald-400">$ </span>docker run -d -p 8080:80 app:latest
      </p>
      <p className="text-[#8a9199]" style={{ animation: "le-fade-up 0.4s ease-out 2.7s both" }}>
        9a4f21e018ab · listening on 0.0.0.0:8080
      </p>
      <p className="le-typing text-[#edece0]" style={{ "--w": "22ch", "--delay": "3.1s" } as CSSProperties}>
        <span className="text-emerald-400">$ </span>curl localhost:8080
      </p>
      <p className="text-emerald-400" style={{ animation: "le-fade-up 0.4s ease-out 4.1s both" }}>
        200 OK <span className="le-caret text-[#edece0]">▌</span>
      </p>
    </div>
  );
}

function SceneValidator() {
  const checks = [
    "Container is running",
    "Port 8080 exposed",
    "HTTP 200 on localhost:8080",
  ];
  return (
    <div className="grid h-full content-center gap-5 p-6 sm:p-10">
      <div className="space-y-2.5">
        {checks.map((c, i) => (
          <div
            key={c}
            className="flex items-center gap-3 rounded-[12px] border border-white/10 bg-[#181a1d] px-4 py-3"
            style={{ animation: `le-fade-up 0.4s ease-out ${i * 0.35}s both` }}
          >
            <span
              className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 font-mono text-[10px] text-[#121417]"
              style={{ animation: `le-pop 0.45s ease-out ${0.6 + i * 0.35}s both` }}
            >
              ✓
            </span>
            <span className="font-mono text-[13px] text-[#edece0]">{c}</span>
            <span
              className="ml-auto font-mono text-[10px] uppercase text-emerald-400"
              style={{ animation: `le-fade-up 0.3s ease-out ${0.8 + i * 0.35}s both` }}
            >
              pass
            </span>
          </div>
        ))}
      </div>
      <div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ animation: "le-fill 2.4s ease-out 0.5s both" }}
          />
        </div>
        <p
          className="mt-3 text-center font-mono text-[11px] uppercase tracking-wider text-ash"
          style={{ animation: "le-fade-up 0.4s ease-out 3s both" }}
        >
          checked against real environment state — not a quiz
        </p>
      </div>
    </div>
  );
}

function SceneStreak() {
  return (
    <div className="grid h-full content-center justify-items-center gap-6 p-6 sm:p-10">
      <p
        className="font-mono text-4xl font-light tracking-tight text-ember-orange"
        style={{ animation: "le-rise 4.4s ease-out both" }}
      >
        +50 XP
      </p>
      <div className="flex gap-2">
        {["DAY 1", "DAY 2", "DAY 3"].map((d, i) => (
          <span
            key={d}
            className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] ${
              i === 2
                ? "border-ember-orange/60 bg-ember-orange/10 text-ember-orange"
                : "border-white/10 bg-[#181a1d] text-ash"
            }`}
            style={{ animation: `le-pop 0.45s ease-out ${0.8 + i * 0.5}s both` }}
          >
            {d}
          </span>
        ))}
      </div>
      <p
        className="max-w-sm text-center font-mono text-[11px] uppercase leading-relaxed tracking-wider text-ash"
        style={{ animation: "le-fade-up 0.5s ease-out 2.4s both" }}
      >
        validated labs earn xp · daily streaks keep you shipping
      </p>
    </div>
  );
}

export function ShowreelSection() {
  const [scene, setScene] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => setScene((s) => (s + 1) % CHAPTERS.length), SCENE_MS);
    return () => clearTimeout(timer);
  }, [scene, paused]);

  return (
    <section className="space-y-8">
      <SectionHeader
        tag="Watch It Work"
        sub="A looping reel of the actual platform flow — track, terminal, validator, progress. Every frame below is the real UI, rendered live in your browser."
      >
        See it in action
      </SectionHeader>

      <div
        className="showreel overflow-hidden rounded-[26px] border border-stone bg-[#121417] shadow-[var(--shadow-subtle)]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Player chrome */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-ash" />
            <span className="size-2 rounded-full bg-smoke" />
            <span className="size-2 rounded-full bg-[#ebe8e4]" />
          </div>
          <p className="font-mono text-caption uppercase tracking-wider text-ash">
            learn-everything · showreel
          </p>
          <span
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase ${
              paused
                ? "border-amber-400/40 text-amber-400"
                : "border-emerald-400/40 text-emerald-400"
            }`}
          >
            <span className={`size-1.5 rounded-full ${paused ? "bg-amber-400" : "bg-emerald-400 animate-pulse"}`} />
            {paused ? "paused" : "autoplay"}
          </span>
        </div>

        {/* Stage */}
        <div key={scene} className="h-[380px] text-[#edece0] sm:h-[400px]">
          {scene === 0 && <ScenePath />}
          {scene === 1 && <SceneTerminal />}
          {scene === 2 && <SceneValidator />}
          {scene === 3 && <SceneStreak />}
        </div>

        {/* Chapter markers */}
        <div className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/10 sm:grid-cols-4">
          {CHAPTERS.map((c, i) => (
            <button
              key={c}
              onClick={() => setScene(i)}
              className={`relative bg-[#121417] px-4 py-3 text-left transition-colors ${
                i === scene ? "bg-[#181a1d]" : "hover:bg-[#181a1d]"
              }`}
            >
              <span className="font-mono text-[10px] uppercase text-ash">0{i + 1}</span>
              <p className={`font-mono text-xs ${i === scene ? "text-[#edece0]" : "text-smoke"}`}>
                {c}
              </p>
              {i === scene && (
                <span
                  key={scene}
                  className="absolute bottom-0 left-0 h-[2px] bg-ember-orange"
                  style={{ animation: `le-fill ${SCENE_MS}ms linear forwards`, animationPlayState: paused ? "paused" : "running" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

const LOOP_STAGES = ["Learn", "Practice", "Break", "Debug", "Validate", "Skill"];

const AUDIENCES: { title: string; desc: string; cta: string; href: string }[] = [
  {
    title: "Career switchers",
    desc: "Skip the tutorial graveyard. Follow one validated path from zero to production-grade skills — every step proven by doing, not rewatching.",
    cta: "Pick a path",
    href: "/paths",
  },
  {
    title: "Working engineers",
    desc: "Break real containers, clusters and pipelines in a disposable sandbox — so the first time a config fails isn't in production.",
    cta: "Open a lab",
    href: "/lab/docker-run-app",
  },
  {
    title: "Students & educators",
    desc: "Free forever, runs entirely in the browser. Nothing to install, no cloud bill, no licence — just a terminal and a task.",
    cta: "Browse tools",
    href: "/tools",
  },
];

export function UsefulnessSection() {
  return (
    <section className="space-y-10">
      <SectionHeader
        tag="Why It Works"
        sub="Watching someone else configure Kubernetes teaches you nothing about your own broken cluster. The loop below is the whole method — and it runs on you."
      >
        Built for people who need to do the thing
      </SectionHeader>

      {/* Animated learning loop */}
      <div className="le-motion rounded-[26px] border border-stone bg-warm-taupe/70 p-8 lg:p-10">
        <div className="relative hidden md:block">
          <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-stone" />
          <span
            className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-ember-orange"
            style={{ animation: "le-travel 7s ease-in-out infinite alternate, le-glow 1.6s ease-in-out infinite" }}
          />
          <div className="relative grid grid-cols-6">
            {LOOP_STAGES.map((stage, i) => (
              <div key={stage} className="flex flex-col items-center gap-3 py-2">
                <span className="flex size-9 items-center justify-center rounded-full border border-stone bg-eggshell font-mono text-[11px] text-graphite">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-graphite">{stage}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Mobile: simple chip row */}
        <div className="flex flex-wrap gap-2 md:hidden">
          {LOOP_STAGES.map((stage, i) => (
            <span
              key={stage}
              className="rounded-full border border-stone bg-eggshell px-3.5 py-1.5 font-mono text-[11px] uppercase text-graphite"
            >
              {i + 1} · {stage}
            </span>
          ))}
        </div>
      </div>

      {/* Audience cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {AUDIENCES.map((a, i) => (
          <div
            key={a.title}
            className="le-motion flex flex-col justify-between rounded-[24px] border border-stone/80 bg-warm-taupe/70 p-7 transition-all duration-200 hover:-translate-y-1 hover:border-ink/25 hover:bg-warm-taupe hover:shadow-md"
            style={{ animation: `le-fade-up 0.55s ease-out ${i * 0.12}s both` }}
          >
            <div>
              <h3 className="text-xl font-medium tracking-tight text-ink">{a.title}</h3>
              <p className="mt-3 text-body-sm leading-relaxed text-smoke">{a.desc}</p>
            </div>
            <Link
              href={a.href}
              className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-medium text-eggshell transition-opacity hover:opacity-85"
            >
              {a.cta} →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
