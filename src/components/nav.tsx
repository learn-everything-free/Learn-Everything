import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/paths", label: "Paths" },
  { href: "/paths/devops-engineer", label: "DevOps" },
  { href: "/paths/ai-engineer", label: "AI" },
];

export function Nav() {
  return (
    <header className="bg-eggshell">
      <div className="mx-auto flex h-[50px] max-w-[1280px] items-center gap-8 px-6 lg:px-16">
        <Link href="/" className="text-body-sm font-semibold tracking-[-0.01em]">
          Learn Everything
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-body-sm text-ink transition-colors hover:text-smoke"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <a
            href="https://github.com/NotHarshhaa/Learn-Everything"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full border border-stone bg-eggshell px-3.5 py-1.5 text-body-sm font-medium text-ink transition-colors hover:bg-warm-taupe sm:block"
          >
            GitHub ↗
          </a>
          <Link
            href="/lab/linux-create-project"
            className="rounded-full border border-stone bg-ink px-4 py-1.5 text-body-sm font-medium text-eggshell transition-opacity hover:opacity-80"
          >
            Open a Lab
          </Link>
        </div>
      </div>
    </header>
  );
}
