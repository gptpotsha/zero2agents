import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "deleting-folders",
    title: "Удаляем папки: rm -r",
    minutes: 5,
    goal: "Удалять папки со всем содержимым и понимать риск рекурсии",
    scope: "common",
    skills: ["терминал", "rm -r", "рекурсия"],
  },
  content: [
    {
      type: "p",
      text: "Обычный rm отказывается удалять папку: внутри же файлы! Для папок нужен флаг -r (recursive — «рекурсивно»): удали папку и всё её содержимое, спускаясь по вложенности.",
    },
    {
      type: "code",
      text: "rm -r old-project        # папка и всё внутри\nrm -ri drafts            # с подтверждением каждого файла",
    },
    {
      type: "p",
      text: "Рекурсия означает «повторяй действие для всего внутри». rm -r заглядывает в папку, удаляет каждый файл, заходит во вложенные папки — и так до дна. Это удобно и опасно одновременно.",
    },
    { type: "note", text: "Самая знаменитая ошибка новичков — rm -r не в той папке. Флаг -i превращает удаление в спокойную переписку: «этот? а этот?»." },
  ],
  steps: [
    {
      id: "s1",
      title: "Снеси старое",
      content: [
        { type: "p", text: "Папка old-site больше не нужна. Удали её со всем содержимым и проверь ls, что она исчезла." },
      ],
      exercise: {
        type: "terminal",
        task: "Удали папку old-site целиком (rm -r old-site).",
        fixture: {
          files: {
            "/home/you/old-site/index.html": "<html>старый",
            "/home/you/old-site/old.css": "старые стили",
            "/home/you/new-site/index.html": "<html>новый",
          },
        },
        goals: [
          { kind: "fs", assert: { path: "/home/you/old-site", exists: false } },
          { kind: "fs", assert: { path: "/home/you/new-site/index.html", exists: true } },
        ],
      },
    },
    {
      id: "s2",
      title: "Проверь себя",
      exercise: {
        type: "fill-blank",
        template: "Для удаления папки нужен флаг ____ , потому что rm должен удалить всё содержимое ____ .",
        blanks: [
          { accept: ["-r", "r", "рекурсивно"] },
          { accept: ["вложенное", "внутри", "рекурсивно"] },
        ],
        explanation: "-r заставляет rm спускаться вглубь и удалять каждый файл во вложенности.",
      },
    },
  ],
};
