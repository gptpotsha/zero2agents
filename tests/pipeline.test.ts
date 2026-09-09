import { describe, expect, it } from "vitest";
import { VirtualFileSystem } from "@/lib/terminal/vfs";
import { executeCommand } from "@/lib/terminal/commands";

function setup(files: Record<string, string> = {}) {
  const vfs = new VirtualFileSystem({ files });
  const run = (cmd: string) =>
    executeCommand(cmd, { vfs, log: [] }).map((l) => l.text).join("\n");
  return { vfs, run };
}

describe("head/tail", () => {
  const log = [
    "строка 1",
    "строка 2",
    "строка 3",
    "строка 4",
    "строка 5",
  ].join("\n");

  it("head показывает первые N строк", () => {
    const { run } = setup({ "/home/you/log.txt": log });
    expect(run("head -n 2 log.txt")).toBe("строка 1\nстрока 2");
  });

  it("head по умолчанию 10 строк", () => {
    const { run } = setup({ "/home/you/log.txt": log });
    expect(run("head log.txt")).toContain("строка 5");
  });

  it("tail показывает последние N строк", () => {
    const { run } = setup({ "/home/you/log.txt": log });
    expect(run("tail -n 2 log.txt")).toBe("строка 4\nстрока 5");
  });

  it("head из stdin через пайп", () => {
    const { run } = setup();
    expect(run("echo a | head -n 1")).toBe("a");
  });
});

describe("grep", () => {
  const log = ["INFO старт", "ERROR упал", "INFO работает", "ERROR упал снова", "WARN предупреждение"].join("\n");

  it("grep находит строки с паттерном", () => {
    const { run } = setup({ "/home/you/server.log": log });
    const out = run("grep ERROR server.log");
    expect(out).toContain("ERROR упал");
    expect(out).toContain("ERROR упал снова");
    expect(out).not.toContain("INFO старт");
  });

  it("grep из stdin через пайп", () => {
    const { run } = setup();
    expect(run("echo hello world | grep world")).toBe("hello world");
  });

  it("grep без совпадений", () => {
    const { run } = setup({ "/home/you/f.txt": "abc" });
    expect(run("grep xyz f.txt")).toContain("совпадений нет");
  });

  it("grep -r по папке с префиксом пути", () => {
    const { run } = setup({
      "/home/you/src/a.js": "const x = 1;",
      "/home/you/src/b.js": "const magic = 42;",
    });
    const out = run("grep -r magic src");
    expect(out).toContain("src/b.js:const magic = 42;");
  });

  it("grep без файла и без stdin — ошибка", () => {
    const { run } = setup();
    expect(run("grep слово")).toContain("grep:");
  });
});

describe("wc", () => {
  it("wc -l считает строки", () => {
    const { run } = setup({ "/home/you/n.txt": "a\nb\nc" });
    expect(run("wc -l n.txt")).toBe("3");
  });

  it("wc -w считает слова", () => {
    const { run } = setup({ "/home/you/n.txt": "один два три" });
    expect(run("wc -w n.txt")).toBe("3");
  });

  it("wc -l из stdin через пайп", () => {
    const { run } = setup({ "/home/you/f.txt": "x\ny\nz\nw" });
    expect(run("cat f.txt | wc -l")).toBe("4");
  });
});

describe("пайпы", () => {
  it("grep | wc — классика", () => {
    const { run } = setup({
      "/home/you/server.log": "INFO ok\nERROR fail\nERROR fail2\nINFO go",
    });
    expect(run("grep ERROR server.log | wc -l")).toBe("2");
  });

  it("трёхзвенный конвейер", () => {
    const { run } = setup();
    expect(run("echo abc def | grep abc | wc -w")).toBe("2");
  });

  it("результат пайпа можно перенаправить в файл", () => {
    const vfs = new VirtualFileSystem({
      files: { "/home/you/f.txt": "hit\nmiss\nhit2" },
    });
    executeCommand("grep hit f.txt > out.txt", { vfs, log: [] });
    const content = vfs.lookupFile("/home/you/out.txt")?.content ?? "";
    expect(content).toContain("hit");
    expect(content).not.toContain("miss");
  });

  it("cat | head | wc", () => {
    const { run } = setup({
      "/home/you/big.txt": "1\n2\n3\n4\n5",
    });
    expect(run("cat big.txt | head -n 2 | wc -l")).toBe("2");
  });
});
