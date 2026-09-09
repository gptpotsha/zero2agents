import type { LessonContent, LevelMeta } from "@/lib/content/types";
import { lesson as whatIsTerminal } from "./lessons/l1/what-is-terminal/lesson";
import { lesson as firstCommands } from "./lessons/l1/first-commands/lesson";
import { lesson as filesAndFolders } from "./lessons/l1/files-and-folders/lesson";
import { lesson as whereAmI } from "./lessons/l2/where-am-i/lesson";
import { lesson as whatsHere } from "./lessons/l2/whats-here/lesson";
import { lesson as movingIntoFolders } from "./lessons/l2/moving-into-folders/lesson";
import { lesson as goingBackUp } from "./lessons/l2/going-back-up/lesson";
import { lesson as goingHome } from "./lessons/l2/going-home/lesson";
import { lesson as creatingFolders } from "./lessons/l2/creating-folders/lesson";
import { lesson as creatingFiles } from "./lessons/l2/creating-files/lesson";
import { lesson as deletingFiles } from "./lessons/l2/deleting-files/lesson";
import { lesson as deletingFolders } from "./lessons/l2/deleting-folders/lesson";
import { lesson as copyingFiles } from "./lessons/l2/copying-files/lesson";
import { lesson as movingRenaming } from "./lessons/l2/moving-renaming/lesson";
import { lesson as puttingItTogether } from "./lessons/l2/putting-it-together/lesson";
import { lesson as l2Review } from "./lessons/l2/l2-review/lesson";
import { lesson as catFiles } from "./lessons/l3/cat-files/lesson";
import { lesson as headTail } from "./lessons/l3/head-tail/lesson";
import { lesson as echoPrint } from "./lessons/l3/echo-print/lesson";
import { lesson as redirect } from "./lessons/l3/redirect/lesson";
import { lesson as append } from "./lessons/l3/append/lesson";
import { lesson as copyContent } from "./lessons/l3/copy-content/lesson";
import { lesson as grepFiles } from "./lessons/l3/grep-files/lesson";
import { lesson as grepRecursive } from "./lessons/l3/grep-recursive/lesson";
import { lesson as pipes } from "./lessons/l3/pipes/lesson";
import { lesson as wcCount } from "./lessons/l3/wc-count/lesson";
import { lesson as grepPipeWc } from "./lessons/l3/grep-pipe-wc/lesson";
import { lesson as logDetective } from "./lessons/l3/log-detective/lesson";
import { lesson as l3Review } from "./lessons/l3/l3-review/lesson";

/** Мета уровней. Уровни добавляются по мере наполнения контентом (см. план: Ф1). */
export const LEVELS: LevelMeta[] = [
  {
    id: "l1",
    order: 1,
    title: "Компьютеры — это не магия",
    subtitle: "Файлы, папки и что такое терминал",
    scope: "foundation",
    cheatSheet: [
      { cmd: "pwd", description: "Показать, где ты сейчас (путь текущей папки)" },
      { cmd: "ls", description: "Список файлов и папок в текущей папке" },
      { cmd: "cd <папка>", description: "Перейти в папку (например: cd project)" },
      { cmd: "cd ..", description: "Подняться на уровень выше" },
      { cmd: "cd ~", description: "Прыгнуть в домашнюю папку" },
      { cmd: "mkdir <имя>", description: "Создать папку (mkdir notes)" },
      { cmd: "touch <файл>", description: "Создать пустой файл (touch idea.txt)" },
      { cmd: "rm <путь>", description: "Удалить файл или папку (rm junk.txt)" },
      { cmd: "cp <из> <в>", description: "Скопировать файл (cp a.txt b.txt)" },
      { cmd: "mv <из> <в>", description: "Переместить или переименовать (mv a.txt b.txt)" },
      { cmd: "echo текст > файл", description: "Записать текст в файл (echo привет > note.txt)" },
      { cmd: "cat <файл>", description: "Показать содержимое файла" },
    ],
  },
  {
    id: "l2",
    order: 2,
    title: "Первые 30 минут в терминале",
    subtitle: "Навигация, создание и управление файлами как разработчик",
    scope: "foundation",
    cheatSheet: [
      { cmd: "pwd", description: "Где я — полный путь текущей папки" },
      { cmd: "ls [-a]", description: "Что здесь; -a покажет и скрытые файлы" },
      { cmd: "cd <папка>", description: "Зайти в папку" },
      { cmd: "cd ..", description: "На уровень выше" },
      { cmd: "cd ~", description: "Вернуться домой (/home/you)" },
      { cmd: "mkdir [-p] <имя>", description: "Создать папку; -p — сразу цепочку a/b/c" },
      { cmd: "touch <файл>", description: "Создать пустой файл" },
      { cmd: "rm <файл>", description: "Удалить файл — навсегда!" },
      { cmd: "rm -r <папка>", description: "Удалить папку со всем содержимым" },
      { cmd: "cp <из> <в>", description: "Копия; оригинал остаётся" },
      { cmd: "mv <из> <в>", description: "Переместить или переименовать" },
    ],
  },
  {
    id: "l3",
    order: 3,
    title: "Чтение и запись файлов",
    subtitle: "Загляни внутрь файлов, ищи текст и соединяй команды",
    scope: "foundation",
    cheatSheet: [
      { cmd: "cat <файл>", description: "Показать содержимое файла (cat note.txt)" },
      { cmd: "head / tail <файл>", description: "Первые / последние 10 строк файла (head -n 5 log.txt)" },
      { cmd: "echo текст > файл", description: "Записать текст в файл (перезаписывает!)" },
      { cmd: "echo текст >> файл", description: "Дописать текст в конец файла" },
      { cmd: "grep <слово> <файл>", description: "Найти строки со словом (grep ERROR server.log)" },
      { cmd: "grep -r <слово> <папка>", description: "Искать по всем файлам папки и подпапок" },
      { cmd: "cmd1 | cmd2", description: "Конвейер: вывод одной команды на вход другой" },
      { cmd: "wc -l <файл>", description: "Посчитать строки (wc -l notes.txt)" },
      { cmd: "grep слово файл | wc -l", description: "Посчитать совпадения" },
    ],
  },
];

/** Плоский список: какой урок лежит в каком уровне и в каком порядке. */
export type LessonDef = { levelId: string; order: number; lesson: LessonContent };

export const LESSON_DEFS: LessonDef[] = [
  { levelId: "l1", order: 1, lesson: whatIsTerminal },
  { levelId: "l1", order: 2, lesson: firstCommands },
  { levelId: "l1", order: 3, lesson: filesAndFolders },
  { levelId: "l2", order: 1, lesson: whereAmI },
  { levelId: "l2", order: 2, lesson: whatsHere },
  { levelId: "l2", order: 3, lesson: movingIntoFolders },
  { levelId: "l2", order: 4, lesson: goingBackUp },
  { levelId: "l2", order: 5, lesson: goingHome },
  { levelId: "l2", order: 6, lesson: creatingFolders },
  { levelId: "l2", order: 7, lesson: creatingFiles },
  { levelId: "l2", order: 8, lesson: deletingFiles },
  { levelId: "l2", order: 9, lesson: deletingFolders },
  { levelId: "l2", order: 10, lesson: copyingFiles },
  { levelId: "l2", order: 11, lesson: movingRenaming },
  { levelId: "l2", order: 12, lesson: puttingItTogether },
  { levelId: "l2", order: 13, lesson: l2Review },
  { levelId: "l3", order: 1, lesson: catFiles },
  { levelId: "l3", order: 2, lesson: headTail },
  { levelId: "l3", order: 3, lesson: echoPrint },
  { levelId: "l3", order: 4, lesson: redirect },
  { levelId: "l3", order: 5, lesson: append },
  { levelId: "l3", order: 6, lesson: copyContent },
  { levelId: "l3", order: 7, lesson: grepFiles },
  { levelId: "l3", order: 8, lesson: grepRecursive },
  { levelId: "l3", order: 9, lesson: pipes },
  { levelId: "l3", order: 10, lesson: wcCount },
  { levelId: "l3", order: 11, lesson: grepPipeWc },
  { levelId: "l3", order: 12, lesson: logDetective },
  { levelId: "l3", order: 13, lesson: l3Review },
];
