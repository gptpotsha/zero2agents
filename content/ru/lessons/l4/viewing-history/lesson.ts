import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "viewing-history",
    title: "Смотрим историю: git log",
    minutes: 5,
    goal: "Листать историю проекта командой git log",
    scope: "common",
    skills: ["git", "git log", "история"],
  },
  content: [
    {
      type: "p",
      text: "Каждый коммит — запись в дневнике проекта: уникальный идентификатор, автор, дата и сообщение. Команда git log показывает их от нового к старому.",
    },
    {
      type: "code",
      text: "git log\n# commit a1b2c3d...\n# Author: you <you@example.com>\n# Date:   ...\n#\n#     Обновил заголовок",
    },
    {
      type: "p",
      text: "Длинный идентификатор коммита (хэш) — адрес снимка в истории. Именно по нему git находит нужную версию, когда ты захочешь к ней вернуться.",
    },
    { type: "note", text: "Выход из полного просмотра лога (в настоящем git) — клавиша q. В тренажёре всё видно сразу." },
  ],
  steps: [
    {
      id: "s1",
      title: "Пролистай дневник",
      content: [
        { type: "p", text: "В репозитории два коммита. Выполни git log и найди сообщение первого из них." },
      ],
      exercise: {
        type: "terminal",
        task: "git log — прочитай историю проекта.",
        fixture: {
          files: { "/home/you/my-blog/index.html": "<h1>Блог v2</h1>" },
        },
        goals: [
          { kind: "git", state: "has-commits" },
          { kind: "output", contains: "commit " },
        ],
      },
    },
    {
      id: "s2",
      title: "Проверь себя",
      exercise: {
        type: "fill-blank",
        template: "Команда ____ показывает историю коммитов, а уникальный ____ коммита позволяет найти его в истории.",
        blanks: [
          { accept: ["git log"] },
          { accept: ["хэш", "идентификатор", "hash"] },
        ],
        explanation: "git log — история; хэш — адрес снимка.",
      },
    },
  ],
};
