import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/paths", label: "Paths" },
  { href: "/paths/devops-engineer", label: "DevOps" },
  { href: "/paths/ai-engineer", label: "AI" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-cream">
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center gap-10 px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-4 items-center justify-center rounded-[2px] bg-rule">
            <span className="size-1.5 rounded-[2px] bg-amber" />
          </span>
          <span className="text-body-sm font-medium tracking-[-0.04em]">
            Learn Everything
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-body-sm tracking-[-0.04em] text-ink transition-colors hover:text-stone"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-6">
          <a
            href="https://github.com/NotHarshhaa/Learn-Everything"
            target="_blank"
            rel="noreferrer"
            className="hidden font-mono text-mono-sm uppercase text-ink transition-colors hover:text-stone sm:block"
          >
            GitHub ↗
          </a>
          <Link
            href="/lab/linux-create-project"
            className="rounded-[2px] bg-amber px-5 py-2.5 text-caption font-medium tracking-[-0.03em] text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            Open a Lab ↗
          </Link>
        </div>
      </div>
    </header>
  );
}
