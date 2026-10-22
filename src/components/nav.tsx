"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useProgress, totalXp } from "@/lib/progress";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { SearchDialog } from "@/components/search-dialog";
import { LogoMark } from "@/components/brand/logo";
import type { SearchItem } from "@/lib/search-index";

// DESIGN.md — a single thin top bar, defined by typography and a hairline.
// No fill, no shadow, no sticky elevation.

const links = [
  { href: "/paths", label: "Tracks", hint: "9 career paths" },
  { href: "/labs", label: "Labs", hint: "Every lab, searchable" },
  { href: "/chat", label: "AI Chat", hint: "Bring or download a model" },
  { href: "/tools", label: "Tools", hint: "15+ tool hubs" },
  { href: "/dashboard", label: "Dashboard", hint: "Progress & achievements" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Nav({ searchItems = [] }: { searchItems?: SearchItem[] }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const progress = useProgress();
  const xp = totalXp(progress);
  const streak = progress.streak?.count ?? 0;
  const { data: session } = useSession();

  // Close the mobile menu whenever a route change lands. Adjusting state
  // during render (not in an effect) avoids a cascading re-render.
  const [renderedPathname, setRenderedPathname] = useState(pathname);
  if (renderedPathname !== pathname) {
    setRenderedPathname(pathname);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink/70 bg-eggshell/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between gap-3 px-4 sm:gap-4 sm:px-8">
        {/* Wordmark */}
        <Link href="/" className="group flex shrink-0 items-center gap-2.5 text-ink sm:gap-3">
          <LogoMark className="size-[26px] shrink-0" />
          <span className="text-[16px] font-medium tracking-[-0.01em] underline decoration-ink/30 underline-offset-[6px] group-hover:decoration-ink sm:text-[18px]">
            Learn Everything
          </span>
        </Link>

        {/* Centre label */}
        <div className="hidden items-center gap-2 xl:flex">
          <Link
            href="/paths"
            className="le-label flex items-center gap-2 text-ink transition-opacity hover:opacity-60"
          >
            Tracks
            <svg viewBox="0 0 10 6" className="h-1.5 w-2.5" aria-hidden>
              <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </Link>
        </div>

        {/* Right cluster */}
        <div className="flex shrink-0 items-center gap-2.5 sm:gap-5 lg:gap-7">
          <nav aria-label="Primary" className="hidden items-center gap-7 xl:flex">
            {links.slice(1).map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`text-caption uppercase tracking-[0.083em] transition-opacity hover:opacity-60 ${
                    active ? "text-ink underline decoration-ink/40 underline-offset-[6px]" : "text-graphite"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <SearchDialog items={searchItems} />
          <ThemeToggle />

          {xp > 0 && (
            <Link
              href="/dashboard"
              title="XP and streak from validated labs — opens your dashboard"
              className="hidden items-center gap-1.5 whitespace-nowrap text-caption uppercase tracking-[0.083em] text-graphite transition-opacity hover:opacity-60 sm:flex"
            >
              {xp} XP
              {streak > 1 && <span className="text-ink">· {streak}d</span>}
            </Link>
          )}

          <UserMenu />

          {/* The one filled control in the bar — on the landing page the hero
              owns the filled button, so the bar offers an outlined pill. */}
          <Link
            href="/lab/linux-create-project"
            className={
              pathname === "/"
                ? "le-outline hidden lg:inline-flex"
                : "hidden whitespace-nowrap border border-ink bg-ink px-4 py-2 text-caption font-medium uppercase tracking-[0.083em] text-eggshell transition-opacity hover:opacity-85 lg:block"
            }
          >
            Get started
          </Link>

          {/* Mobile / tablet menu toggle — everything below the wide bar */}
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex size-9 flex-col items-center justify-center gap-[5px] border border-ink/70 xl:hidden"
          >
            <span
              className={`h-px w-4 bg-ink transition-transform duration-200 ${
                menuOpen ? "translate-y-[3px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-4 bg-ink transition-transform duration-200 ${
                menuOpen ? "-translate-y-[3px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="le-menu-in max-h-[calc(100dvh-68px)] overflow-y-auto border-t border-ink/70 bg-eggshell px-4 pb-6 pt-2 sm:px-5 xl:hidden">
          <nav aria-label="Mobile" className="mx-auto flex w-full max-w-2xl flex-col">
            {links.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className="flex items-center justify-between gap-4 border-b border-ink/20 py-4"
                >
                  <span className="min-w-0">
                    <span
                      className={`block text-caption uppercase tracking-[0.083em] ${
                        active ? "text-ink" : "text-graphite"
                      }`}
                    >
                      {l.label}
                    </span>
                    <span className="block text-caption text-smoke">{l.hint}</span>
                  </span>
                  {active && <span className="size-1.5 bg-ink" aria-hidden />}
                </Link>
              );
            })}
          </nav>

          <div className="mx-auto mt-5 flex w-full max-w-2xl items-center gap-3">
            {session ? (
              <button
                onClick={() => void signOut()}
                className="flex-1 whitespace-nowrap border border-ink px-4 py-2.5 text-caption font-medium uppercase tracking-[0.083em] text-ink"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/signin"
                className="flex-1 whitespace-nowrap border border-ink px-4 py-2.5 text-caption font-medium uppercase tracking-[0.083em] text-ink"
              >
                Sign in
              </Link>
            )}
            <Link
              href="/lab/linux-create-project"
              className="flex-1 whitespace-nowrap border border-ink bg-ink px-4 py-2.5 text-center text-caption font-medium uppercase tracking-[0.083em] text-eggshell"
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
