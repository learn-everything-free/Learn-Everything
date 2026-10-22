import Link from "next/link";
import { paths } from "@/lib/data";
import { LogoMark } from "@/components/brand/logo";

// DESIGN.md — footer on the canvas, separated by a single hairline.
// No fill, no shadow, uppercase column labels.

const TOOL_LINKS = [
  { href: "/tools/docker", label: "Docker" },
  { href: "/tools/kubernetes", label: "Kubernetes" },
  { href: "/tools/linux", label: "Linux & Bash" },
  { href: "/tools/terraform", label: "Terraform" },
  { href: "/tools/rag", label: "RAG & Vectors" },
];

const PRODUCT_LINKS = [
  { href: "/paths", label: "All tracks" },
  { href: "/labs", label: "All labs" },
  { href: "/chat", label: "AI chat" },
  { href: "/lab/linux-create-project", label: "Interactive labs" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/certificates/devops-engineer", label: "Certificates" },
  { href: "/tools", label: "Tool hubs" },
];

export function Footer() {
  return (
    <footer className="border-t border-ink/70 bg-eggshell">
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-8 sm:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-12 lg:grid-cols-[1.7fr_1fr_1fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 text-ink">
              <LogoMark className="size-[26px] shrink-0" />
              <p className="text-[18px] font-medium tracking-[-0.01em] underline decoration-ink/30 underline-offset-[6px]">
                Learn Everything
              </p>
            </div>
            <p className="mt-5 max-w-sm text-body-sm leading-relaxed text-graphite">
              Nine career tracks, 240 hands-on labs and a real terminal in every browser tab. Free,
              open source, and built for people who are starting out.
            </p>
            <a
              href="https://github.com/NotHarshhaa/Learn-Everything"
              target="_blank"
              rel="noreferrer"
              className="le-outline mt-7"
            >
              Star on GitHub
            </a>
          </div>

          <div>
            <p className="le-label text-smoke">Tracks</p>
            <ul className="mt-4 space-y-1 text-caption sm:mt-5 sm:space-y-3">
              {paths.slice(0, 6).map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/paths/${p.slug}`}
                    className="inline-flex min-h-6 items-center py-1 text-graphite transition-opacity hover:opacity-60"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/paths"
                  className="inline-flex min-h-6 items-center py-1 text-ink transition-opacity hover:opacity-60"
                >
                  All nine tracks →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="le-label text-smoke">Product</p>
            <ul className="mt-4 space-y-1 text-caption sm:mt-5 sm:space-y-3">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-flex min-h-6 items-center py-1 text-graphite transition-opacity hover:opacity-60"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <p className="le-label text-smoke">Resources</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-caption sm:mt-5 lg:block lg:space-y-3">
              {TOOL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-flex min-h-6 items-center py-1 text-graphite transition-opacity hover:opacity-60"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://github.com/NotHarshhaa/Learn-Everything/blob/main/LICENSE"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-6 items-center py-1 text-graphite transition-opacity hover:opacity-60"
                >
                  MIT License
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-ink/30 pt-6 sm:flex-row sm:items-center">
          <p className="text-label uppercase tracking-[1px] text-smoke">
            Built for students, career switchers and curious minds.
          </p>
          <p className="text-label uppercase tracking-[1px] text-smoke">
            © {new Date().getFullYear()} Learn Everything · MIT Licensed
          </p>
        </div>
      </div>
    </footer>
  );
}
