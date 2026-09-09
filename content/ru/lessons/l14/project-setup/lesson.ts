import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "project-setup",
    title: "Настраиваем окружение",
    minutes: 6,
    goal: "Подготовить Node.js и создать заготовку проекта с git-историей",
    scope: "generic-agent",
    skills: ["{{agent.binary}}", "node", "окружение"],
  },
  content: [
    {
      type: "p",
      text: "Проект живёт на твоей машине. Проверь, что Node.js установлен: открой настоящий терминал (не тренажёр) и выполни node -v. Ответ вида v20.x.x или новее — готов. Нет Node? Скачай LTS-версию с nodejs.org и поставь.",
    },
    {
      type: "p",
      text: "Дальше — в настоящем терминале:",
    },
    {
      type: "code",
      text: "mkdir tic-tac-toe\ncd tic-tac-toe\ngit init\nnpm init -y",
    },
    {
      type: "ul",
      items: [
        "git init — история проекта с первого дня (уровень 4)",
        "npm init -y — создаёт package.json, паспорт проекта со списком зависимостей",
        "Именно в этой папке ты будешь запускать {{agent.binary}} — агент увидит проект",
      ],
    },
    { type: "note", text: "Внешний шаг: все команды этого урока выполняются в твоём терминале, не в тренажёре — нужен установленный Node.js. Ниже — разминка в тренажёре, чтобы структура отпечатались в памяти." },
  ],
  steps: [
    {
      id: "s1",
      title: "Разминка: заготовка в тренажёре",
      exercise: {
        type: "terminal",
        task: "Создай скелет проекта: папку tic-tac-toe и в ней package.json, server.js, index.html (пустые через touch).",
        goals: [
          { kind: "fs", assert: { path: "/home/you/tic-tac-toe", exists: true, isDir: true } },
          { kind: "fs", assert: { path: "/home/you/tic-tac-toe/package.json", exists: true } },
          { kind: "fs", assert: { path: "/home/you/tic-tac-toe/server.js", exists: true } },
          { kind: "fs", assert: { path: "/home/you/tic-tac-toe/index.html", exists: true } },
        ],
      },
    },
    {
      id: "s2",
      title: "Проверь себя",
      exercise: {
        type: "quiz",
        question: "Зачем проекту файл package.json?",
        options: [
          "Это паспорт проекта: имя, скрипты и список зависимостей",
          "Там хранится вся история git",
          "Это конфиг браузера",
          "Без него Node.js не запускается вообще",
        ],
        correct: [0],
        explanation: "npm init -y создаёт его автоматически; позже сюда попадут зависимости (например, для WebSocket).",
      },
    },
  ],
};
