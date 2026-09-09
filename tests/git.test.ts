import { describe, expect, it } from "vitest";
import { VirtualFileSystem } from "@/lib/terminal/vfs";
import { GitState } from "@/lib/terminal/git";
import { executeCommand } from "@/lib/terminal/commands";
import { evaluateGoals } from "@/lib/terminal/goals";
import type { TerminalGoal } from "@/lib/content/types";

function setup() {
  const vfs = new VirtualFileSystem({ files: { "/home/you/app.js": "console.log(1)" } });
  const git = new GitState(vfs);
  return { vfs, git };
}

describe("GitState", () => {
  it("до init — не репозиторий", () => {
    const { git } = setup();
    expect(git.isRepo).toBe(false);
    const res = git.commit("x");
    expect(res.ok).toBe(false);
    expect(res.message).toContain("not a git repository");
  });

  it("init → статус показывает untracked", () => {
    const { git } = setup();
    git.init();
    const status = git.status().join("\n");
    expect(status).toContain("On branch main");
    expect(status).toContain("No commits yet");
    expect(status).toContain("app.js");
  });

  it("add + commit → чистое дерево", () => {
    const { git } = setup();
    git.init();
    expect(git.add("app.js").ok).toBe(true);
    const statusStaged = git.status().join("\n");
    expect(statusStaged).toContain("new file:   app.js");
    const res = git.commit("первый коммит");
    expect(res.ok).toBe(true);
    expect(res.message).toContain("первый коммит");
    expect(git.isClean()).toBe(true);
    expect(git.commitCount).toBe(1);
  });

  it("изменение после коммита → modified", () => {
    const { git, vfs } = setup();
    git.init();
    git.add(".");
    git.commit("init");
    vfs.mkfile("/home/you/app.js", "console.log(2)");
    const status = git.status().join("\n");
    expect(status).toContain("modified:   app.js");
    expect(git.isClean()).toBe(false);
  });

  it("commit без staged — nothing to commit", () => {
    const { git } = setup();
    git.init();
    const res = git.commit("пустой");
    expect(res.ok).toBe(false);
    expect(res.message).toContain("nothing to commit");
  });

  it("log возвращает коммиты в обратном порядке", () => {
    const { git } = setup();
    git.init();
    git.add(".");
    git.commit("alpha");
    git.add(".");
    git.commit("beta");
    const log = git.log().join("\n");
    expect(log.indexOf("beta")).toBeLessThan(log.indexOf("alpha"));
    expect(log).toContain("commit c");
  });

  it("git add несуществующего файла — fatal", () => {
    const { git } = setup();
    git.init();
    const res = git.add("ghost.txt");
    expect(res.ok).toBe(false);
    expect(res.message).toContain("did not match any files");
  });
});

describe("git через executeCommand", () => {
  it("git init печатает инициализацию", () => {
    const { vfs, git } = setup();
    const lines = executeCommand("git init", { vfs, log: [], git });
    expect(lines[0].text).toContain("Initialized empty Git repository");
    expect(git.isRepo).toBe(true);
  });

  it("полный цикл: init → add → commit → status clean", () => {
    const { vfs, git } = setup();
    executeCommand("git init", { vfs, log: [], git });
    executeCommand("git add .", { vfs, log: [], git });
    executeCommand('git commit -m "старт проекта"', { vfs, log: [], git });
    const lines = executeCommand("git status", { vfs, log: [], git });
    const all = lines.map((l) => l.text).join("\n");
    expect(all).toContain("nothing to commit, working tree clean");
    expect(git.lastCommitMessage()).toBe("старт проекта");
  });

  it("git без init — fatal", () => {
    const { vfs, git } = setup();
    const lines = executeCommand("git status", { vfs, log: [], git });
    expect(lines[0].text).toContain("not a git repository");
  });

  it("git commit без -m — подсказка", () => {
    const { vfs, git } = setup();
    git.init();
    git.add(".");
    const lines = executeCommand("git commit", { vfs, log: [], git });
    expect(lines[0].text).toContain("empty commit message");
  });

  it("неизвестная подкоманда git", () => {
    const { vfs, git } = setup();
    git.init();
    const lines = executeCommand("git rebasе", { vfs, log: [], git });
    expect(lines[0].text).toContain("is not a git command");
  });
});

describe("git-цели (goals)", () => {
  it("цель repo закрывается после git init", () => {
    const { vfs, git } = setup();
    const goals: TerminalGoal[] = [{ kind: "git", state: "repo" }];
    expect(evaluateGoals(vfs, { commands: [], output: "" }, goals, "/home/you", git).done).toBe(false);
    executeCommand("git init", { vfs, log: [], git });
    expect(evaluateGoals(vfs, { commands: [], output: "" }, goals, "/home/you", git).done).toBe(true);
  });

  it("цель committed требует add+commit, а не просто init", () => {
    const { vfs, git } = setup();
    const goals: TerminalGoal[] = [{ kind: "git", state: "committed" }];
    executeCommand("git init", { vfs, log: [], git });
    expect(evaluateGoals(vfs, { commands: [], output: "" }, goals, "/home/you", git).done).toBe(false);
    executeCommand("git add .", { vfs, log: [], git });
    expect(evaluateGoals(vfs, { commands: [], output: "" }, goals, "/home/you", git).done).toBe(false);
    executeCommand('git commit -m "x"', { vfs, log: [], git });
    expect(evaluateGoals(vfs, { commands: [], output: "" }, goals, "/home/you", git).done).toBe(true);
  });

  it("цель message — точное совпадение последнего коммита", () => {
    const { vfs, git } = setup();
    const goals: TerminalGoal[] = [{ kind: "git", state: "message", message: "моё сообщение" }];
    git.init();
    git.add(".");
    git.commit("другое");
    expect(evaluateGoals(vfs, { commands: [], output: "" }, goals, "/home/you", git).done).toBe(false);
    git.add(".");
    git.commit("моё сообщение");
    expect(evaluateGoals(vfs, { commands: [], output: "" }, goals, "/home/you", git).done).toBe(true);
  });
});
