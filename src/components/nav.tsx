import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "Tools", highlight: true },
  { href: "/paths", label: "Learning Paths" },
  { href: "/paths/devops-engineer", label: "DevOps" },
  { href: "/paths/ai-engineer", label: "AI Engineer" },
  { href: "/paths/mlops-engineer", label: "MLOps" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone/70 bg-eggshell/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-[56px] max-w-[1280px] items-center justify-between gap-6 px-6 lg:px-16">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-body-sm font-semibold tracking-[-0.01em] text-ink hover:opacity-85"
          >
            <span className="flex size-6 items-center justify-center rounded-lg bg-ink text-xs text-eggshell font-mono font-bold">
              L
            </span>
            <span>Learn Everything</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="relative text-body-sm font-medium text-graphite transition-colors hover:text-ink"
              >
                {l.label}
                {l.highlight && (
                  <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-emerald-800">
                    HUB
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/tools"
            className="hidden rounded-full border border-stone/80 bg-warm-taupe/80 px-3.5 py-1.5 text-xs font-medium text-graphite transition-colors hover:bg-stone/60 sm:block"
          >
            Explore Tools
          </Link>
          <a
            href="https://github.com/NotHarshhaa/Learn-Everything"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full border border-stone/80 bg-eggshell px-3.5 py-1.5 text-xs font-medium text-graphite transition-colors hover:bg-warm-taupe sm:block"
          >
            GitHub ↗
          </a>
          <Link
            href="/lab/linux-create-project"
            className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-eggshell transition-opacity hover:opacity-85 shadow-xs"
          >
            Open a Lab ⚡
          </Link>
        </div>
      </div>
    </header>
  );
}
