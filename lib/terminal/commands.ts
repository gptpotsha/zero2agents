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

/** Выполняет команду (с конвейером |), возвращает строки вывода/ошибок и применённый редирект. */
export function executeCommand(raw: string, ctx: CommandContext): TermLine[] {
  const { vfs, git } = ctx;
  // git доступен и без явного состояния — лениво создаём привязанный к текущей ФС
  const gitState = git ?? ((ctx as { __git?: GitState }).__git ??= new GitState(vfs));

  const stages = splitPipes(raw);
  if (stages.length === 0) return [];
  if (stages.length > 4) return [{ text: "bash: слишком длинный конвейер (максимум 4)", tone: "err" }];

  let stdinData: string | null = null; // текст, передаваемый по пайпу
  const lines: TermLine[] = [];

  for (let si = 0; si < stages.length; si++) {
    const isLast = si === stages.length - 1;
    let parsed: ParsedCommand;
    try {
      parsed = parseShell(stages[si]);
    } catch (e) {
      return [{ text: `bash: ${(e as Error).message}`, tone: "err" }];
    }
    if (parsed.argv.length === 0) {
      if (isLast) break;
      continue;
    }
    // Редирект допустим только на последней стадии конвейера
    const stageRedirect = isLast ? parsed.redirectFile : undefined;
    const stageAppend = isLast ? parsed.append : false;

    const [cmd, ...args] = parsed.argv;
    const stageLines: TermLine[] = [];
    const captured: string[] = [];
    // При redirect весь stdout стадии идёт в captured (в файл), иначе на экран.
    const out = stageRedirect
      ? (text: string) => captured.push(text)
      : (text: string) => stageLines.push({ text, tone: "out" });
    const err = (text: string) => stageLines.push({ text, tone: "err" });
    const emit = out;

    runSingleCommand(cmd, args, { vfs, git: gitState, stdin: stdinData, out, err, emit });

    if (stageRedirect) {
      const content = captured.join("\n");
      const existing = stageAppend ? vfs.lookupFile(stageRedirect)?.content : undefined;
      const merged = existing !== undefined ? `${existing}\n${content}` : content;
      const file = vfs.mkfile(stageRedirect, merged);
      if (!file) stageLines.push({ text: `bash: не удалось записать в ${stageRedirect}`, tone: "err" });
      stdinData = null;
    } else {
      stdinData = stageLines.filter((l) => l.tone === "out").map((l) => l.text).join("\n");
    }

    // Промежуточные стадии конвейера не печатают stdout — только последняя видна.
    // Ошибки любой стадии показываются сразу.
    if (isLast) {
      lines.push(...stageLines);
    } else {
      lines.push(...stageLines.filter((l) => l.tone === "err"));
    }
  }

  return lines;
}

/** Разбивает строку по непроцитированным |. */
function splitPipes(raw: string): string[] {
  const parts: string[] = [];
  let current = "";
  let quote: "'" | '"' | null = null;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (quote) {
      if (ch === quote) quote = null;
      current += ch; // кавычки сохраняем — parseShell сам их разберёт
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === "|") {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  parts.push(current);
  return parts.map((p) => p.trim()).filter((p) => p.length > 0);
}

interface StageCtx {
  vfs: VirtualFileSystem;
  git: GitState;
  /** stdin от предыдущей стадии пайпа (null — стадия первая). */
  stdin: string | null;
  out: (text: string) => void;
  err: (text: string) => void;
  /** Вывод с учётом редиректа в файл (echo/cat пишут через него). */
  emit: (text: string) => void;
}

function runSingleCommand(cmd: string, args: string[], ctx: StageCtx): void {
  const { vfs, git, stdin, out, err, emit } = ctx;
  // echo/cat умеют писать в redirect — эмитят через emit.
  const textOut = cmd === "echo" || cmd === "cat" ? emit : out;

  switch (cmd) {
    case "pwd":
      textOut(displayPath(vfs.cwd));
      break;
    case "echo": {
      textOut(args.join(" "));
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
        if (stdin !== null) {
          textOut(stdin); // cat в конвейере просто пропускает данные
          break;
        }
        err("cat: укажи имя файла");
        break;
      }
      for (const fileArg of args) {
        const { content, error } = vfs.readFile(fileArg);
        if (error) err(error);
        else textOut(content ?? "");
      }
      break;
    }
    case "head": {
      const nFlag = args.indexOf("-n");
      const n = nFlag !== -1 ? Number(args[nFlag + 1]) : 10;
      const pathArg = args.find((a, i) => !a.startsWith("-") && (nFlag === -1 || i !== nFlag + 1));
      const text = resolveText(vfs, stdin, pathArg, err, "head");
      if (text === null) break;
      text.split("\n").slice(0, Math.max(0, n)).forEach(out);
      break;
    }
    case "tail": {
      const nFlag = args.indexOf("-n");
      const n = nFlag !== -1 ? Number(args[nFlag + 1]) : 10;
      const pathArg = args.find((a, i) => !a.startsWith("-") && (nFlag === -1 || i !== nFlag + 1));
      const text = resolveText(vfs, stdin, pathArg, err, "tail");
      if (text === null) break;
      const allLines = text.split("\n");
      allLines.slice(Math.max(0, allLines.length - Math.max(0, n))).forEach(out);
      break;
    }
    case "grep": {
      const recursive = args.includes("-r");
      const patterns = args.filter((a) => !a.startsWith("-"));
      if (patterns.length === 0) {
        err("grep: укажи что искать");
        break;
      }
      const pattern = patterns[0].replace(/^["']|["']$/g, "");
      const targets = patterns.slice(1);
      if (recursive) {
        // grep -r: по всем файлам папки рекурсивно
        const dirPath = targets[0] ?? ".";
        const dir = vfs.lookupDir(dirPath);
        if (!dir) {
          err(`grep: ${dirPath}: нет такой папки`);
          break;
        }
        const found = grepRecursive(vfs, dir, dirPath, pattern);
        if (found.length === 0) out("(совпадений нет)");
        found.forEach(out);
        break;
      }
      const text = resolveText(vfs, stdin, targets[0], err, "grep");
      if (text === null) break;
      const matched = text.split("\n").filter((l) => l.includes(pattern));
      if (matched.length === 0) out("(совпадений нет)");
      matched.forEach(out);
      break;
    }
    case "wc": {
      const lineFlag = args.includes("-l");
      const wordFlag = args.includes("-w");
      const pathArg = args.find((a) => !a.startsWith("-"));
      const text = resolveText(vfs, stdin, pathArg, err, "wc");
      if (text === null) break;
      if (lineFlag) textOut(String(text.split("\n").filter((l, i, a) => !(l === "" && i === a.length - 1)).length));
      else if (wordFlag) textOut(String(text.split(/\s+/).filter(Boolean).length));
      else textOut(String(text.split(/\s+/).filter(Boolean).length));
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
          const res = git.init();
          git.markDotGit();
          out(`Initialized empty Git repository in ${vfs.cwd}/.git/`.replace(/\/home\/you/, "/home/you"));
          break;
        }
        case "add": {
          if (rest.length === 0) {
            err("Nothing specified, nothing added.");
            err("hint: Maybe you wanted to say 'git add .'?");
            break;
          }
          const res = git.add(rest[0]);
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
          const res = git.commit(message);
          if (!res.ok) err(res.message);
          else res.message.split("\n").forEach(out);
          break;
        }
        case "status":
          git.status().forEach((l) => (l === "" ? out("") : out(l)));
          break;
        case "log":
          git.log().forEach((l) => out(l));
          break;
        case "branch": {
          if (!git.isRepo) {
            err("fatal: not a git repository (or any of the parent directories): .git");
            break;
          }
          out(`* ${git.branch}`);
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
      out("Доступные команды: pwd, ls [-a], cd <папка>, cat <файл>, echo <текст> [> / >> файл], head [-n N] <файл>, tail [-n N] <файл>, grep <слово> <файл>, grep -r <слово> <папка>, wc [-l|-w] <файл>, конвейер | (напр. grep X f | wc -l), mkdir [-p] <папка>, touch <файл>, rm <путь>, cp <источник> <назначение>, mv <источник> <назначение>, git init/add/commit/status/log, whoami, clear");
      break;
    default:
      err(`bash: ${cmd}: команда не найдена (набери help)`.trim());
  }
}

/** Текст для фильтров (head/tail/grep/wc): из файла-аргумента или из stdin. */
function resolveText(
  vfs: VirtualFileSystem,
  stdin: string | null,
  pathArg: string | undefined,
  err: (t: string) => void,
  cmdName: string,
): string | null {
  if (pathArg) {
    const { content, error } = vfs.readFile(pathArg);
    if (error) {
      err(`${cmdName}: ${error}`);
      return null;
    }
    return content ?? "";
  }
  if (stdin !== null) return stdin;
  err(`${cmdName}: укажи файл или подай данные через конвейер |`);
  return null;
}

/** grep -r: рекурсивный поиск по всем файлам папки. */
function grepRecursive(
  vfs: VirtualFileSystem,
  dir: NonNullable<ReturnType<VirtualFileSystem["lookupDir"]>>,
  basePath: string,
  pattern: string,
): string[] {
  const found: string[] = [];
  for (const child of dir.children.values()) {
    const childPath = basePath === "." || basePath === "" ? child.name : `${basePath}/${child.name}`;
    if (child.kind === "dir") {
      if (child.name === ".git") continue;
      found.push(...grepRecursive(vfs, child, childPath, pattern));
    } else {
      const hits = child.content.split("\n").filter((l) => l.includes(pattern));
      for (const hit of hits) found.push(`${childPath}:${hit}`);
    }
  }
  return found;
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
