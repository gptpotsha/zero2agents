import { describe, expect, it } from "vitest";
import { VirtualFileSystem, displayPath, HOME } from "@/lib/terminal/vfs";
import { parseShell, executeCommand } from "@/lib/terminal/commands";
import { evaluateGoals, type SessionLog } from "@/lib/terminal/goals";
import type { TerminalGoal } from "@/lib/content/types";

const makeLog = (commands: string[], output = ""): SessionLog => ({ commands, output });

describe("виртуальная файловая система", () => {
  it("создаёт файлы и папки из фикстуры", () => {
    const vfs = new VirtualFileSystem({ files: { "/home/you/project/readme.md": "# hi" } });
    expect(vfs.lookupFile("/home/you/project/readme.md")?.content).toBe("# hi");
    expect(vfs.lookupDir("/home/you/project")).not.toBeNull();
  });

  it("нормализует пути: ., .. и ~", () => {
    const vfs = new VirtualFileSystem({ cwd: "/home/you/project" });
    expect(vfs.normalize(".")).toBe("/home/you/project");
    expect(vfs.normalize("..")).toBe("/home/you");
    expect(vfs.normalize("~")).toBe(HOME);
    expect(vfs.normalize("sub/file.txt")).toBe("/home/you/project/sub/file.txt");
  });

  it("mkdir и touch меняют дерево", () => {
    const vfs = new VirtualFileSystem();
    expect(vfs.mkdir("notes").ok).toBe(true);
    expect(vfs.lookupDir("/home/you/notes")).not.toBeNull();
    expect(vfs.mkfile("notes/idea.txt", "текст")).not.toBeNull();
    expect(vfs.lookupFile("/home/you/notes/idea.txt")?.content).toBe("текст");
  });

  it("displayPath показывает ~ для home", () => {
    expect(displayPath(HOME)).toBe("~");
    expect(displayPath(HOME + "/project")).toBe("~/project");
  });
});

describe("команды", () => {
  it("parseShell разбирает кавычки и редирект", () => {
    expect(parseShell('echo "hello world"').argv).toEqual(["echo", "hello world"]);
    expect(parseShell("echo привет > file.txt").redirectFile).toBe("file.txt");
  });

  it("выполняет pwd/ls/cd и возвращает вывод", () => {
    const vfs = new VirtualFileSystem({ files: { "/home/you/a.txt": "1" } });
    const pwd = executeCommand("pwd", { vfs, log: [] });
    expect(pwd[0].text).toBe("~");
    const ls = executeCommand("ls", { vfs, log: [] });
    expect(ls[0].text).toContain("a.txt");
    executeCommand("cd ..", { vfs, log: [] });
    expect(vfs.cwd).toBe("/home");
  });

  it("echo с редиректом создаёт файл", () => {
    const vfs = new VirtualFileSystem();
    executeCommand("echo привет мир > note.txt", { vfs, log: [] });
    expect(vfs.lookupFile("/home/you/note.txt")?.content).toBe("привет мир");
  });

  it("неизвестная команда даёт ошибку", () => {
    const vfs = new VirtualFileSystem();
    const res = executeCommand("foobar", { vfs, log: [] });
    expect(res[0].tone).toBe("err");
    expect(res[0].text).toContain("foobar");
  });
});

describe("цели заданий", () => {
  it("fs-цели закрываются после mkdir и touch", () => {
    const vfs = new VirtualFileSystem();
    const goals: TerminalGoal[] = [
      { kind: "run", match: "mkdir notes" },
      { kind: "fs", assert: { path: "/home/you/notes", exists: true, isDir: true } },
      { kind: "fs", assert: { path: "/home/you/notes/idea.txt", exists: true } },
    ];
    const initial = evaluateGoals(vfs, makeLog([]), goals, vfs.cwd);
    expect(initial.done).toBe(false);

    executeCommand("mkdir notes", { vfs, log: [] });
    executeCommand("touch notes/idea.txt", { vfs, log: [] });
    const after = evaluateGoals(
      vfs,
      makeLog(["mkdir notes", "touch notes/idea.txt"]),
      goals,
      HOME,
    );
    expect(after.solved).toEqual([true, true, true]);
    expect(after.done).toBe(true);
  });

  it("run-цель требует точного совпадения команды", () => {
    const vfs = new VirtualFileSystem();
    const goals: TerminalGoal[] = [{ kind: "run", match: "pwd" }];
    expect(evaluateGoals(vfs, makeLog(["ls"]), goals, vfs.cwd).done).toBe(false);
    expect(evaluateGoals(vfs, makeLog(["pwd"]), goals, vfs.cwd).done).toBe(true);
  });

  it("exists:false закрывается после удаления", () => {
    const vfs = new VirtualFileSystem({ files: { "/home/you/junk.txt": "x" } });
    const goals: TerminalGoal[] = [{ kind: "fs", assert: { path: "/home/you/junk.txt", exists: false } }];
    expect(evaluateGoals(vfs, makeLog([]), goals, HOME).done).toBe(false);
    executeCommand("rm junk.txt", { vfs, log: [] });
    expect(evaluateGoals(vfs, makeLog([]), goals, HOME).done).toBe(true);
  });
});
