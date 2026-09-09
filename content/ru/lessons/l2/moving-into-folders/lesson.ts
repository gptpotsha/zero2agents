import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "moving-into-folders",
    title: "Переход в папки: cd",
    minutes: 5,
    goal: "Перемещаться по папкам командой cd",
    scope: "common",
    skills: ["терминал", "cd", "навигация"],
  },
  content: [
    {
      type: "p",
      text: "cd (change directory) — «смени папку». Это твои ноги в файловой системе: одна команда — и ты в другой папке.",
    },
    {
      type: "code",
      text: "cd projects   # зайти в папку projects\ncd /home/you   # перейти по полному пути\nls             # оглядеться на новом месте",
    },
    {
      type: "p",
      text: "Путь можно указать двумя способами: относительный (cd projects — из текущей папки) или полный (cd /home/you/projects — от корня). Пока пользуемся относительными.",
    },
    { type: "note", text: "Если имя папки содержит пробел, возьми его в кавычки: cd \"my folder\"." },
  ],
  steps: [
    {
      id: "s1",
      title: "Сходи в гости и вернись",
      content: [
        { type: "p", text: "В домашней папке есть папка photos. Зайди в неё, посмотри содержимое, затем проверь pwd." },
      ],
      exercise: {
        type: "terminal",
        task: "Зайди в папку photos (cd photos) и выполни pwd, чтобы убедиться, где ты.",
        fixture: {
          files: { "/home/you/photos/beach.jpg": "(фото)", "/home/you/photos/mountain.jpg": "(фото)" },
        },
        goals: [
          { kind: "run", match: "cd photos" },
          { kind: "run", match: "pwd" },
        ],
      },
    },
    {
      id: "s2",
      title: "Проверь себя",
      exercise: {
        type: "quiz",
        question: "Как перейти в папку documents из текущей папки?",
        options: [
          "cd documents",
          "ls documents",
          "pwd documents",
          "mkdir documents",
        ],
        correct: [0],
        explanation: "cd — сменить папку; ls только показывает содержимое, pwd — показывает путь.",
      },
    },
  ],
};
