import type { Fixture } from "@/lib/content/types";

type FsNode = DirNode | FileNode;

export interface DirNode {
  kind: "dir";
  name: string;
  children: Map<string, FsNode>;
}

export interface FileNode {
  kind: "file";
  name: string;
  content: string;
}

export const HOME = "/home/you";

export class VirtualFileSystem {
  readonly root: DirNode;
  private _cwd: string;

  constructor(fixture?: Fixture) {
    this.root = { kind: "dir", name: "", children: new Map() };
    this.mkdirAll("/home");
    this.mkdirAll(HOME);
    const cwd = fixture?.cwd ?? HOME;
    this.mkdirAll(cwd);
    this._cwd = this.normalize(cwd);
    for (const [absPath, content] of Object.entries(fixture?.files ?? {})) {
      const normalized = this.normalize(absPath);
      const parent = normalized.slice(0, normalized.lastIndexOf("/")) || "/";
      this.mkdirAll(parent); // фикстуры могут подразумевать вложенные папки
      const file = this.mkfile(normalized, content);
      if (!file) throw new Error(`Фикстура: не удалось создать файл ${absPath}`);
    }
  }

  get cwd(): string {
    return this._cwd;
  }

  /** Меняет текущий каталог (путь нормализуется). */
  changeDir(input: string): void {
    this._cwd = this.normalize(input);
  }

  /** Нормализует путь относительно cwd. Понимает ., .. и ~. */
  normalize(input: string): string {
    const raw = input.trim();
    const expanded = raw === "~" || raw.startsWith("~/") ? `${HOME}${raw.slice(1)}` : raw;
    const absolute = expanded.startsWith("/") ? expanded : `${this._cwd}/${expanded}`;
    const parts: string[] = [];
    for (const part of absolute.split("/")) {
      if (!part || part === ".") continue;
      if (part === "..") parts.pop();
      else parts.push(part);
    }
    return "/" + parts.join("/");
  }

  resolveToNode(input: string): FsNode | null {
    const target = this.normalize(input);
    if (target === "/") return this.root;
    const segments = target.split("/").filter(Boolean);
    let node: FsNode = this.root;
    for (const seg of segments) {
      if (node.kind !== "dir") return null;
      const next = node.children.get(seg);
      if (!next) return null;
      node = next;
    }
    return node;
  }

  lookupDir(input: string): DirNode | null {
    const node = this.resolveToNode(input);
    return node && node.kind === "dir" ? node : null;
  }

  lookupFile(input: string): FileNode | null {
    const node = this.resolveToNode(input);
    return node && node.kind === "file" ? node : null;
  }

  mkdirAll(input: string): void {
    const target = this.normalize(input);
    const segments = target.split("/").filter(Boolean);
    let node = this.root;
    for (const seg of segments) {
      const existing = node.children.get(seg);
      if (existing) {
        if (existing.kind !== "dir") throw new Error(`Путь ${target}: ${seg} — не папка`);
        node = existing;
      } else {
        const dir: DirNode = { kind: "dir", name: seg, children: new Map() };
        node.children.set(seg, dir);
        node = dir;
      }
    }
  }

  /** Создаёт папку. Родитель должен существовать. */
  mkdir(input: string): { ok: true } | { ok: false; error: string } {
    const target = this.normalize(input);
    if (target === "/") return { ok: false, error: "mkdir: невозможно создать корень" };
    const parent = target.slice(0, target.lastIndexOf("/")) || "/";
    const name = target.slice(target.lastIndexOf("/") + 1);
    const parentNode = this.lookupDir(parent);
    if (!parentNode) return { ok: false, error: `mkdir: нет такой папки: ${parent}` };
    if (parentNode.children.has(name)) return { ok: false, error: `mkdir: уже существует: ${target}` };
    parentNode.children.set(name, { kind: "dir", name, children: new Map() });
    return { ok: true };
  }

  /** Создаёт/перезаписывает файл. Родитель должен существовать. */
  mkfile(input: string, content: string): FileNode | null {
    const target = this.normalize(input);
    const parent = target.slice(0, target.lastIndexOf("/")) || "/";
    const name = target.slice(target.lastIndexOf("/") + 1);
    const parentNode = this.lookupDir(parent);
    if (!parentNode) return null;
    let file = parentNode.children.get(name);
    if (file && file.kind !== "file") return null;
    if (!file) {
      file = { kind: "file", name, content };
      parentNode.children.set(name, file);
    } else {
      file.content = content;
    }
    return file;
  }

  listDir(input: string): { entries: string[]; error?: string } {
    const dir = this.lookupDir(input);
    if (!dir) {
      const target = this.resolveToNode(input);
      if (target && target.kind === "file") return { entries: [], error: `ls: ${input}: это файл, а не папка` };
      return { entries: [], error: `ls: нет такой папки: ${input}` };
    }
    const names = [...dir.children.keys()].sort((a, b) => a.localeCompare(b));
    return { entries: names };
  }

  readFile(input: string): { content?: string; error?: string } {
    const target = this.normalize(input);
    const node = this.resolveToNode(target);
    if (!node) return { error: `cat: нет такого файла: ${input}` };
    if (node.kind === "dir") return { error: `cat: ${input}: это папка` };
    return { content: node.content };
  }

  remove(input: string): { ok: boolean; error?: string } {
    const target = this.normalize(input);
    if (target === "/" || target === HOME) return { ok: false, error: `rm: нельзя удалить: ${input}` };
    const parent = target.slice(0, target.lastIndexOf("/")) || "/";
    const name = target.slice(target.lastIndexOf("/") + 1);
    const parentNode = this.lookupDir(parent);
    if (!parentNode || !parentNode.children.has(name)) return { ok: false, error: `rm: нет такого пути: ${input}` };
    parentNode.children.delete(name);
    return { ok: true };
  }
}

/** Красивое отображение cwd: ~ вместо /home/you. */
export function displayPath(cwd: string): string {
  if (cwd === HOME) return "~";
  if (cwd.startsWith(HOME + "/")) return "~" + cwd.slice(HOME.length);
  return cwd;
}
