import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "whats-here",
    title: "Что здесь? Список файлов: ls",
    minutes: 5,
    goal: "Посмотреть содержимое папки командой ls и увидеть скрытые файлы",
    scope: "common",
    skills: ["терминал", "ls", "скрытые файлы"],
  },
  content: [
    {
      type: "p",
      text: "Команда ls (list) показывает, какие файлы и папки лежат в текущей папке. Это как открыть ящик стола и посмотреть, что внутри.",
    },
    {
      type: "code",
      text: "ls          # содержимое текущей папки\nls project  # содержимое папки project\nls -a       # включая скрытые файлы",
    },
    {
      type: "p",
      text: "Файлы, чьё имя начинается с точки (например, .config), считаются скрытыми — обычный ls их не показывает. Флаг -a (all) открывает всё.",
    },
    { type: "note", text: "Флаг — это дополнение к команде через дефис, меняющее её поведение. У ls их много, пока хватает -a." },
  ],
  steps: [
    {
      id: "s1",
      title: "Посмотри вокруг",
      content: [
        { type: "p", text: "В твоей домашней папке лежат файлы и папки. Выполни ls, затем ls -a и сравни." },
      ],
      exercise: {
        type: "terminal",
        task: "Выполни ls, затем ls -a — найди скрытый файл .secrets.txt.",
        fixture: {
          files: {
            "/home/you/notes.txt": "мои заметки",
            "/home/you/.secrets.txt": "секретный план захвата мира",
          },
        },
        goals: [
          { kind: "run", match: "ls" },
          { kind: "run", match: "ls -a" },
          { kind: "output", contains: ".secrets.txt" },
        ],
      },
    },
    {
      id: "s2",
      title: "Проверь себя",
      exercise: {
        type: "fill-blank",
        template: "Команда ____ показывает содержимое папки, а её флаг ____ открывает скрытые файлы.",
        blanks: [
          { accept: ["ls"] },
          { accept: ["-a", "a"] },
        ],
        explanation: "ls — list, -a — all: показать всё, включая файлы с точкой в начале имени.",
      },
    },
  ],
};
