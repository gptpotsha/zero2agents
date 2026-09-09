import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "going-home",
    title: "Домой: cd ~",
    minutes: 4,
    goal: "Мгновенно возвращаться в домашнюю папку знаком ~",
    scope: "common",
    skills: ["терминал", "cd ~", "тильда"],
  },
  content: [
    {
      type: "p",
      text: "Домашняя папка — твоя база: /home/you. Из любой глубины файловой системы туда можно вернуться одной командой — со знаком тильды.",
    },
    {
      type: "code",
      text: "cd ~          # домой\ncd            # тоже домой (cd без аргумента)\ncd ~/projects # в projects внутри дома",
    },
    {
      type: "p",
      text: "Тильда (~) — короткое имя домашней папки. Терминал даже пишет её вместо полного пути в приглашении: ~ означает «ты дома».",
    },
    { type: "note", text: "cd без аргумента работает как cd ~ — привычка у разработчиков на подсознании." },
  ],
  steps: [
    {
      id: "s1",
      title: "Заблудись и вернись",
      content: [
        { type: "p", text: "Уйди глубоко в подпапки (var/logs/app), затем вернись домой командой cd ~. Проверь pwd." },
      ],
      exercise: {
        type: "terminal",
        task: "Выполни cd var, cd logs, cd app — а затем вернись домой через cd ~ и pwd.",
        fixture: {
          files: { "/home/you/var/logs/app/server.log": "..." },
        },
        goals: [
          { kind: "run", match: "cd var" },
          { kind: "run", match: "cd logs" },
          { kind: "run", match: "cd app" },
          { kind: "run", match: "cd ~" },
          { kind: "fs", assert: { path: "/home/you", exists: true, isDir: true } },
        ],
      },
    },
    {
      id: "s2",
      title: "Проверь себя",
      exercise: {
        type: "quiz",
        question: "Что делает знак ~ в пути?",
        options: [
          "Сокращение для домашней папки",
          "Корень файловой системы",
          "Скрытый файл",
          "Предыдущую папку",
        ],
        correct: [0],
        explanation: "Тильда — синоним /home/you, домашней папки твоего пользователя.",
      },
    },
  ],
};
