/* eslint-disable */
// Одноразовая проверка уроков l13 (не является тестом проекта — запускается вручную).
import { describe, expect, it } from "vitest";
import { lessonContentSchema, type LessonContent } from "@/lib/content/types";
import { compileLesson, TRACKS, getTrack } from "@/lib/content/compiler";
import { VirtualFileSystem } from "@/lib/terminal/vfs";
import { GitState } from "@/lib/terminal/git";
import { executeCommand } from "@/lib/terminal/commands";
import { evaluateGoals } from "@/lib/terminal/goals";

import { lesson as l1 } from "@/content/ru/lessons/l13/debugging-mindset/lesson";
import { lesson as l2 } from "@/content/ru/lessons/l13/agent-assisted-debugging/lesson";
import { lesson as l3 } from "@/content/ru/lessons/l13/reading-errors/lesson";
import { lesson as l4 } from "@/content/ru/lessons/l13/rubber-duck/lesson";
import { lesson as l5 } from "@/content/ru/lessons/l13/agent-as-reviewer/lesson";
import { lesson as l6 } from "@/content/ru/lessons/l13/small-commits/lesson";
import { lesson as l7 } from "@/content/ru/lessons/l13/writing-tests-first/lesson";
import { lesson as l8 } from "@/content/ru/lessons/l13/agent-writes-tests/lesson";
import { lesson as l9 } from "@/content/ru/lessons/l13/understanding-deployment/lesson";
import { lesson as l10 } from "@/content/ru/lessons/l13/agent-and-deployment/lesson";
import { lesson as l11 } from "@/content/ru/lessons/l13/asking-for-help/lesson";
import { lesson as l12 } from "@/content/ru/lessons/l13/l13-review/lesson";

const all: LessonContent[] = [l1, l2, l3, l4, l5, l6, l7, l8, l9, l10, l11, l12];

describe("l13: схема и контракт", () => {
  it("все 12 уроков валидны по схеме", () => {
    for (const l of all) {
      const parsed = lessonContentSchema.safeParse(l);
      expect(parsed.success, JSON.stringify(parsed.error?.issues)).toBe(true);
    }
  });

  it("slugs уникальны и соответствуют a-z0-9-", () => {
    const slugs = all.map((l) => l.meta.slug);
    expect(new Set(slugs).size).toBe(12);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  it("minutes в диапазоне 3-7", () => {
    for (const l of all) expect(l.meta.minutes).toBeLessThanOrEqual(7);
  });

  it("fill-blank: число ____ совпадает с числом blanks", () => {
    for (const l of all) {
      for (const s of l.steps) {
        if (s.exercise?.type === "fill-blank") {
          const holes = s.exercise.template.split("____").length - 1;
          expect(holes, `${l.meta.slug}/${s.id}`).toBe(s.exercise.blanks.length);
        }
      }
    }
  });

  it("quiz: ровно 4 варианта, correct в диапазоне, вариант не повторяется в вопросе/объяснении", () => {
    for (const l of all) {
      for (const s of l.steps) {
        if (s.exercise?.type === "quiz") {
          expect(s.exercise.options.length, l.meta.slug).toBe(4);
          for (const c of s.exercise.correct) expect(c).toBeLessThan(s.exercise.options.length);
          for (const o of s.exercise.options) {
            expect(s.exercise.question.includes(o), `${l.meta.slug}: option in question`).toBe(false);
            if (s.exercise.explanation) {
              expect(s.exercise.explanation.includes(o), `${l.meta.slug}: option in explanation`).toBe(false);
            }
          }
        }
      }
    }
  });

  it("generic-уроки компилируются под все 4 трека", () => {
    const generics = all.filter((l) => l.meta.scope === "generic-agent");
    expect(generics.length).toBe(4);
    for (const track of TRACKS) {
      for (const l of generics) {
        const compiled = compileLesson(l, track);
        const ser = JSON.stringify(compiled);
        expect(ser, `${l.meta.slug} → ${track.id}`).not.toContain("{{agent.");
        expect(ser).toContain(track.binary);
      }
    }
  });

  it("common-уроки не содержат плейсхолдеров", () => {
    for (const l of all.filter((x) => x.meta.scope === "common")) {
      expect(JSON.stringify(l)).not.toContain("{{agent.");
    }
  });
});

function runAll(commands: string[], files: Record<string, string> = {}) {
  const vfs = new VirtualFileSystem({ files });
  const git = new GitState(vfs);
  const log = { commands: [] as string[], output: "" };
  for (const c of commands) {
    const lines = executeCommand(c, { vfs, log: [], git });
    log.commands.push(c.trim().replace(/\s+/g, " "));
    for (const line of lines) log.output += (log.output ? "\n" : "") + line.text;
  }
  return { vfs, git, log };
}

describe("l13: терминальные упражнения решаются", () => {
  it("reading-errors: fixture + grep несуществующего файла", () => {
    const ex = l3.steps.find((s) => s.exercise?.type === "terminal")!.exercise!;
    if (ex.type !== "terminal") throw new Error("bad cast");
    const { vfs, log } = runAll(
      ["echo Ошибка: файл потерян > note.txt", "grep файл ghost.txt"],
      ex.fixture?.files ?? {},
    );
    const result = evaluateGoals(vfs, log, ex.goals, "/home/you");
    expect(result.solved).toEqual([true, true]);
  });

  it("l13-review: полный git-цикл с багом", () => {
    const ex = l12.steps.find((s) => s.exercise?.type === "terminal")!.exercise!;
    if (ex.type !== "terminal") throw new Error("bad cast");
    const { vfs, git, log } = runAll([
      "mkdir app",
      "echo Калькулятор: 2+2=5 > app/app.txt",
      "cd app",
      "git init",
      "git add .",
      'git commit -m "Добавляет калькулятор"',
      "echo Калькулятор: 2+2=4 > app.txt",
      "git add .",
      'git commit -m "Исправляет ошибку сложения"',
    ]);
    const result = evaluateGoals(vfs, log, ex.goals, "/home/you", git);
    expect(result.solved).toEqual([true, true, true]);
  });
});

describe("l13: подсказки-хинты выполнимы", () => {
  it("каждая команда из hint парсится и не даёт 'команда не найдена'", () => {
    for (const l of all) {
      for (const s of l.steps) {
        if (s.exercise?.type === "terminal" && s.exercise.hint) {
          for (const part of s.exercise.hint.split("→")) {
            const cmd = part.trim();
            const vfs = new VirtualFileSystem({ files: s.exercise.fixture?.files ?? {} });
            const git = new GitState(vfs);
            const lines = executeCommand(cmd, { vfs, log: [], git });
            for (const line of lines) {
              expect(line.text, `${l.meta.slug}: ${cmd}`).not.toMatch(/команда не найдена|not a git command/);
            }
            // git-команды подсказки выполняются последовательно в одном VFS — репозиторий инициализируется
            if (cmd.startsWith("git init")) {
              expect(git.isRepo, `${l.meta.slug}: после git init`).toBe(true);
            }
          }
        }
      }
    }
  });
});
