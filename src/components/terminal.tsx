"use client";

import "@xterm/xterm/css/xterm.css";
import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import type { LabShell } from "@/lib/shell";

const PROMPT_USER = "\x1b[38;2;252;170;45mlearner@lab\x1b[0m";
const PROMPT_PATH = "\x1b[38;2;117;117;111m";

export function LabTerminal({ shell }: { shell: LabShell }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = new Terminal({
      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      fontSize: 13,
      lineHeight: 1.2,
      convertEol: true,
      cursorBlink: true,
      allowProposedApi: true,
      theme: {
        background: "#191918",
        foreground: "#edece0",
        cursor: "#fcaa2d",
        cursorAccent: "#191918",
        selectionBackground: "#75756f88",
        black: "#191918",
        brightBlack: "#75756f",
      },
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(hostRef.current!);
    try {
      fit.fit();
    } catch {
      /* container not measured yet */
    }

    term.writeln("Lab environment · disposable session");
    term.writeln("Type \x1b[38;2;252;170;45mhelp\x1b[0m for available commands.");
    term.writeln("");

    const prompt = () => {
      const path = "/" + shell.cwd.join("/") || "/";
      term.write(`\r\n${PROMPT_USER}:${PROMPT_PATH}${path.replace(/^\/home\/learner/, "~")}\x1b[0m$ `);
    };
    prompt();

    let line = "";
    const print = (lines: string[]) => {
      for (const out of lines) {
        if (out === "__CLEAR__") {
          term.clear();
          term.write("\x1b[2J\x1b[H");
          continue;
        }
        term.writeln(out);
      }
    };

    const disposable = term.onData((data) => {
      for (const ch of data) {
        if (ch === "\r") {
          const submitted = line;
          line = "";
          const out = shell.run(submitted);
          if (out.length) term.write("\r\n");
          print(out);
          prompt();
        } else if (ch === "\x7f") {
          if (line.length) {
            line = line.slice(0, -1);
            term.write("\b \b");
          }
        } else if (ch >= " ") {
          line += ch;
          term.write(ch);
        }
      }
    });

    const observer = new ResizeObserver(() => {
      try {
        fit.fit();
      } catch {
        /* ignore */
      }
    });
    observer.observe(hostRef.current!);

    return () => {
      disposable.dispose();
      observer.disconnect();
      term.dispose();
    };
  }, [shell]);

  return <div ref={hostRef} className="h-[420px] w-full lg:h-[520px]" />;
}
