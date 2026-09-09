import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "putting-it-together",
    title: "Собираем всё вместе: проект с нуля",
    minutes: 7,
    goal: "Построить структуру настоящего проекта всеми изученными командами",
    scope: "common",
    skills: ["терминал", "mkdir", "touch", "echo", "структура проекта"],
  },
  content: [
    {
      type: "p",
      text: "Ты знаешь pwd, ls, cd, mkdir, touch, rm, cp, mv. Пора собрать из них настоящее действие разработчика: создание проекта.",
    },
    {
      type: "p",
      text: "Типичный веб-проект выглядит так:",
    },
    {
      type: "code",
      text: "my-blog/\n├── index.html      # главная страница\n├── style.css       # оформление\n├── posts/\n│   └── hello.txt   # записи блога\n└── README.md       # описание проекта",
    },
    { type: "note", text: "Хорошая структура — половина успеха. Папки по смыслу, README всегда, никаких файлов в корне «навалом»." },
  ],
  steps: [
    {
      id: "s1",
      title: "Создай каркас блога",
      content: [
        { type: "p", text: "Создай папку my-blog с папкой posts внутри, а в корне проекта — файлы index.html и README.md." },
      ],
      exercise: {
        type: "terminal",
        task: "Создай структуру: my-blog/, my-blog/posts/, my-blog/index.html, my-blog/README.md.",
        goals: [
          { kind: "fs", assert: { path: "/home/you/my-blog", exists: true, isDir: true } },
          { kind: "fs", assert: { path: "/home/you/my-blog/posts", exists: true, isDir: true } },
          { kind: "fs", assert: { path: "/home/you/my-blog/index.html", exists: true } },
          { kind: "fs", assert: { path: "/home/you/my-blog/README.md", exists: true } },
        ],
      },
    },
    {
      id: "s2",
      title: "Наполни содержимым",
      content: [
        { type: "p", text: "Запиши текст в README через echo с перенаправлением и создай первую запись блога." },
      ],
      exercise: {
        type: "terminal",
        task: "Выполни: echo Мой блог > my-blog/README.md, затем echo Привет, мир > my-blog/posts/hello.txt, и проверь cat'ом.",
        hint: "echo текст > файл — записывает текст в файл (подробнее на уровне 3).",
        goals: [
          { kind: "fs", assert: { path: "/home/you/my-blog/README.md", exists: true, contains: "Мой блог" } },
          { kind: "fs", assert: { path: "/home/you/my-blog/posts/hello.txt", exists: true, contains: "Привет, мир" } },
        ],
      },
    },
    {
      id: "s3",
      title: "Проверь себя",
      exercise: {
        type: "fill-blank",
        template: "Папки создаёт команда ____ , пустые файлы — команда ____ , а посмотреть содержимое файла можно командой cat.",
        blanks: [
          { accept: ["mkdir"] },
          { accept: ["touch"] },
        ],
        explanation: "mkdir — make directory, touch — создать пустой файл.",
      },
    },
  ],
};
