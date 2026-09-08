import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "files-and-folders",
    title: "Создаём файлы и папки",
    minutes: 7,
    goal: "Научиться создавать папки и файлы командами mkdir и touch",
    scope: "common",
    skills: ["терминал", "mkdir", "touch"],
  },
  content: [
    {
      type: "p",
      text: "Папки и файлы можно создавать не только мышкой, но и командами. Пригодится, когда ты попросишь AI-агента создать структуру проекта — он будет делать это именно так.",
    },
    { type: "ul", items: ["mkdir <имя> — создать папку", "touch <имя> — создать пустой файл", "ls — проверить результат"] },
    {
      type: "code",
      text: "mkdir notes\ntouch notes/idea.txt\nls notes",
    },
    { type: "note", text: "touch notes/idea.txt создаёт файл idea.txt внутри папки notes. Папка notes должна уже существовать." },
  ],
  steps: [
    {
      id: "s1",
      title: "Создай папку и файл",
      content: [
        { type: "p", text: "Ты в домашней папке /home/you. Создай папку notes, затем внутри неё — файл idea.txt и проверь результат." },
      ],
      exercise: {
        type: "terminal",
        task: "Создай папку notes, внутри неё файл idea.txt и убедись, что файл на месте.",
        hint: "mkdir notes → touch notes/idea.txt → ls notes",
        goals: [
          { kind: "run", match: "mkdir notes" },
          { kind: "fs", assert: { path: "/home/you/notes", exists: true, isDir: true } },
          { kind: "run", match: "touch notes/idea.txt" },
          { kind: "fs", assert: { path: "/home/you/notes/idea.txt", exists: true } },
        ],
      },
    },
    {
      id: "s2",
      title: "Проверь себя",
      exercise: {
        type: "quiz",
        question: "Что произойдёт после команды touch report.txt?",
        options: [
          "Будет создан пустой файл report.txt",
          "Файл report.txt откроется в редакторе",
          "Команда удалит report.txt",
          "Ничего — touch нужен только для папок",
        ],
        correct: [0],
        explanation: "touch создаёт новый пустой файл, а если файл уже есть — просто обновляет время его изменения.",
      },
    },
    {
      id: "s3",
      title: "Заполни пропуски",
      exercise: {
        type: "fill-blank",
        template: "Для создания папки используется команда ____ , а для создания нового пустого файла — команда ____ .",
        blanks: [{ accept: ["mkdir"] }, { accept: ["touch"] }],
        explanation: "mkdir — make directory, touch — создать файл.",
      },
    },
  ],
};
