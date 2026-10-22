import Link from "next/link";
import { paths, countTasks } from "@/lib/data";
import { DisplayHeading } from "./hero";
import { TerminalGif, type GifLine } from "@/components/terminal-gif";

const DEMO_LINES: GifLine[] = [
  { kind: "out", text: "1. deploy the app as a container", tone: "dim" },
  { kind: "cmd", text: "docker run -d -p 8080:80 app:latest" },
  { kind: "out", text: "9a4f21e018ab   app:latest   Up 4 minutes   0.0.0.0:8080->80" },
  { kind: "out", text: "2. the validator checks real state", tone: "dim" },
  { kind: "cmd", text: "submit" },
  { kind: "out", text: "✓ Port 8080 mapped to container port 80", tone: "ok" },
  { kind: "out", text: "✓ HTTP 200 returned from the endpoint", tone: "ok" },
  { kind: "out", text: "PASSED — +50 XP earned", tone: "ok" },
];

const STEPS = [
  {
    n: "01",
    title: "Pick a track",
    body: "Choose the job you are aiming at — DevOps, Data, Backend, Frontend or one of the AI coding agents.",
  },
  {
    n: "02",
    title: "Do the first lab",
    body: "A beginner task of a few minutes, with every command explained before you type it.",
  },
  {
    n: "03",
    title: "Build the streak",
    body: "One lab a day beats a weekend binge. The streak and the XP ladder make the habit visible.",
  },
  {
    n: "04",
    title: "Finish with proof",
    body: "Work through every lab in the track and the certificate unlocks — evidence of the work.",
  },
];

const FAQ = [
  {
    q: "Do I need my own machine, a cloud account or a credit card?",
    a: "None of them. Every lab runs in a sandbox inside your browser — a real Linux shell with docker, kubectl, terraform and git available. There is nothing to install and nothing to pay for.",
  },
  {
    q: "I have never opened a terminal. Will I be lost?",
    a: "No. Every track starts with a beginner lab that takes a few minutes, and each command comes with a one-line explanation of what it does and why.",
  },
  {
    q: "How do I know whether I actually learned it?",
    a: "The validator checks the state of the sandbox, not your answers. If a container is not running with the right port mapped, the task is not passed however confident you feel.",
  },
  {
    q: "How long before I am ready for a job?",
    a: "It depends on the track and on what you already know. A focused track is roughly 16 to 72 labs — at one or two labs a day, that is a couple of months of steady work.",
  },
  {
    q: "Can my team or my class use this?",
    a: "Yes. Sign in with GitHub to sync progress across machines, or self-host the platform for an onboarding cohort. The curriculum is MIT licensed.",
  },
  {
    q: "Is it really free, or is there a catch?",
    a: "There is no catch and no trial countdown. The platform is open source and free to use, including all 240 labs.",
  },
];

export function TrackGrid() {
  return (
    <section className="border-b border-ink/70">
      <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:py-28">
        <DisplayHeading eyebrow="The catalog">
          Nine tracks,
          <br />
          one curriculum
        </DisplayHeading>

        <div className="mt-16 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {paths.map((p) => (
            <Link
              key={p.slug}
              href={`/paths/${p.slug}`}
              className="group flex min-h-[200px] flex-col justify-between border border-ink/70 p-6 transition-colors hover:border-ink"
            >
              <div>
                <p className="le-label text-smoke">{p.role}</p>
                <h3 className="mt-4 text-body-sm font-medium tracking-tight text-ink">
                  {p.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-body-sm leading-[1.45] text-graphite">
                  {p.tagline}
                </p>
              </div>
              <div className="mt-8 flex items-end justify-between border-t border-ink/25 pt-4">
                <span className="text-label uppercase tracking-[1px] text-smoke">
                  {p.skills.length} skills · {countTasks(p)} labs
                </span>
                <span className="text-body-sm text-ink transition-transform duration-200 group-">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SplitSection() {
  return (
    <section className="border-b border-ink/70">
      <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:py-28">
        <DisplayHeading eyebrow="The method">
          A real terminal.
          <br />
          A real validator.
          <br />
          A certificate when
          <br />
          you finish.
        </DisplayHeading>

        {/* Asymmetric split: label left, body right */}
        <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-20">
          <p className="text-body-sm font-medium uppercase leading-[1.4] tracking-[-0.07px] text-ink lg:text-right">
            Hands-on,
            <br />
            not hands-waving
          </p>
          <div className="max-w-[52ch] space-y-6 text-body-sm text-graphite leading-[1.5]">
            <p>
              Every lab is a real command in a disposable sandbox. You deploy a container, apply
              a manifest, run a pipeline, break a configuration — and read the actual error.
            </p>
            <p>
              When the work is done, an automated validator inspects the machine: the port is
              mapped, the pod is running, the state file is applied. It grades the system, not
              the answer key.
            </p>
          </div>
        </div>

        {/* The demonstration block — the product's own photograph */}
        <div className="mt-16 border border-ink">
          <TerminalGif lines={DEMO_LINES} title="learner@lab:~" badge="Validator active" className="border-0" />
        </div>
      </div>
    </section>
  );
}

export interface Bar {
  label: string;
  value: number;
}

export function CurriculumTable({ bars, totals }: { bars: Bar[]; totals: { label: string; value: string }[] }) {
  const max = Math.max(...bars.map((b) => b.value));

  return (
    <section className="border-b border-ink/70">
      <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <div>
            <p className="le-label text-smoke">By the numbers</p>
            <h3 className="mt-6 text-[30px] font-medium uppercase leading-[1.15] tracking-[-0.056em] text-ink sm:text-[40px]">
              What 240 labs
              <br />
              actually looks like
            </h3>

            <ul className="mt-12 border-t border-ink/30">
              {bars.map((bar) => (
                <li
                  key={bar.label}
                  className="flex items-center gap-6 border-b border-ink/20 py-4"
                >
                  <span className="w-44 shrink-0 text-body-sm text-graphite sm:w-56">
                    {bar.label}
                  </span>
                  <span className="h-3 flex-1 bg-ink/10">
                    <span
                      className="block h-3 bg-ink"
                      style={{ width: `${Math.round((bar.value / max) * 100)}%` }}
                    />
                  </span>
                  <span className="w-10 shrink-0 text-right text-body-sm text-ink">{bar.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="grid grid-cols-2 border-t border-ink/30">
              {totals.map((t) => (
                <div key={t.label} className="border-b border-ink/20 py-6 pr-6">
                  <p className="text-heading-sm font-medium tracking-[-2.24px] text-ink">
                    {t.value}
                  </p>
                  <p className="mt-2 text-label uppercase tracking-[1px] text-smoke">{t.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 border border-ink p-7">
              <p className="le-label text-smoke">The price</p>
              <p className="mt-4 text-body-sm font-medium text-ink">Free forever</p>
              <p className="mt-3 text-body-sm leading-[1.5] text-graphite">
                No card, no seat licence, no trial that expires. The whole curriculum is MIT
                licensed and self-hostable, and it stays up as long as the project does.
              </p>
              <Link href="/paths" className="le-pill mt-6">
                Start a track
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Process() {
  return (
    <section className="border-b border-ink/70">
      <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:py-28">
        <DisplayHeading eyebrow="How it works">
          Your first week,
          <br />
          step by step
        </DisplayHeading>

        <ol className="mt-16 grid gap-px border-t border-ink/30 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <li key={step.n} className="border-b border-ink/20 py-8 pr-8">
              <span className="le-label text-smoke">{step.n}</span>
              <h3 className="mt-4 text-body-sm font-medium text-ink">{step.title}</h3>
              <p className="mt-3 text-body-sm leading-[1.5] text-graphite">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section className="border-b border-ink/70">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.5fr] lg:gap-20 lg:py-28">
        <div>
          <p className="le-label text-smoke">Questions</p>
          <h3 className="mt-6 text-[30px] font-medium uppercase leading-[1.15] tracking-[-0.056em] text-ink sm:text-[40px]">
            Frequently
            <br />
            asked
          </h3>
          <p className="mt-6 max-w-[40ch] text-body-sm text-graphite leading-[1.5]">
            Everything a first-time learner usually wants to know before they start.
          </p>
        </div>

        <div className="border-t border-ink/30">
          {FAQ.map((item) => (
            <details key={item.q} className="group border-b border-ink/20">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-body-sm font-medium text-ink">
                {item.q}
                <span
                  className="flex size-7 shrink-0 items-center justify-center border border-ink/40 text-ink transition-transform group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="max-w-[60ch] pb-7 pr-12 text-body-sm leading-[1.6] text-graphite">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section>
      <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:py-28">
        <p className="le-label text-smoke">Ready when you are</p>
        <h2 className="mt-6 max-w-[16ch] text-[38px] font-medium uppercase leading-[1.05] tracking-[-0.056em] text-ink sm:text-[60px] lg:text-[80px]">
          Stop watching.
          <br />
          Start shipping.
        </h2>
        <p className="mt-8 max-w-[52ch] text-body text-graphite leading-[1.5]">
          Open your first lab in a real terminal. Free, no sign-up, two minutes from now.
        </p>
        <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Link href="/lab/linux-create-project" className="le-action">
            Start learning free
          </Link>
          <Link href="/paths" className="le-pill">
            Browse the tracks
          </Link>
        </div>
      </div>
    </section>
  );
}
