import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-stone/80 bg-eggshell mt-20">
      <div className="mx-auto max-w-[1280px] px-6 py-14 lg:px-16">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-ink text-xs text-eggshell font-mono font-bold">
                L
              </span>
              <p className="text-body-sm font-semibold text-ink">Learn Everything</p>
            </div>
            <p className="mt-3 max-w-sm text-body-sm text-smoke leading-relaxed">
              Don’t just learn how technology works. Learn how to actually use it. Free,
              interactive technical education with real Linux terminals, automated validators,
              and in-depth production tool hubs.
            </p>
            <p className="mt-4 font-mono text-[11px] text-ash">
              100% Free · Open Source Forever · MIT Licensed
            </p>
          </div>

          <div>
            <p className="font-mono text-caption uppercase text-ash tracking-wider">
              Tool Hubs
            </p>
            <ul className="mt-3 space-y-2 text-body-sm">
              <li>
                <Link href="/tools/docker" className="text-graphite hover:text-ink transition-colors">
                  Docker Hub
                </Link>
              </li>
              <li>
                <Link href="/tools/kubernetes" className="text-graphite hover:text-ink transition-colors">
                  Kubernetes Hub
                </Link>
              </li>
              <li>
                <Link href="/tools/linux" className="text-graphite hover:text-ink transition-colors">
                  Linux & Bash
                </Link>
              </li>
              <li>
                <Link href="/tools/terraform" className="text-graphite hover:text-ink transition-colors">
                  Terraform IaC
                </Link>
              </li>
              <li>
                <Link href="/tools/rag" className="text-graphite hover:text-ink transition-colors">
                  RAG & Vectors
                </Link>
              </li>
              <li>
                <Link href="/tools" className="font-medium text-ink hover:underline">
                  Browse All 15+ Tools →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-caption uppercase text-ash tracking-wider">
              Curriculum Paths
            </p>
            <ul className="mt-3 space-y-2 text-body-sm">
              <li>
                <Link href="/paths/devops-engineer" className="text-graphite hover:text-ink transition-colors">
                  DevOps Engineer
                </Link>
              </li>
              <li>
                <Link href="/paths/ai-engineer" className="text-graphite hover:text-ink transition-colors">
                  AI Engineer
                </Link>
              </li>
              <li>
                <Link href="/paths/mlops-engineer" className="text-graphite hover:text-ink transition-colors">
                  MLOps Engineer
                </Link>
              </li>
              <li>
                <Link href="/paths" className="text-graphite hover:text-ink transition-colors">
                  Path Catalog
                </Link>
              </li>
              <li>
                <Link href="/lab/linux-create-project" className="text-graphite hover:text-ink transition-colors">
                  Interactive Terminal Lab
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-caption uppercase text-ash tracking-wider">
              Open Source
            </p>
            <ul className="mt-3 space-y-2 text-body-sm">
              <li>
                <a
                  href="https://github.com/NotHarshhaa/Learn-Everything"
                  target="_blank"
                  rel="noreferrer"
                  className="text-graphite hover:text-ink transition-colors"
                >
                  GitHub Repository ↗
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/NotHarshhaa/Learn-Everything/blob/main/LICENSE"
                  target="_blank"
                  rel="noreferrer"
                  className="text-graphite hover:text-ink transition-colors"
                >
                  License (MIT)
                </a>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-stone/70 px-2.5 py-0.5 font-mono text-[10px] text-smoke">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sandbox Ready
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone/80 pt-6">
          <p className="font-mono text-caption uppercase text-ash">
            Built for builders, engineers, and curious minds.
          </p>
          <p className="font-mono text-caption text-ash">
            © {new Date().getFullYear()} Learn Everything.
          </p>
        </div>
      </div>
    </footer>
  );
}
