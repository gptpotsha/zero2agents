import { VirtualFileSystem, displayPath } from "./vfs";
import { GitState } from "./git";

export interface TermLine {
  text: string;
  tone: "out" | "err";
}

export interface ParsedCommand {
  argv: string[];
  redirectFile?: string;
  /** true — дописать в конец (>>), false/undefined — перезаписать (>) */
  append?: boolean;
}

/** Разбор строки на аргументы (уважает кавычки), редирект > и append >>. */
export function parseShell(raw: string): ParsedCommand {
  const tokens: string[] = [];
  const argv: string[] = [];
  let redirectFile: string | undefined;
  let parsed_append = false;
  let current = "";
  let quote: "'" | '"' | null = null;

  const pushToken = () => {
    if (current.length > 0) {
      tokens.push(current);
      current = "";
    }
  };

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (quote) {
      if (ch === quote) quote = null;
      else current += ch;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }
    if (ch === ">") {
      pushToken();
      if (raw[i + 1] === ">") {
        tokens.push(">>");
        i++; // съели второй символ
      } else {
        tokens.push(">");
      }
      continue;
    }
    if (ch === " " || ch === "\t") {
      pushToken();
      continue;
    }
    current += ch;
  }
  pushToken();

  // >> — один токен append; > — перезапись
  const appendIdx = tokens.indexOf(">>");
  const redirectIdx = tokens.indexOf(">");
  const idx = appendIdx !== -1 ? appendIdx : redirectIdx;
  if (idx !== -1) {
    const op = appendIdx !== -1 ? ">>" : ">";
    if (tokens.indexOf(">", idx + 1) !== -1 || tokens.indexOf(">>", idx + 1) !== -1) {
      throw new Error(`Синтаксис: допускается один редирект ${op}`);
    }
    const tail = tokens.slice(idx + 1);
    if (tail.length !== 1) throw new Error(`Синтаксис: нужно имя файла после ${op}`);
    argv.push(...tokens.slice(0, idx));
    redirectFile = tail[0];
    if (appendIdx !== -1) parsed_append = true;
  } else {
    argv.push(...tokens);
  }
  return { argv, redirectFile, append: parsed_append };
}

export type CommandContext = { vfs: VirtualFileSystem; log: string[]; git?: GitState };

/** Выполняет команду, возвращает строки вывода/ошибок и применённый редирект. */
export function executeCommand(raw: string, ctx: CommandContext): TermLine[] {
  const { vfs, git } = ctx;
  // git доступен и без явного состояния — лениво создаём привязанный к текущей ФС
  const gitState = git ?? ((ctx as { __git?: GitState }).__git ??= new GitState(vfs));
  let parsed: ParsedCommand;
  try {
    parsed = parseShell(raw);
  } catch (e) {
    return [{ text: `bash: ${(e as Error).message}`, tone: "err" }];
  }
  if (parsed.argv.length === 0) return [];

  const [cmd, ...args] = parsed.argv;
  const lines: TermLine[] = [];

  const out = (text: string) => lines.push({ text, tone: "out" });
  const err = (text: string) => lines.push({ text, tone: "err" });

  const writeResult = (content: string) => {
    if (parsed.redirectFile) {
      if (parsed.append) {
        // >> — дописать в конец существующего файла
        const existing = vfs.lookupFile(parsed.redirectFile);
        const merged = existing ? `${existing.content}\n${content}` : content;
        const file = vfs.mkfile(parsed.redirectFile, merged);
        if (!file) err(`bash: не удалось записать в ${parsed.redirectFile}`);
      } else {
        const file = vfs.mkfile(parsed.redirectFile, content);
        if (!file) err(`bash: не удалось записать в ${parsed.redirectFile}`);
      }
    } else {
      content.split("\n").filter((l, i, a) => !(l === "" && i === a.length - 1)).forEach(out);
    }
  };

  switch (cmd) {
    case "pwd":
      out(displayPath(vfs.cwd));
      break;
    case "echo": {
      const text = args.join(" ");
      writeResult(text);
      break;
    }
    case "clear":
      // clear обрабатывается в UI (стирает экран); сюда попадает как no-op
      break;
    case "ls": {
      const withHidden = args.includes("-a") || args.includes("-la") || args.includes("-al");
      const pathArg = args.find((a) => !a.startsWith("-"));
      const target = pathArg ?? vfs.cwd;
      const { entries, error } = vfs.listDir(target);
      if (error) {
        err(error);
        break;
      }
      const visible = withHidden ? entries : entries.filter((name) => !name.startsWith("."));
      if (withHidden) {
        out(".");
        out("..");
      }
      out(visible.join("  ") || "(пусто)");
      break;
    }
    case "cd": {
      const target = args[0] ?? "~";
      const dir = vfs.lookupDir(target);
      if (!dir) {
        err(`cd: нет такой папки: ${args[0] ?? ""}`);
        break;
      }
      vfs.changeDir(target);
      break;
    }
    case "cat": {
      if (args.length === 0) {
        err("cat: укажи имя файла");
        break;
      }
      for (const fileArg of args) {
        const { content, error } = vfs.readFile(fileArg);
        if (error) err(error);
        else out(content ?? "");
      }
      break;
    }
    case "mkdir": {
      const recursive = args.includes("-p");
      const paths = args.filter((a) => !a.startsWith("-"));
      if (paths.length === 0) {
        err("mkdir: укажи имя папки");
        break;
      }
      for (const p of paths) {
        if (recursive) vfs.mkdirAll(p);
        else {
          const res = vfs.mkdir(p);
          if (!res.ok) err(res.error);
        }
      }
      break;
    }
    case "touch": {
      if (args.length === 0) {
        err("touch: укажи имя файла");
        break;
      }
      for (const p of args) {
        const existing = vfs.lookupFile(p);
        if (existing) continue;
        const file = vfs.mkfile(p, "");
        if (!file) err(`touch: не удалось создать ${p}`);
      }
      break;
    }
    case "rm": {
      const recursive = args.includes("-r") || args.includes("-rf");
      const paths = args.filter((a) => !a.startsWith("-"));
      for (const p of paths) {
        const res = vfs.remove(p);
        if (!res.ok) err(res.error ?? "rm: ошибка");
        else if (!recursive) {
          // Примечание: эмуляция позволяет удалять папки без -r для простоты.
        }
      }
      break;
    }
    case "cp": {
      if (args.length < 2) {
        err("cp: нужно два аргумента: cp <источник> <назначение>");
        break;
      }
      copyNode(vfs, args[0], args[1], err);
      break;
    }
    case "mv": {
      if (args.length < 2) {
        err("mv: нужно два аргумента: mv <источник> <назначение>");
        break;
      }
      moveNode(vfs, args[0], args[1], err);
      break;
    }
    case "whoami":
      out("you");
      break;
    case "git": {
      const sub = args[0];
      const rest = args.slice(1).filter((a) => !a.startsWith("-"));
      switch (sub) {
        case "init": {
          const res = gitState.init();
          gitState.markDotGit();
          out(`Initialized empty Git repository in ${vfs.cwd}/.git/`.replace(/\/home\/you/, "/home/you"));
          break;
        }
        case "add": {
          if (rest.length === 0) {
            err("Nothing specified, nothing added.");
            err("hint: Maybe you wanted to say 'git add .'?");
            break;
          }
          const res = gitState.add(rest[0]);
          if (!res.ok) err(res.message);
          break;
        }
        case "commit": {
          // git commit -m "сообщение"
          const mIdx = args.indexOf("-m");
          const message = mIdx !== -1 ? args[mIdx + 1] : undefined;
          if (!message) {
            err('Aborting commit due to empty commit message: укажи -m "текст"');
            break;
          }
          const res = gitState.commit(message);
          if (!res.ok) err(res.message);
          else res.message.split("\n").forEach(out);
          break;
        }
        case "status":
          gitState.status().forEach((l) => (l === "" ? out("") : out(l)));
          break;
        case "log":
          gitState.log().forEach((l) => out(l));
          break;
        case "branch": {
          if (!gitState.isRepo) {
            err("fatal: not a git repository (or any of the parent directories): .git");
            break;
          }
          out(`* ${gitState.branch}`);
          break;
        }
        case "diff":
        case "remote":
        case "push":
        case "pull":
        case "clone":
          err(`git ${sub}: пока не поддерживается в тренажёре (этот уровень — про локальный git)`);
          break;
        case undefined:
          err("usage: git [--version] <command> [<args>]");
          break;
        default:
          err(`git: '${sub}' is not a git command. See 'git --help'.`);
      }
      break;
    }
    case "help":
      out("Доступные команды: pwd, ls [-a], cd <папка>, cat <файл>, echo <текст> [> файл], mkdir [-p] <папка>, touch <файл>, rm <путь>, cp <источник> <назначение>, mv <источник> <назначение>, git init/add/commit/status/log, whoami, clear");
      break;
    default:
      err(`bash: ${cmd}: команда не найдена (набери help)`.trim());
  }
  return lines;
}

function copyNode(vfs: VirtualFileSystem, src: string, dst: string, err: (t: string) => void): void {
  const source = vfs.resolveToNode(src);
  if (!source) {
    err(`cp: нет такого пути: ${src}`);
    return;
  }
  const dstDir = vfs.lookupDir(dst);
  if (dstDir) {
    // копия внутрь папки с тем же именем
    const name = source.name || (src.split("/").filter(Boolean).pop() ?? src);
    if (source.kind === "file") vfs.mkfile(`${dst}/${name}`, source.content);
    else err("cp: копирование папок пока не поддерживается");
    return;
  }
  if (source.kind === "file") {
    const file = vfs.mkfile(dst, source.content);
    if (!file) err(`cp: не удалось скопировать в ${dst}`);
  } else {
    err("cp: копирование папок пока не поддерживается");
  }
}

function moveNode(vfs: VirtualFileSystem, src: string, dst: string, err: (t: string) => void): void {
  const source = vfs.resolveToNode(src);
  if (!source) {
    err(`mv: нет такого пути: ${src}`);
    return;
  }
  const dstDir = vfs.lookupDir(dst);
  const targetName = dstDir ? `${dst}/${source.name}` : dst;
  if (source.kind === "file") {
    const created = vfs.mkfile(targetName, source.content);
    if (!created) {
      err(`mv: не удалось переместить в ${targetName}`);
      return;
    }
    vfs.remove(src);
  } else {
    // перемещение папки: создаём новую и переносим детей
    const moved = moveDir(vfs, src, targetName);
    if (!moved.ok) {
      err(moved.error ?? "mv: не удалось переместить папку");
      return;
    }
  }
}

function moveDir(vfs: VirtualFileSystem, src: string, dst: string): { ok: boolean; error?: string } {
  const dir = vfs.lookupDir(src);
  if (!dir) return { ok: false, error: `mv: нет такой папки: ${src}` };
  const created = vfs.mkdir(dst);
  if (!created.ok) return created;
  const children = [...dir.children.values()];
  for (const child of children) {
    const from = `${src}/${child.name}`;
    const to = `${dst}/${child.name}`;
    if (child.kind === "dir") {
      const res = moveDir(vfs, from, to);
      if (!res.ok) return res;
    } else {
      vfs.mkfile(to, child.content);
    }
    vfs.remove(from);
  }
  vfs.remove(src);
  return { ok: true };
}
