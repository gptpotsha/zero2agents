import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "going-back-up",
    title: "Наверх: cd ..",
    minutes: 4,
    goal: "Подниматься по дереву папок на уровень выше",
    scope: "common",
    skills: ["терминал", "cd ..", "навигация"],
  },
  content: [
    {
      type: "p",
      text: "Зайти в папку — просто. А как выйти обратно? Для этого есть особое имя: две точки.",
    },
    {
      type: "code",
      text: "cd ..        # на уровень выше\ncd ../..     # на два уровня выше\ncd ../photos # вверх, затем сразу в photos",
    },
    {
      type: "p",
      text: "В каждой папке «проживают» две невидимые ссылки: точка (.) — «здесь», две точки (..) — «на уровень выше». Команда cd .. просто говорит: «перейди туда, где написаны две точки».",
    },
    { type: "note", text: "Ты уже видел эти точки: в уроке про ls -a они появлялись в списке скрытых файлов." },
  ],
  steps: [
    {
      id: "s1",
      title: "Вниз и наверх",
      content: [
        { type: "p", text: "Спустись в папку documents, убедись через pwd, что ты там, затем поднимись обратно командой cd .. и снова проверь pwd." },
      ],
      exercise: {
        type: "terminal",
        task: "cd documents → pwd → cd .. → pwd. Где ты в конце?",
        fixture: {
          files: { "/home/you/documents/report.txt": "отчёт" },
        },
        goals: [
          { kind: "run", match: "cd documents" },
          { kind: "run", match: "cd .." },
        ],
      },
    },
    {
      id: "s2",
      title: "Проверь себя",
      exercise: {
        type: "fill-blank",
        instruction: "Впиши команды/обозначения из теории.",
        template: "Чтобы подняться на уровень выше, используется команда ____ . А обозначение текущей папки — одиночный ____ .",
        blanks: [
          { accept: ["cd .."] },
          { accept: [".", "точка"] },
        ],
        explanation: "Две точки (..) — родительская папка, одна точка (.) — текущая.",
      },
    },
  ],
};
