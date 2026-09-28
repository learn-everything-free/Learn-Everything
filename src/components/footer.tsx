import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-stone bg-eggshell">
      <div className="mx-auto max-w-[1280px] px-6 py-12 lg:px-16">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <p className="text-body-sm font-semibold">Learn Everything</p>
            <p className="mt-2 max-w-md text-body-sm text-smoke">
              Learn. Practice. Experiment. Fail. Debug. Build. Free, hands-on technical
              education — because everyone should have the opportunity to learn by doing.
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <p className="font-mono text-caption uppercase text-ash">Platform</p>
              <ul className="mt-3 space-y-2">
                <li><Link href="/paths" className="text-body-sm text-ink hover:text-smoke">Learning paths</Link></li>
                <li><Link href="/lab/linux-create-project" className="text-body-sm text-ink hover:text-smoke">Lab environment</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-caption uppercase text-ash">Community</p>
              <ul className="mt-3 space-y-2">
                <li>
                  <a href="https://github.com/NotHarshhaa/Learn-Everything" target="_blank" rel="noreferrer" className="text-body-sm text-ink hover:text-smoke">
                    GitHub ↗
                  </a>
                </li>
                <li><span className="text-body-sm text-ash">Discussions — coming soon</span></li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-caption uppercase text-ash">Status</p>
              <p className="mt-3 font-mono text-mono-xs text-smoke">
                PRE-ALPHA · BUILT IN PUBLIC
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-stone pt-6">
          <p className="font-mono text-caption uppercase text-ash">
            Free forever philosophy · 100% free, forever
          </p>
        </div>
      </div>
    </footer>
  );
}
