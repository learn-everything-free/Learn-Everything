import type { SVGProps } from "react";

export function ToolIcon({
  name,
  className = "size-6",
  color,
}: {
  name: string;
  className?: string;
  color?: string;
}) {
  switch (name) {
    case "docker":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="2" y="8" width="20" height="11" rx="2" />
          <path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
          <line x1="6" y1="12" x2="6" y2="15" />
          <line x1="10" y1="12" x2="10" y2="15" />
          <line x1="14" y1="12" x2="14" y2="15" />
          <line x1="18" y1="12" x2="18" y2="15" />
        </svg>
      );
    case "kubernetes":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="9" />
          <polygon points="12 3 19.8 7.5 19.8 16.5 12 21 4.2 16.5 4.2 7.5" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "linux":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      );
    case "terraform":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polygon points="2 17 12 22 22 17" />
          <polygon points="2 12 12 17 22 12" />
        </svg>
      );
    case "aws":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        </svg>
      );
    case "git":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="6" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
          <circle cx="18" cy="6" r="3" />
          <path d="M6 9v6" />
          <path d="M18 9a9 9 0 0 1-9 9" />
        </svg>
      );
    case "cicd":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
          <path d="M16 8h4" />
          <path d="M18 6v4" />
        </svg>
      );
    case "observability":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 20v-6" />
          <path d="M6 20V10" />
          <path d="M18 20V4" />
          <path d="m3 7 4-4 4 4 4-4 4 4" />
        </svg>
      );
    case "platform-engineering":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    case "networking":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "rag":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
          <circle cx="18" cy="18" r="3" />
        </svg>
      );
    case "agents":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v4" />
          <line x1="8" y1="16" x2="8" y2="16.01" />
          <line x1="16" y1="16" x2="16" y2="16.01" />
        </svg>
      );
    case "prompt-engineering":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
        </svg>
      );
    case "model-serving":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="2" y="2" width="20" height="8" rx="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" />
          <line x1="6" y1="6" x2="6.01" y2="6" />
          <line x1="6" y1="18" x2="6.01" y2="18" />
          <path d="M13 6h5" />
          <path d="M13 18h5" />
        </svg>
      );
    case "model-tracking":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polygon points="2 17 12 22 22 17" />
          <polygon points="2 12 12 17 22 12" />
        </svg>
      );
  }
}
