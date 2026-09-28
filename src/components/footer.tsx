import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-rule bg-cream">
      <div className="mx-auto max-w-[1200px] px-6 py-16 lg:px-10">
        <p className="max-w-2xl text-heading tracking-[-0.05em]">
          Learn. Practice. Experiment. <span className="text-amber">Fail. Debug. Build.</span>
        </p>

        <div className="mt-12 grid gap-10 border-t border-rule pt-8 sm:grid-cols-3">
          <div>
            <p className="font-mono text-mono-xs uppercase text-stone">Platform</p>
            <ul className="mt-4 space-y-2">
              <li><Link href="/paths" className="text-body-sm tracking-[-0.04em] hover:text-stone">Learning paths</Link></li>
              <li><Link href="/lab/linux-create-project" className="text-body-sm tracking-[-0.04em] hover:text-stone">Lab environment</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-mono-xs uppercase text-stone">Community</p>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="https://github.com/NotHarshhaa/Learn-Everything" target="_blank" rel="noreferrer" className="text-body-sm tracking-[-0.04em] hover:text-stone">
                  GitHub ↗
                </a>
              </li>
              <li><span className="text-body-sm tracking-[-0.04em] text-stone">Discussions — coming soon</span></li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-mono-xs uppercase text-stone">Status</p>
            <p className="mt-4 font-mono text-mono-sm text-stone">
              PRE-ALPHA · BUILT IN PUBLIC<br />FREE FOREVER PHILOSOPHY
            </p>
          </div>
        </div>

        <p className="mt-12 border-t border-rule pt-6 font-mono text-mono-xs uppercase text-stone">
          Learn Everything — because everyone should have the opportunity to learn by doing
        </p>
      </div>
    </footer>
  );
}
