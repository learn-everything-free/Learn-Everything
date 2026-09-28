"use client";

import "@xterm/xterm/css/xterm.css";
import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import type { LabShell } from "@/lib/shell";

const PROMPT_USER = "\x1b[38;2;255;71;4mlearner@lab\x1b[0m";
const PROMPT_PATH = "\x1b[38;2;165;159;151m";

export type CommandRunner = (command: string) => void;

export function LabTerminal({
  shell,
  bindRunner,
}: {
  shell: LabShell;
  bindRunner: (runner: CommandRunner) => void;
}) {
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
        cursor: "#ff4704",
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
    // Up/Down recall over the shell's own history (same source the tutor sees).
    let browseIndex = -1;
    let savedLine = "";
    const eraseLine = () => term.write("\b \b".repeat(line.length));
    const recallHistory = (delta: -1 | 1) => {
      const history = shell.history;
      if (!history.length) return;
      if (delta === -1) {
        if (browseIndex === -1) {
          savedLine = line;
          browseIndex = history.length - 1;
        } else if (browseIndex > 0) {
          browseIndex--;
        } else {
          return;
        }
      } else {
        if (browseIndex === -1) return;
        browseIndex++;
        if (browseIndex >= history.length) browseIndex = -1;
      }
      eraseLine();
      line = browseIndex === -1 ? savedLine : history[browseIndex];
      term.write(line);
    };
    const print = (lines: string[]) => {
      for (const out of lines) {
        if (out === "__CLEAR__") {
          term.clear();
          term.write("\x1b[2J\x1b[H");
          continue;
        }
        term.writeln(out.replace(/\n/g, "\r\n"));
      }
    };
    const submit = (submitted: string) => {
      browseIndex = -1;
      const out = shell.run(submitted);
      if (out.length) term.write("\r\n");
      print(out);
      prompt();
    };

    const disposable = term.onData((data) => {
      if (data === "\x1b[A") return recallHistory(-1);
      if (data === "\x1b[B") return recallHistory(1);
      for (const ch of data) {
        if (ch === "\r") {
          const submitted = line;
          line = "";
          submit(submitted);
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

    // Lets walkthrough "Run" buttons type a command into the terminal.
    bindRunner((command) => {
      browseIndex = -1;
      for (const ch of command) {
        line += ch;
        term.write(ch);
      }
      term.write("\r\n");
      const submitted = line;
      line = "";
      submit(submitted);
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
      bindRunner(() => {});
      disposable.dispose();
      observer.disconnect();
      term.dispose();
    };
  }, [shell, bindRunner]);

  return <div ref={hostRef} className="h-[420px] w-full lg:h-[520px]" />;
}
