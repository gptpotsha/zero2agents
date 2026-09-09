import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "creating-files",
    title: "Создаём файлы: touch",
    minutes: 5,
    goal: "Создавать пустые файлы командой touch",
    scope: "common",
    skills: ["терминал", "touch", "файлы"],
  },
  content: [
    {
      type: "p",
      text: "touch — «создай пустой файл». Имя забавное: исторически команда «дотрагивалась» до файла, обновляя время его изменения. Если файла нет — он создаётся, если есть — просто обновляется метка времени.",
    },
    {
      type: "code",
      text: "touch index.html      # создать файл\ntouch a.txt b.txt     # несколько сразу\ntouch notes/todo.txt  # внутри существующей папки",
    },
    { type: "note", text: "Пустой файл — это нормально: его содержимое скоро наполнится. Сначала скелет проекта, потом мясо." },
  ],
  steps: [
    {
      id: "s1",
      title: "Собери скелет сайта",
      content: [
        { type: "p", text: "В папке my-site создай три файла: index.html, style.css, script.js. Затем проверь ls my-site." },
      ],
      exercise: {
        type: "terminal",
        task: "Создай в my-site три файла: index.html, style.css, script.js.",
        fixture: {
          files: { "/home/you/my-site/.keep": "" },
        },
        goals: [
          { kind: "fs", assert: { path: "/home/you/my-site/index.html", exists: true } },
          { kind: "fs", assert: { path: "/home/you/my-site/style.css", exists: true } },
          { kind: "fs", assert: { path: "/home/you/my-site/script.js", exists: true } },
        ],
      },
    },
    {
      id: "s2",
      title: "Проверь себя",
      exercise: {
        type: "fill-blank",
        template: "Команда ____ создаёт новый пустой файл, а если файл уже существует — обновляет только время его ____ .",
        blanks: [
          { accept: ["touch"] },
          { accept: ["изменения", "модификации"] },
        ],
        explanation: "Второе имя touch — «дотронуться»: файл получает свежую метку времени.",
      },
    },
  ],
};
