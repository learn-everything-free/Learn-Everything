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
  { href: "/", label: "Home", hint: "Start here" },
  { href: "/paths", label: "Learning Paths", hint: "Role-based tracks" },
  { href: "/tools", label: "Tools", hint: "15+ tool hubs" },
  { href: "/dashboard", label: "Dashboard", hint: "Progress & achievements" },
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
  const streak = progress.streak?.count ?? 0;
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
      <div
        className={`mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-6 transition-[height] duration-300 lg:px-16 ${
          scrolled ? "h-[54px]" : "h-[60px]"
        }`}
      >
        {/* Brand + primary nav */}
        <div className="flex min-w-0 items-center gap-8">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 text-body-sm font-semibold tracking-[-0.01em] text-ink"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-ink font-mono text-xs font-bold text-eggshell transition-transform duration-200 group-hover:-rotate-6">
              L
            </span>
            <span className="whitespace-nowrap">
              Learn Everything
              <span className="ml-2 hidden font-mono text-[9px] font-normal uppercase tracking-wider text-ash 2xl:inline">
                hands-on · free forever
              </span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-0.5 md:flex">
            {links.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative whitespace-nowrap rounded-full px-3.5 py-1.5 text-body-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
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

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <SearchDialog items={searchItems} />
          <ThemeToggle />
          {xp > 0 && (
            <Link
              href="/dashboard"
              title="XP and streak from validated labs — opens your dashboard"
              className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-stone/80 bg-warm-taupe/80 px-3 py-1.5 font-mono text-caption uppercase text-graphite transition-colors hover:bg-stone/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:flex"
            >
              <span className="text-ember-orange">⚡</span> {xp} XP
              {streak > 1 && (
                <span className="text-ember-orange" title={`${streak}-day streak`}>
                  🔥 {streak}d
                </span>
              )}
            </Link>
          )}
          <a
            href="https://github.com/NotHarshhaa/Learn-Everything"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
            title="GitHub repository"
            className="hidden size-9 items-center justify-center rounded-full border border-stone/80 bg-eggshell text-graphite transition-colors hover:bg-warm-taupe hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink lg:flex"
          >
            <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.53-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
            </svg>
          </a>
          <UserMenu />
          <Link
            href="/lab/linux-create-project"
            className="hidden whitespace-nowrap rounded-full bg-ink px-4 py-2 text-xs font-medium text-eggshell transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:block"
          >
            Open a Lab ⚡
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex size-9 flex-col items-center justify-center gap-[5px] rounded-full border border-stone/80 bg-eggshell focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:hidden"
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
        <div className="le-menu-in border-t border-stone bg-eggshell px-6 pb-6 pt-2 md:hidden">
          <nav aria-label="Mobile" className="flex flex-col">
            {links.map((l, i) => {
              const active = isActive(pathname, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-4 rounded-[14px] px-3 py-3 transition-colors ${
                    active ? "bg-warm-taupe" : "hover:bg-warm-taupe/60"
                  }`}
                >
                  <span className="font-mono text-caption text-ash">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-body-sm ${active ? "font-medium text-ink" : "text-graphite"}`}
                    >
                      {l.label}
                    </span>
                    <span className="block font-mono text-caption text-ash">{l.hint}</span>
                  </span>
                  {active && <span className="size-1.5 rounded-full bg-ink" aria-hidden />}
                </Link>
              );
            })}
          </nav>

          {xp > 0 && (
            <Link
              href="/dashboard"
              className="mt-4 flex items-center justify-between rounded-[14px] border border-stone bg-warm-taupe/70 px-4 py-3"
            >
              <span className="font-mono text-caption uppercase tracking-wider text-ash">
                Your progress
              </span>
              <span className="font-mono text-caption text-graphite">
                <span className="text-ember-orange">⚡</span> {xp} XP
                {streak > 1 && <span className="text-ember-orange"> · 🔥 {streak}d</span>}
              </span>
            </Link>
          )}

          <div className="mt-4 flex items-center gap-2.5 border-t border-stone pt-4">
            {session ? (
              <button
                onClick={() => void signOut()}
                className="flex-1 whitespace-nowrap rounded-full border border-stone/80 bg-eggshell px-4 py-2.5 text-center text-xs font-medium text-graphite"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/signin"
                className="flex-1 whitespace-nowrap rounded-full border border-stone/80 bg-eggshell px-4 py-2.5 text-center text-xs font-medium text-graphite"
              >
                Sign in
              </Link>
            )}
            <Link
              href="/lab/linux-create-project"
              className="flex-1 whitespace-nowrap rounded-full bg-ink px-4 py-2.5 text-center text-xs font-medium text-eggshell"
            >
              Open a Lab ⚡
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
