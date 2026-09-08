import type { LessonContent, LevelMeta } from "@/lib/content/types";
import { lesson as whatIsTerminal } from "./lessons/l1/what-is-terminal/lesson";
import { lesson as firstCommands } from "./lessons/l1/first-commands/lesson";
import { lesson as filesAndFolders } from "./lessons/l1/files-and-folders/lesson";

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
];

/** Плоский список: какой урок лежит в каком уровне и в каком порядке. */
export type LessonDef = { levelId: string; order: number; lesson: LessonContent };

export const LESSON_DEFS: LessonDef[] = [
  { levelId: "l1", order: 1, lesson: whatIsTerminal },
  { levelId: "l1", order: 2, lesson: firstCommands },
  { levelId: "l1", order: 3, lesson: filesAndFolders },
];
