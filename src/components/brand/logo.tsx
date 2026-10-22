import type { SVGProps } from "react";

// The Learn Everything mark: a terminal prompt inside a square frame — the
// sandbox you learn in. Drawn with currentColor so it inherits the walnut
// ink of the surface it sits on, and mirrored for the dark theme.

export function LogoMark({ className = "size-6", ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      aria-hidden
      focusable="false"
      {...rest}
    >
      <rect x="2.4" y="2.4" width="43.2" height="43.2" stroke="currentColor" strokeWidth="1.6" />
      <polyline
        points="15.5,14.5 24,24 15.5,33.5"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <rect x="28" y="31.5" width="12" height="3.5" fill="currentColor" />
    </svg>
  );
}

/** The solid mark — for favicons, app icons and small placements. */
export function LogoSolid({ className = "size-6", ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden focusable="false" {...rest}>
      <rect width="48" height="48" fill="currentColor" />
      <polyline
        points="14.5,13.5 24,24 14.5,34.5"
        fill="none"
        stroke="var(--color-eggshell)"
        strokeWidth="4.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <rect x="28.5" y="30.5" width="12" height="4.5" fill="var(--color-eggshell)" />
    </svg>
  );
}

/**
 * The wordmark. Set in the sans face (BwGradual substitute) with a single
 * hairline underline — the treatment the nav and footer both use.
 */
export function LogoWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex flex-col leading-none ${className}`}>
      <span className="text-[18px] font-medium tracking-[-0.01em]">Learn Everything</span>
      <span className="mt-[6px] h-px w-full bg-current opacity-30" aria-hidden />
    </span>
  );
}
