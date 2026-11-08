"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { QuickKeysBar } from "@/components/terminal/quick-keys-bar";
import { Button } from "@/components/ui/button";
import { VirtualFileSystem, displayPath, HOME } from "@/lib/terminal/vfs";
import { GitState } from "@/lib/terminal/git";
import { executeCommand } from "@/lib/terminal/commands";
import { evaluateGoals, pendingGoalHints, goalHint, type GoalEval } from "@/lib/terminal/goals";
import type { terminalExerciseSchema } from "@/lib/content/types";
import type { z } from "zod";

type TerminalExercise = z.infer<typeof terminalExerciseSchema>;

const normalizeCmd = (s: string) => s.trim().replace(/\s+/g, " ");

export function TerminalExercise({
  exercise,
  onSolved,
}: {
  exercise: TerminalExercise;
  onSolved: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);

  // Внутреннее состояние тренажёра живёт в ref'ах (не перерисовывает xterm).
  const vfsRef = useRef<VirtualFileSystem | null>(null);
  const logRef = useRef<{ commands: string[]; output: string }>({ commands: [], output: "" });
  const lineRef = useRef("");
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef(-1);
  const doneRef = useRef(false);
  const onDataRef = useRef<((data: string) => void) | null>(null);

  const [attempt, setAttempt] = useState(0);
  const [solved, setSolved] = useState(false);
  const [progress, setProgress] = useState<boolean[]>(() => exercise.goals.map(() => false));

  const baseCwdRef = useRef(HOME);
  const gitRef = useRef<GitState | null>(null);
  const lastProgressRef = useRef(0);
  const noProgressRef = useRef(0);

  const printPrompt = useCallback(() => {
    const term = termRef.current;
    if (!term || !vfsRef.current) return;
    const cwd = displayPath(vfsRef.current.cwd);
    term.write(`\r\n\x1b[1;32myou\x1b[0m@agent:\x1b[1;34m${cwd}\x1b[0m$ `);
  }, []);

  const reEvaluate = useCallback(() => {
    const vfs = vfsRef.current;
    if (!vfs) return;
    const evalResult: GoalEval = evaluateGoals(vfs, logRef.current, exercise.goals, baseCwdRef.current, gitRef.current ?? undefined);
    setProgress(evalResult.solved);

    // Мягкая подсказка: 3 команды подряд без нового прогресса
    const solvedCount = evalResult.solved.filter(Boolean).length;
    if (solvedCount > lastProgressRef.current) {
      lastProgressRef.current = solvedCount;
      noProgressRef.current = 0;
    } else if (!evalResult.done) {
      noProgressRef.current += 1;
      if (noProgressRef.current === 3) {
        const hints = pendingGoalHints(exercise.goals, evalResult.solved);
        termRef.current?.write(
          `\r\n\x1b[33mПодсказка: похоже, что-то не сходится. Осталось:${hints.map((h) => `\r\n  · ${h}`).join("")}\x1b[0m\r\n`,
        );
      }
    }

    if (evalResult.done && !doneRef.current) {
      doneRef.current = true;
      setSolved(true);
      try {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
      } catch {
        // Игнорируем вне TMA
      }
      termRef.current?.write("\r\n\x1b[1;32m✓ Задание выполнено!\x1b[0m\r\n");
      setTimeout(onSolved, 1100);
    }
  }, [exercise.goals, onSolved]);

  const submitLine = useCallback(() => {
    const term = termRef.current;
    const vfs = vfsRef.current;
    if (!term || !vfs || doneRef.current) return;
    const raw = lineRef.current;
    lineRef.current = "";
    historyRef.current.push(raw);
    historyIdxRef.current = -1;
    term.write("\r\n");

    if (raw.trim() === "") {
      printPrompt();
      return;
    }
    const command = raw.trim();
    const lines = executeCommand(command, { vfs, log: [], git: gitRef.current ?? undefined });
    const isClear = command.split(/\s+/)[0] === "clear";
    if (isClear) {
      term.clear();
      term.write("\r\n");
      printPrompt();
      return;
    }
    logRef.current.commands.push(normalizeCmd(command));
    for (const line of lines) {
      if (line.tone === "err") {
        term.writeln(`\x1b[31m${line.text}\x1b[0m`);
      } else {
        term.writeln(line.text);
      }
      logRef.current.output += (logRef.current.output ? "\n" : "") + line.text;
    }
    printPrompt();
    reEvaluate();
  }, [printPrompt, reEvaluate]);

  useEffect(() => {
    if (!containerRef.current) return;
    const term = new Terminal({
      convertEol: true,
      cursorBlink: true,
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
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

    // Сброс к чистому состоянию шага.
    const fixture = exercise.fixture;
    const vfs = new VirtualFileSystem(fixture);
    vfsRef.current = vfs;
    gitRef.current = new GitState(vfs);
    baseCwdRef.current = vfs.cwd;
    logRef.current = { commands: [], output: "" };
    lastProgressRef.current = 0;
    noProgressRef.current = 0;
    doneRef.current = false;
    lineRef.current = "";
    historyRef.current = [];
    historyIdxRef.current = -1;

    term.writeln("Виртуальный терминал · введи команду и нажми Enter. Для подсказки набери help");
    term.write("\r\n");

    const onData = (data: string) => {
      const termInstance = termRef.current;
      if (!termInstance || doneRef.current) return;
      if (data === "\r") {
        submitLine();
        return;
      }
      if (data === "\x7f") {
        if (lineRef.current.length > 0) {
          lineRef.current = lineRef.current.slice(0, -1);
          termInstance.write("\b \b");
        }
        return;
      }
      if (data === "\x03") {
        // Ctrl+C
        lineRef.current = "";
        termInstance.write("\r\n");
        printPrompt();
        return;
      }
      if (data === "\x1b[A") {
        // ↑ — история
        const history = historyRef.current;
        if (history.length === 0) return;
        const nextIdx =
          historyIdxRef.current === -1 ? history.length - 1 : Math.max(0, historyIdxRef.current - 1);
        historyIdxRef.current = nextIdx;
        const prev = lineRef.current;
        while (lineRef.current.length > 0) {
          lineRef.current = lineRef.current.slice(0, -1);
          termInstance.write("\b \b");
        }
        lineRef.current = history[nextIdx];
        termInstance.write(lineRef.current);
        void prev;
        return;
      }
      if (data === "\x1b[B") {
        const history = historyRef.current;
        const nextIdx = historyIdxRef.current + 1;
        if (nextIdx >= history.length) {
          historyIdxRef.current = history.length;
          while (lineRef.current.length > 0) {
            lineRef.current = lineRef.current.slice(0, -1);
            termInstance.write("\b \b");
          }
          return;
        }
        historyIdxRef.current = nextIdx;
        while (lineRef.current.length > 0) {
          lineRef.current = lineRef.current.slice(0, -1);
          termInstance.write("\b \b");
        }
        lineRef.current = history[nextIdx];
        termInstance.write(lineRef.current);
        return;
      }
      // Прочие управляющие последовательности игнорируем.
      if (data.charCodeAt(0) < 32 && data !== "\t") return;
      lineRef.current += data;
      termInstance.write(data);
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
  }, [attempt, exercise]);

  const handleQuickKey = (key: string) => {
    if (termRef.current && !doneRef.current) {
      termRef.current.focus();
      onDataRef.current?.(key);
    }
  };

  const reset = () => {
    setSolved(false);
    setProgress(exercise.goals.map(() => false));
    setAttempt((a) => a + 1);
  };

  const pending = progress.filter((p) => !p);

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-muted/40 p-4">
        <p className="text-sm font-medium">{exercise.task}</p>
        {exercise.hint && <p className="mt-1 text-sm text-muted-foreground">Подсказка: {exercise.hint}</p>}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5 text-xs">
          {exercise.goals.map((goal, i) => (
            <span
              key={i}
              title={goalHint(goal)}
              className={`rounded-full border px-2 py-0.5 ${
                progress[i] ? "border-green-600/40 text-green-600" : "border-border text-muted-foreground"
              }`}
            >
              {progress[i] ? "✓" : "○"}
            </span>
          ))}
          {pending.length > 0 && (
            <span className="self-center text-muted-foreground">
              осталось: {pending.length}
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={reset} disabled={solved}>
          Сбросить
        </Button>
      </div>

      {/* Панель быстрых мобильных клавиш */}
      <QuickKeysBar onKeyPress={handleQuickKey} />

      <div ref={containerRef} className="h-[340px] overflow-hidden rounded-lg" aria-label="Терминал-тренажёр" />
      {solved && (
        <p className="text-sm font-medium text-green-600 dark:text-green-400">
          Готово! Переходим дальше…
        </p>
      )}
    </div>
  );
}
