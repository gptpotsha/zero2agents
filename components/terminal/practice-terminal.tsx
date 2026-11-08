"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { QuickKeysBar } from "@/components/terminal/quick-keys-bar";
import { Button } from "@/components/ui/button";
import { VirtualFileSystem, displayPath } from "@/lib/terminal/vfs";
import { GitState } from "@/lib/terminal/git";
import { executeCommand } from "@/lib/terminal/commands";
import type { Fixture } from "@/lib/content/types";

/** Песочница по умолчанию — та же структура, что в уроках оригинала. */
const DEFAULT_FIXTURE: Fixture = {
  files: {
    "/home/you/documents/notes.txt": "Идеи:\n- выучить терминал\n- построить проект с AI-агентом",
    "/home/you/photos/vacation.jpg": "(бинарный файл — просмотр недоступен)",
    "/home/you/projects/website/index.html": "<html>\n  <body>\n    <h1>Мой первый сайт</h1>\n  </body>\n</html>",
  },
};

const QUICK_TIPS: { cmd: string; label: string }[] = [
  { cmd: "ls", label: "Список файлов и папок" },
  { cmd: "pwd", label: "Показать текущую папку" },
  { cmd: "mkdir имя", label: "Создать папку" },
  { cmd: "touch файл.txt", label: "Создать файл" },
  { cmd: "cat файл.txt", label: "Прочитать файл" },
  { cmd: "cd папка", label: "Перейти в папку" },
  { cmd: "rm файл.txt", label: "Удалить файл" },
  { cmd: "clear", label: "Очистить вывод" },
];

/**
 * Свободная песочница: терминал без целей и проверок.
 * Реюз VirtualFileSystem + executeCommand из движка уроков.
 */
export function PracticeTerminal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const vfsRef = useRef<VirtualFileSystem | null>(null);
  const gitRef = useRef<GitState | null>(null);
  const lineRef = useRef("");
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef(-1);
  const onDataRef = useRef<((data: string) => void) | null>(null);

  const [attempt, setAttempt] = useState(0);
  const [commandCount, setCommandCount] = useState(0);

  const printPrompt = useCallback(() => {
    const term = termRef.current;
    if (!term || !vfsRef.current) return;
    const cwd = displayPath(vfsRef.current.cwd);
    term.write(`\r\n\x1b[1;32myou\x1b[0m@practice:\x1b[1;34m${cwd}\x1b[0m$ `);
  }, []);

  const submitLine = useCallback(() => {
    const term = termRef.current;
    const vfs = vfsRef.current;
    if (!term || !vfs) return;
    const raw = lineRef.current;
    lineRef.current = "";
    term.write("\r\n");
    if (raw.trim() === "") {
      printPrompt();
      return;
    }
    historyRef.current.push(raw);
    historyIdxRef.current = -1;
    const command = raw.trim();
    if (command.split(/\s+/)[0] === "clear") {
      term.clear();
      term.write("\r\n");
      printPrompt();
      setCommandCount((c) => c + 1);
      return;
    }
    const lines = executeCommand(command, { vfs, log: [], git: gitRef.current ?? undefined });
    for (const line of lines) {
      if (line.tone === "err") term.writeln(`\x1b[31m${line.text}\x1b[0m`);
      else term.writeln(line.text);
    }
    printPrompt();
    setCommandCount((c) => c + 1);
  }, [printPrompt]);

  const insertIntoLine = useCallback((text: string) => {
    const term = termRef.current;
    if (!term) return;
    term.write(text);
    lineRef.current += text;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const term = new Terminal({
      convertEol: true,
      cursorBlink: true,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
      fontSize: 14,
      theme: {
        background: "#0d1117",
        foreground: "#e6edf3",
        cursor: "#58a6ff",
        selectionBackground: "#1f6feb55",
      },
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(containerRef.current);
    fit.fit();
    termRef.current = term;
    fitRef.current = fit;

    vfsRef.current = new VirtualFileSystem(DEFAULT_FIXTURE);
    gitRef.current = new GitState(vfsRef.current);
    lineRef.current = "";
    historyRef.current = [];
    historyIdxRef.current = -1;

    term.writeln("\x1b[1mПесочница терминала\x1b[0m — командуй свободно, ничего сломать нельзя.");
    term.writeln("Набери \x1b[1mhelp\x1b[0m, чтобы увидеть все команды.");

    const onData = (data: string) => {
      const t = termRef.current;
      if (!t) return;
      if (data === "\r") {
        submitLine();
        return;
      }
      if (data === "\x7f") {
        if (lineRef.current.length > 0) {
          lineRef.current = lineRef.current.slice(0, -1);
          t.write("\b \b");
        }
        return;
      }
      if (data === "\x03") {
        lineRef.current = "";
        t.write("\r\n");
        printPrompt();
        return;
      }
      if (data === "\x1b[A" || data === "\x1b[B") {
        const history = historyRef.current;
        if (history.length === 0) return;
        let nextIdx: number;
        if (data === "\x1b[A") {
          nextIdx = historyIdxRef.current === -1 ? history.length - 1 : Math.max(0, historyIdxRef.current - 1);
        } else {
          nextIdx = historyIdxRef.current + 1;
          if (nextIdx >= history.length) {
            historyIdxRef.current = history.length;
            while (lineRef.current.length > 0) {
              lineRef.current = lineRef.current.slice(0, -1);
              t.write("\b \b");
            }
            return;
          }
        }
        historyIdxRef.current = nextIdx;
        while (lineRef.current.length > 0) {
          lineRef.current = lineRef.current.slice(0, -1);
          t.write("\b \b");
        }
        lineRef.current = history[nextIdx];
        t.write(lineRef.current);
        return;
      }
      if (data.charCodeAt(0) < 32 && data !== "\t") return;
      lineRef.current += data;
      t.write(data);
    };
    onDataRef.current = onData;
    term.onData(onData);

    const observer = new ResizeObserver(() => fitRef.current?.fit());
    observer.observe(containerRef.current);
    printPrompt();

    return () => {
      onDataRef.current = null;
      observer.disconnect();
      term.dispose();
      termRef.current = null;
      fitRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const handleQuickKey = (key: string) => {
    if (termRef.current) {
      termRef.current.focus();
      onDataRef.current?.(key);
    }
  };

  const reset = () => setAttempt((a) => a + 1);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Выполнено команд: <span className="font-mono font-medium text-foreground">{commandCount}</span>
          </p>
          <Button variant="outline" size="sm" onClick={reset}>
            Сбросить среду
          </Button>
        </div>
        <QuickKeysBar onKeyPress={handleQuickKey} />
        <div ref={containerRef} className="h-[420px] overflow-hidden rounded-lg" aria-label="Песочница терминала" />
      </div>

      <aside className="rounded-lg border p-4">
        <h2 className="text-sm font-semibold">Быстрые подсказки</h2>
        <p className="mt-1 text-xs text-muted-foreground">Кликни — команда напечатается в терминале. Enter — выполнить.</p>
        <ul className="mt-3 space-y-2">
          {QUICK_TIPS.map((tip) => (
            <li key={tip.cmd}>
              <button
                type="button"
                onClick={() => insertIntoLine(tip.cmd + " ")}
                className="w-full rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted"
              >
                <span className="font-mono font-medium text-primary">{tip.cmd}</span>
                <span className="mt-0.5 block text-muted-foreground">{tip.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
