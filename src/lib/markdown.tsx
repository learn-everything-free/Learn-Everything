import type { ReactNode } from "react";

// A small markdown renderer — no dependency, and no dangerouslySetInnerHTML, so
// a model can never inject markup into the page. Supports the subset a chat
// model actually produces: headings, emphasis, inline and fenced code, lists,
// quotes, rules and links.

function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`|\[[^\]]+\]\((https?:\/\/[^\s)]+)\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-i${i++}`;
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-medium text-ink">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="border border-ink/25 bg-warm-taupe px-1.5 py-0.5 font-mono text-[0.85em] text-graphite"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("[")) {
      const label = token.slice(1, token.indexOf("]"));
      const href = token.slice(token.indexOf("(") + 1, -1);
      nodes.push(
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="text-[#2563eb] underline underline-offset-2"
        >
          {label}
        </a>,
      );
    } else {
      nodes.push(
        <em key={key} className="italic text-graphite">
          {token.slice(1, -1)}
        </em>,
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trimStart().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        body.push(lines[i]);
        i++;
      }
      i++; // closing fence
      blocks.push(
        <CodeBlock key={`b${key++}`} language={lang} code={body.join("\n")} />,
      );
      continue;
    }

    // Heading
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const size =
        level <= 2 ? "text-heading-sm" : level === 3 ? "text-body" : "text-body-sm";
      blocks.push(
        <p
          key={`b${key++}`}
          className={`${size} mt-5 font-medium tracking-tight text-ink first:mt-0`}
        >
          {inline(heading[2], `h${key}`)}
        </p>,
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      blocks.push(<hr key={`b${key++}`} className="my-5 border-ink/20" />);
      i++;
      continue;
    }

    // Blockquote
    if (line.trimStart().startsWith(">")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith(">")) {
        quote.push(lines[i].trimStart().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote
          key={`b${key++}`}
          className="border-l-2 border-ink/40 pl-4 text-body-sm italic text-smoke"
        >
          {inline(quote.join(" "), `q${key}`)}
        </blockquote>,
      );
      continue;
    }

    // Lists
    if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*+]|\d+\.)\s+/, ""));
        i++;
      }
      const List = ordered ? "ol" : "ul";
      blocks.push(
        <List
          key={`b${key++}`}
          className={`my-4 space-y-1.5 pl-5 text-body-sm text-graphite ${
            ordered ? "list-decimal" : "list-disc"
          }`}
        >
          {items.map((item, idx) => (
            <li key={idx}>{inline(item, `l${key}-${idx}`)}</li>
          ))}
        </List>,
      );
      continue;
    }

    // Blank line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Paragraph
    const paragraph: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trimStart().startsWith("```") &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^\s*([-*+]|\d+\.)\s+/.test(lines[i]) &&
      !lines[i].trimStart().startsWith(">")
    ) {
      paragraph.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={`b${key++}`} className="my-3 text-body-sm leading-relaxed text-graphite first:mt-0">
        {inline(paragraph.join(" "), `p${key}`)}
      </p>,
    );
  }

  return <div className="space-y-1">{blocks}</div>;
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  return (
    <div className="my-4 border border-ink/70 bg-[#121417]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-ash">
          {language || "shell"}
        </span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[13px] leading-relaxed text-[#edece0]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(text).catch(() => {});
      }}
      className="font-mono text-[10px] uppercase tracking-wider text-ash transition-colors hover:text-[#edece0]"
    >
      {label}
    </button>
  );
}
