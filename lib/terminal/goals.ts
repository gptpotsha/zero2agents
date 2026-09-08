import { VirtualFileSystem } from "./vfs";
import type { TerminalGoal } from "@/lib/content/types";

export interface SessionLog {
  /** Нормализованные команды в порядке ввода. */
  commands: string[];
  /** Весь вывод (для целей kind:"output"). */
  output: string;
}

export interface GoalEval {
  solved: boolean[];
  done: boolean;
}

const normalize = (s: string) => s.trim().replace(/\s+/g, " ");

/** Переоценивает все цели по текущему состоянию VFS и логу команд. */
export function evaluateGoals(
  vfs: VirtualFileSystem,
  log: SessionLog,
  goals: TerminalGoal[],
  baseCwd: string,
): GoalEval {
  const solved = goals.map((goal) => isGoalSolved(vfs, log, goal, baseCwd));
  return { solved, done: solved.every(Boolean) };
}

function isGoalSolved(vfs: VirtualFileSystem, log: SessionLog, goal: TerminalGoal, baseCwd: string): boolean {
  switch (goal.kind) {
    case "run":
      return log.commands.includes(normalize(goal.match));
    case "output":
      return log.output.includes(goal.contains);
    case "fs": {
      const a = goal.assert;
      const path = a.path.startsWith("/") ? a.path : `${baseCwd}/${a.path}`;
      const node = vfs.resolveToNode(path);
      if (a.exists === false) return node === null;
      if (!node) return false;
      if (a.isDir === true && node.kind !== "dir") return false;
      if (a.isDir === false && node.kind !== "file") return false;
      if (a.contains) {
        if (node.kind !== "file") return false;
        if (!node.content.includes(a.contains)) return false;
      }
      return true;
    }
  }
}

/** Человекочитаемое описание цели — для подсказок. */
export function goalHint(goal: TerminalGoal): string {
  switch (goal.kind) {
    case "run":
      return `выполнить команду: ${goal.match}`;
    case "output":
      return `добиться вывода, содержащего «${goal.contains}»`;
    case "fs": {
      const a = goal.assert;
      const action = a.exists === false ? "удалить" : a.isDir ? "создать папку" : "создать файл";
      return `${action}: ${a.path}`;
    }
  }
}
