"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useProgress, totalXp } from "@/lib/progress";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { SearchDialog } from "@/components/search-dialog";
import type { SearchItem } from "@/lib/search-index";

const links = [
  { href: "/", label: "Home" },
  { href: "/paths", label: "Learning Paths" },
  { href: "/tools", label: "Tools" },
  { href: "/dashboard", label: "Dashboard" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Nav({ searchItems = [] }: { searchItems?: SearchItem[] }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const progress = useProgress();
  const xp = totalXp(progress);
  const { data: session } = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever a route change lands. Adjusting state
  // during render (not in an effect) avoids a cascading re-render.
  const [renderedPathname, setRenderedPathname] = useState(pathname);
  if (renderedPathname !== pathname) {
    setRenderedPathname(pathname);
    setMenuOpen(false);
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-eggshell/90 backdrop-blur-md transition-all duration-300 ${
        scrolled || menuOpen
          ? "border-stone shadow-[var(--shadow-subtle)]"
          : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-[60px] max-w-[1280px] items-center justify-between gap-6 px-6 lg:px-16">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-body-sm font-semibold tracking-[-0.01em] text-ink"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-ink font-mono text-xs font-bold text-eggshell transition-transform duration-200 group-hover:-rotate-6">
              L
            </span>
            <span>
              Learn Everything
              <span className="ml-2 hidden font-mono text-[9px] font-normal uppercase tracking-wider text-ash lg:inline">
                hands-on · free forever
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative rounded-full px-3.5 py-1.5 text-body-sm transition-colors ${
                    active
                      ? "bg-warm-taupe font-medium text-ink"
                      : "text-graphite hover:bg-warm-taupe/60 hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <SearchDialog items={searchItems} />
          <ThemeToggle />
          <UserMenu />
          {xp > 0 && (
            <Link
              href="/dashboard"
              title="XP and streak from validated labs"
              className="hidden items-center gap-1.5 rounded-full border border-stone/80 bg-warm-taupe/80 px-3 py-1.5 font-mono text-caption uppercase text-graphite transition-colors hover:bg-stone/60 sm:flex"
            >
              {xp} XP
              {progress.streak && progress.streak.count > 1 && (
                <span className="text-ember-orange">· {progress.streak.count}d</span>
              )}
            </Link>
          )}
          <a
            href="https://github.com/NotHarshhaa/Learn-Everything"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full border border-stone/80 bg-eggshell px-4 py-1.5 text-xs font-medium text-graphite transition-colors hover:bg-warm-taupe lg:block"
          >
            GitHub ↗
          </a>
          <Link
            href="/lab/linux-create-project"
            className="hidden rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-eggshell transition-opacity hover:opacity-85 sm:block"
          >
            Open a Lab ⚡
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex size-9 flex-col items-center justify-center gap-[5px] rounded-full border border-stone/80 bg-eggshell md:hidden"
          >
            <span
              className={`h-[1.5px] w-4 bg-ink transition-transform duration-200 ${
                menuOpen ? "translate-y-[3.25px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-[1.5px] w-4 bg-ink transition-transform duration-200 ${
                menuOpen ? "-translate-y-[3.25px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <nav className="border-t border-stone bg-eggshell px-6 py-4 md:hidden">
          <div className="flex flex-col">
            {links.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-[10px] px-3 py-2.5 text-body-sm ${
                    active ? "bg-warm-taupe font-medium text-ink" : "text-graphite"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-2.5 border-t border-stone pt-4">
            {session ? (
              <button
                onClick={() => void signOut()}
                className="flex-1 rounded-full border border-stone/80 bg-eggshell px-4 py-2 text-center text-xs font-medium text-graphite"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/api/auth/signin"
                className="flex-1 rounded-full border border-stone/80 bg-eggshell px-4 py-2 text-center text-xs font-medium text-graphite"
              >
                Sign in
              </Link>
            )}
            <Link
              href="/lab/linux-create-project"
              className="flex-1 rounded-full bg-ink px-4 py-2 text-center text-xs font-medium text-eggshell"
            >
              Open a Lab ⚡
            </Link>
          </div>
          {xp > 0 && (
            <p className="mt-4 font-mono text-caption uppercase text-smoke">
              {xp} XP
              {progress.streak && progress.streak.count > 1 && ` · ${progress.streak.count}-day streak`}
            </p>
          )}
        </nav>
      )}
    </header>
  );
}
