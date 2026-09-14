import { VirtualFileSystem } from "./vfs";
import { GitState } from "./git";
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

/** Переоценивает все цели по текущему состоянию VFS/Git и логу команд. */
export function evaluateGoals(
  vfs: VirtualFileSystem,
  log: SessionLog,
  goals: TerminalGoal[],
  baseCwd: string,
  git?: GitState,
): GoalEval {
  const gitState = git ?? new GitState(vfs);
  const solved = goals.map((goal) => isGoalSolved(vfs, log, goal, baseCwd, gitState));
  return { solved, done: solved.every(Boolean) };
}

function isGoalSolved(
  vfs: VirtualFileSystem,
  log: SessionLog,
  goal: TerminalGoal,
  baseCwd: string,
  git: GitState,
): boolean {
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
    case "git": {
      switch (goal.state) {
        case "repo":
          return git.isRepo;
        case "clean":
          return git.isRepo && git.isClean();
        case "committed":
          return git.isRepo && git.isClean() && git.commitCount > 0;
        case "has-commits":
          return git.isRepo && git.commitCount >= 1;
        case "message":
          return git.isRepo && git.lastCommitMessage() === goal.message;
      }
      return false;
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
    case "git": {
      switch (goal.state) {
        case "repo":
          return "инициализировать git-репозиторий (git init)";
        case "clean":
          return "рабочее дерево чистое — всё закоммичено";
        case "committed":
          return "сделать коммит (git add + git commit -m)";
        case "has-commits":
          return "сделать хотя бы один коммит";
        case "message":
          return `сделать коммит с сообщением «${goal.message}»`;
      }
      return "git-цель";
    }
  }
}

/**
 * Мягкая подсказка: список незакрытых целей. Показывается UI-ом,
 * когда ученик несколько команд подряд не двигает прогресс.
 */
export function pendingGoalHints(goals: TerminalGoal[], solved: boolean[]): string[] {
  return goals
    .map((g, i) => (solved[i] ? null : goalHint(g)))
    .filter((h): h is string => h !== null);
}
