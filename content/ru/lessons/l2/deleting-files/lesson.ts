import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "deleting-files",
    title: "Удаляем файлы: rm",
    minutes: 5,
    goal: "Удалять файлы командой rm и понять, почему это опасно",
    scope: "common",
    skills: ["терминал", "rm", "осторожность"],
  },
  content: [
    {
      type: "p",
      text: "rm (remove) — «удали». Команда мгновенная и безжалостная: корзины нет, файл исчезает навсегда.",
    },
    {
      type: "code",
      text: "rm junk.txt        # удалить файл\nrm a.txt b.txt     # несколько\nrm -i important.txt # спросить подтверждение",
    },
    {
      type: "p",
      text: "Правило безопасности: перед rm прочитай команду ещё раз. Ошибка вроде rm backup old (без дефиса между ними) удаляет не то, что ты хотел. Флаг -i (interactive) попросит подтвердить каждый файл.",
    },
    { type: "note", text: "В нашем тренажёре можно ошибаться сколько угодно — среда пересоздаётся. В реальном терминале rm обратной силы не имеет." },
  ],
  steps: [
    {
      id: "s1",
      title: "Наведи порядок",
      content: [
        { type: "p", text: "В папке лежит временный файл temp-draft.txt. Удали его и убедись через ls, что он исчез." },
      ],
      exercise: {
        type: "terminal",
        task: "Удали temp-draft.txt и проверь, что файл исчез.",
        fixture: {
          files: {
            "/home/you/temp-draft.txt": "черновик",
            "/home/you/final.txt": "финальная версия",
          },
        },
        goals: [
          { kind: "fs", assert: { path: "/home/you/temp-draft.txt", exists: false } },
          { kind: "fs", assert: { path: "/home/you/final.txt", exists: true } },
        ],
      },
    },
    {
      id: "s2",
      title: "Проверь себя",
      exercise: {
        type: "quiz",
        question: "Что произойдёт с файлом после rm?",
        options: [
          "Исчезнет навсегда — корзины нет",
          "Попадёт в корзину терминала",
          "Переименуется в .deleted",
          "Ничего, rm только показывает файлы",
        ],
        correct: [0],
        explanation: "Удаление мгновенное и необратимое — поэтому перед rm всегда перечитывай команду.",
      },
    },
  ],
};
