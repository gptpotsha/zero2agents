import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "full-workflow-challenge",
    title: "Испытание: полный workflow",
    minutes: 7,
    goal: "Пройти весь git-цикл самостоятельно, без подсказок",
    scope: "common",
    skills: ["git", "workflow", "практика"],
  },
  content: [
    {
      type: "p",
      text: "Время собрать всё вместе. Никаких подсказок по командам — только описание того, что должно получиться.",
    },
    {
      type: "p",
      text: "Ситуация: тебе передали проект без git. Нужно: взять под контроль версий, исправить баг в конфиге и зафиксировать исправление.",
    },
  ],
  steps: [
    {
      id: "s1",
      title: "Шаг 1: возьми под контроль",
      content: [
        { type: "p", text: "Сделай первый коммит всех файлов проекта с сообщением «Начальная версия»." },
      ],
      exercise: {
        type: "terminal",
        task: "git init, git add ., git commit -m \"Начальная версия\".",
        fixture: {
          files: {
            "/home/you/my-blog/index.html": "<h1>Блог</h1>",
            "/home/you/my-blog/config.txt": "debug=true",
            "/home/you/my-blog/app.js": "alert('hi')",
          },
        },
        goals: [
          { kind: "git", state: "message", message: "Начальная версия" },
        ],
      },
    },
    {
      id: "s2",
      title: "Шаг 2: исправь баг",
      content: [
        { type: "p", text: "В config.txt debug=true — так нельзя выкладывать. Исправь на false (echo false конфиг > файл) и закоммить отдельно с осмысленным сообщением." },
      ],
      exercise: {
        type: "terminal",
        task: "echo false > config.txt, git add config.txt, git commit с любым осмысленным сообщением об исправлении.",
        goals: [
          { kind: "git", state: "committed" },
          { kind: "fs", assert: { path: "/home/you/my-blog/config.txt", contains: "false" } },
        ],
      },
    },
    {
      id: "s3",
      title: "Шаг 3: финальная проверка",
      exercise: {
        type: "terminal",
        task: "git log и git status — покажи, что история содержит минимум два коммита и рабочее дерево чистое.",
        goals: [
          { kind: "git", state: "clean" },
          { kind: "output", contains: "commit" },
        ],
      },
    },
  ],
};
