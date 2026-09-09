import type { VirtualFileSystem } from "./vfs";

/**
 * Git-эмуляция как состояния (план §7): никаких реальных объектов/хэшей SHA.
 * Минимальная модель, достаточная для обучения:
 *  - репозиторий: init, ветка main
 *  - индекс (staged): имена путей
 *  - коммиты: список {id, message, files} (id — короткий псевдо-SHA из счётчика)
 *  - статусы файлов: unmodified / modified / staged / untracked
 */

export interface CommitInfo {
  id: string;
  message: string;
  /** Снимок путей файлов на момент коммита → содержимое */
  files: Record<string, string>;
  date: number;
}

export class GitState {
  readonly repoPath: string;
  initialized = false;
  private staged = new Map<string, string>(); // path -> содержимое в индексе
  private commits: CommitInfo[] = [];
  private counter = 0;
  /** Хэш последнего состояния файлов (чтобы отличать modified от unmodified). */
  private lastCommittedContent = new Map<string, string>();
  branch = "main";

  constructor(readonly vfs: VirtualFileSystem, repoPath = "/home/you") {
    this.repoPath = repoPath;
  }

  init(): string {
    this.initialized = true;
    return `Инициализирован пустой репозиторий Git в ${this.repoPath}/.git/`;
  }

  get isRepo(): boolean {
    return this.initialized;
  }

  private requireRepo(): string | null {
    return this.initialized ? null : "fatal: not a git repository (or any of the parent directories): .git";
  }

  /** Пути всех файлов в репозитории (рекурсивно). */
  private repoFiles(): Map<string, string> {
    const result = new Map<string, string>();
    const walk = (abs: string, rel: string) => {
      const node = this.vfs.lookupDir(abs);
      if (!node) return;
      for (const child of node.children.values()) {
        const childRel = rel ? `${rel}/${child.name}` : child.name;
        if (child.kind === "file") result.set(childRel, child.content);
        else walk(`${abs}/${child.name}`, childRel);
      }
    };
    walk(this.repoPath, "");
    // .git — не файл репозитория
    result.delete(".git");
    for (const key of [...result.keys()]) {
      if (key.startsWith(".git/")) result.delete(key);
    }
    return result;
  }

  add(paths: string): { ok: boolean; message: string } {
    const notRepo = this.requireRepo();
    if (notRepo) return { ok: false, message: notRepo };
    const files = this.repoFiles();
    if (paths === "." || paths === "-A" || paths === "--all") {
      this.staged.clear();
      for (const [p, c] of files) this.staged.set(p, c);
      return { ok: true, message: `Подготовлено ${this.staged.size} файл(ов)` };
    }
    const target = paths.replace(/^\.\//, "");
    if (!files.has(target)) {
      return { ok: false, message: `fatal: pathspec '${paths}' did not match any files` };
    }
    this.staged.set(target, files.get(target) ?? "");
    return { ok: true, message: "" };
  }

  commit(message: string): { ok: boolean; message: string } {
    const notRepo = this.requireRepo();
    if (notRepo) return { ok: false, message: notRepo };
    if (this.staged.size === 0) {
      return {
        ok: false,
        message: `nothing to commit, working tree clean${this.commits.length === 0 ? "\n(nothing added to commit but untracked files present)" : ""}`,
      };
    }
    this.counter += 1;
    const id = `c${String(this.counter).padStart(7, "0")}${"abcdef"[this.counter % 6]}${"123456"[this.counter % 7]}`;
    const files: Record<string, string> = {};
    for (const [p, c] of this.staged) files[p] = c;
    this.commits.push({ id, message, files, date: Date.now() });
    this.lastCommittedContent.clear();
    for (const [p, c] of this.staged) this.lastCommittedContent.set(p, c);
    const names = [...this.staged.keys()];
    this.staged.clear();
    const branchLine = `[${this.branch} ${id.slice(0, 7)}] ${message}`;
    const summary = ` ${names.length} file${names.length === 1 ? "" : "s"} changed`;
    return { ok: true, message: `${branchLine}\n${summary}` };
  }

  /** Три секции: staged / modified / untracked. */
  status(): string[] {
    const notRepo = this.requireRepo();
    if (notRepo) return [notRepo];
    const files = this.repoFiles();
    const onBranch = `On branch ${this.branch}`;
    if (files.size === 0 && this.staged.size === 0 && this.commits.length === 0) {
      return [onBranch, "", "No commits yet", "", "nothing to commit (create/copy files and use \"git add\" to track)"];
    }
    const staged: string[] = [];
    for (const [p] of this.staged) staged.push(`\tnew file:   ${p}`);
    const modified: string[] = [];
    const untracked: string[] = [];
    for (const [p, c] of files) {
      if (this.staged.has(p)) continue;
      if (this.lastCommittedContent.has(p)) {
        if (this.lastCommittedContent.get(p) !== c) modified.push(`\tmodified:   ${p}`);
      } else if (this.commits.length > 0) {
        untracked.push(`\t${p}`);
      } else {
        untracked.push(`\t${p}`);
      }
    }
    const lines = [onBranch];
    if (this.commits.length === 0) lines.push("", "No commits yet");
    if (staged.length) {
      lines.push("", "Changes to be committed:");
      lines.push(...staged);
    }
    if (modified.length) {
      lines.push("", "Changes not staged for commit:");
      lines.push(...modified);
    }
    if (untracked.length) {
      lines.push("", "Untracked files:");
      lines.push(...untracked);
    }
    if (!staged.length && !modified.length && !untracked.length) {
      lines.push("", "nothing to commit, working tree clean");
    } else if (!staged.length) {
      lines.push("", 'nothing added to commit but untracked files present (use "git add" to track)');
    }
    return lines;
  }

  log(): string[] {
    const notRepo = this.requireRepo();
    if (notRepo) return [notRepo];
    if (this.commits.length === 0) {
      return ["fatal: your current branch 'main' does not have any commits yet"];
    }
    const lines: string[] = [];
    for (const c of [...this.commits].reverse()) {
      lines.push(`commit ${c.id}`);
      lines.push(`Author: you <you@example.com>`);
      lines.push(`Date:   ${new Date(c.date).toUTCString().replace("GMT", "+0000")}`);
      lines.push("", `    ${c.message}`, "");
    }
    return lines;
  }

  /** Есть ли изменения, которые не закоммичены (для целей kind:"git"). */
  isClean(): boolean {
    if (!this.initialized) return false;
    const files = this.repoFiles();
    if (this.staged.size > 0) return false;
    if (files.size !== this.lastCommittedContent.size) return false;
    for (const [p, c] of files) {
      if (this.lastCommittedContent.get(p) !== c) return false;
    }
    return true;
  }

  get commitCount(): number {
    return this.commits.length;
  }

  lastCommitMessage(): string | null {
    return this.commits.length ? this.commits[this.commits.length - 1].message : null;
  }

  /** Инициализирует скрытый .git-маркер в VFS для визуального ls -a. */
  markDotGit(): void {
    if (this.initialized) {
      this.vfs.mkfile(`${this.repoPath}/.git/config`, "[core]\n\trepositoryformatversion = 0\n\tbare = false\n");
    }
  }
}
