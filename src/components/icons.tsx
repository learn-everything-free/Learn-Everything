import type { SVGProps } from "react";
import {
  siDocker,
  siKubernetes,
  siLinux,
  siTerraform,
  siGit,
  siGithubactions,
  siPrometheus,
  siGrafana,
  siArgo,
  siWireshark,
  siPython,
  siAnthropic,
  siLangchain,
  siHuggingface,
  siMlflow,
  siApacheairflow,
  siQdrant,
  siFastapi,
  siOllama,
  type SimpleIcon,
} from "simple-icons";

// Official brand marks (Simple Icons, CC0) for every tool/skill slug.
// AWS is inlined below because its mark was removed from Simple Icons at the
// brand's request; the path is Font Awesome Free 6.5.2 "aws" (CC BY 4.0,
// © Fonticons Inc.).
const AWS_PATH =
  "M180.41 203.01c-.72 22.65 10.6 32.68 10.88 39.05a8.164 8.164 0 0 1-4.1 6.27l-12.8 8.96a10.66 10.66 0 0 1-5.63 1.92c-.43-.02-8.19 1.83-20.48-25.61a78.608 78.608 0 0 1-62.61 29.45c-16.28.89-60.4-9.24-58.13-56.21-1.59-38.28 34.06-62.06 70.93-60.05 7.1.02 21.6.37 46.99 6.27v-15.62c2.69-26.46-14.7-46.99-44.81-43.91-2.4.01-19.4-.5-45.84 10.11-7.36 3.38-8.3 2.82-10.75 2.82-7.41 0-4.36-21.48-2.94-24.2 5.21-6.4 35.86-18.35 65.94-18.18a76.857 76.857 0 0 1 55.69 17.28 70.285 70.285 0 0 1 17.67 52.36l-.01 69.29zM93.99 235.4c32.43-.47 46.16-19.97 49.29-30.47 2.46-10.05 2.05-16.41 2.05-27.4-9.67-2.32-23.59-4.85-39.56-4.87-15.15-1.14-42.82 5.63-41.74 32.26-1.24 16.79 11.12 31.4 29.96 30.48zm170.92 23.05c-7.86.72-11.52-4.86-12.68-10.37l-49.8-164.65c-.97-2.78-1.61-5.65-1.92-8.58a4.61 4.61 0 0 1 3.86-5.25c.24-.04-2.13 0 22.25 0 8.78-.88 11.64 6.03 12.55 10.37l35.72 140.83 33.16-140.83c.53-3.22 2.94-11.07 12.8-10.24h17.16c2.17-.18 11.11-.5 12.68 10.37l33.42 142.63L420.98 80.1c.48-2.18 2.72-11.37 12.68-10.37h19.72c.85-.13 6.15-.81 5.25 8.58-.43 1.85 3.41-10.66-52.75 169.9-1.15 5.51-4.82 11.09-12.68 10.37h-18.69c-10.94 1.15-12.51-9.66-12.68-10.75L328.67 110.7l-32.78 136.99c-.16 1.09-1.73 11.9-12.68 10.75h-18.3zm273.48 5.63c-5.88.01-33.92-.3-57.36-12.29a12.802 12.802 0 0 1-7.81-11.91v-10.75c0-8.45 6.2-6.9 8.83-5.89 10.04 4.06 16.48 7.14 28.81 9.6 36.65 7.53 52.77-2.3 56.72-4.48 13.15-7.81 14.19-25.68 5.25-34.95-10.48-8.79-15.48-9.12-53.13-21-4.64-1.29-43.7-13.61-43.79-52.36-.61-28.24 25.05-56.18 69.52-55.95 12.67-.01 46.43 4.13 55.57 15.62 1.35 2.09 2.02 4.55 1.92 7.04v10.11c0 4.44-1.62 6.66-4.87 6.66-7.71-.86-21.39-11.17-49.16-10.75-6.89-.36-39.89.91-38.41 24.97-.43 18.96 26.61 26.07 29.7 26.89 36.46 10.97 48.65 12.79 63.12 29.58 17.14 22.25 7.9 48.3 4.35 55.44-19.08 37.49-68.42 34.44-69.26 34.42zm40.2 104.86c-70.03 51.72-171.69 79.25-258.49 79.25A469.127 469.127 0 0 1 2.83 327.46c-6.53-5.89-.77-13.96 7.17-9.47a637.37 637.37 0 0 0 316.88 84.12 630.22 630.22 0 0 0 241.59-49.55c11.78-5 21.77 7.8 10.12 16.38zm29.19-33.29c-8.96-11.52-59.28-5.38-81.81-2.69-6.79.77-7.94-5.12-1.79-9.47 40.07-28.17 105.88-20.1 113.44-10.63 7.55 9.47-2.05 75.41-39.56 106.91-5.76 4.87-11.27 2.3-8.71-4.1 8.44-21.25 27.39-68.49 18.43-80.02z";

const BRAND_ICONS: Record<string, SimpleIcon> = {
  docker: siDocker,
  kubernetes: siKubernetes,
  linux: siLinux,
  terraform: siTerraform,
  git: siGit,
  cicd: siGithubactions,
  observability: siPrometheus,
  monitoring: siGrafana,
  "platform-engineering": siArgo,
  networking: siWireshark,
  rag: siQdrant,
  agents: siLangchain,
  "prompt-engineering": siAnthropic,
  "model-serving": siFastapi,
  "model-tracking": siMlflow,
  python: siPython,
  "llm-fundamentals": siHuggingface,
  llmops: siOllama,
  "ml-pipelines": siApacheairflow,
};

export function ToolIcon({
  name,
  className = "size-6",
  color,
}: {
  name: string;
  className?: string;
  color?: string;
}) {
  if (name === "aws") {
    return (
      <svg viewBox="0 0 640 512" fill={color ?? "currentColor"} className={className} role="img" aria-label="Amazon Web Services">
        <path d={AWS_PATH} />
      </svg>
    );
  }

  const brand = BRAND_ICONS[name];
  if (brand) {
    return (
      <svg viewBox="0 0 24 24" fill={color ?? `#${brand.hex}`} className={className} role="img" aria-label={brand.title}>
        <path d={brand.path} />
      </svg>
    );
  }

  // No brand mark for this slug — fall back to the thematic stroke icon.
  return <StrokeIcon name={name} className={className} color={color} />;
}

function StrokeIcon({
  name,
  className,
  color,
}: {
  name: string;
  className: string;
  color?: string;
}) {
  const strokeProps = {
    fill: "none",
    stroke: color ?? "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "kubernetes":
      return (
        <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
          <circle cx="12" cy="12" r="9" />
          <polygon points="12 3 19.8 7.5 19.8 16.5 12 21 4.2 16.5 4.2 7.5" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "linux":
      return (
        <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      );
    case "terraform":
      return (
        <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polygon points="2 17 12 22 22 17" />
          <polygon points="2 12 12 17 22 12" />
        </svg>
      );
    case "git":
      return (
        <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
          <circle cx="6" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
          <circle cx="18" cy="6" r="3" />
          <path d="M6 9v6" />
          <path d="M18 9a9 9 0 0 1-9 9" />
        </svg>
      );
    case "cicd":
      return (
        <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
          <path d="M16 8h4" />
          <path d="M18 6v4" />
        </svg>
      );
    case "observability":
      return (
        <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
          <path d="M12 20v-6" />
          <path d="M6 20V10" />
          <path d="M18 20V4" />
          <path d="m3 7 4-4 4 4 4-4 4 4" />
        </svg>
      );
    case "platform-engineering":
      return (
        <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    case "networking":
      return (
        <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "rag":
      return (
        <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
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
        <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v4" />
          <line x1="8" y1="16" x2="8" y2="16.01" />
          <line x1="16" y1="16" x2="16" y2="16.01" />
        </svg>
      );
    case "prompt-engineering":
      return (
        <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
        </svg>
      );
    case "model-serving":
      return (
        <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
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
        <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      );
    case "docker":
      return (
        <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
          <rect x="2" y="8" width="20" height="11" rx="2" />
          <path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
          <line x1="6" y1="12" x2="6" y2="15" />
          <line x1="10" y1="12" x2="10" y2="15" />
          <line x1="14" y1="12" x2="14" y2="15" />
          <line x1="18" y1="12" x2="18" y2="15" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} {...strokeProps}>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polygon points="2 17 12 22 22 17" />
          <polygon points="2 12 12 17 22 12" />
        </svg>
      );
  }
}

export type ToolIconProps = SVGProps<SVGSVGElement>;
