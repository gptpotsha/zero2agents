import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "copying-files",
    title: "Копируем файлы: cp",
    minutes: 5,
    goal: "Дублировать файлы командой cp — в ту же папку и в другую",
    scope: "common",
    skills: ["терминал", "cp", "копирование"],
  },
  content: [
    {
      type: "p",
      text: "cp (copy) — «скопируй». Берёт файл и делает его точную копию. Оригинал остаётся на месте.",
    },
    {
      type: "code",
      text: "cp report.txt backup.txt      # копия рядом с другим именем\ncp report.txt ~/documents/    # копия в другую папку\ncp a.txt b.txt c.txt docs/    # несколько в папку",
    },
    {
      type: "p",
      text: "Два аргумента: откуда и куда. Если «куда» — папка, копия ляжет туда с тем же именем. Если «куда» — новое имя, копия получит его.",
    },
    { type: "note", text: "Осторожно: если в «куда» уже есть файл с таким именем, cp молча перезапишет его." },
  ],
  steps: [
    {
      id: "s1",
      title: "Сделай бэкап",
      content: [
        { type: "p", text: "Перед правками делают копию. Создай backup.txt — копию report.txt — и проверь ls, что файлов стало два." },
      ],
      exercise: {
        type: "terminal",
        task: "Скопируй report.txt в backup.txt.",
        fixture: {
          files: { "/home/you/report.txt": "Важный отчёт v1" },
        },
        goals: [
          { kind: "fs", assert: { path: "/home/you/report.txt", exists: true } },
          { kind: "fs", assert: { path: "/home/you/backup.txt", exists: true, contains: "Важный отчёт v1" } },
        ],
      },
    },
    {
      id: "s2",
      title: "Проверь себя",
      exercise: {
        type: "quiz",
        question: "Что случится с оригиналом после cp file.txt copy.txt?",
        options: [
          "Останется на месте — появится копия",
          "Переместится в copy.txt",
          "Будет удалён",
          "Переименуется в copy.txt",
        ],
        correct: [0],
        explanation: "Копирование не трогает оригинал. Перемещает — другая команда, mv.",
      },
    },
  ],
};
