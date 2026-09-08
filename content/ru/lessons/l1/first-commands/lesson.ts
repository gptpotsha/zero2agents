import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "first-commands",
    title: "Первые команды: pwd, ls, cd",
    minutes: 6,
    goal: "Выполнить первые команды в терминале и понять, где ты находишься",
    scope: "common",
    skills: ["терминал", "pwd", "ls", "cd"],
  },
  content: [
    {
      type: "p",
      text: "Три команды ты будешь использовать постоянно:",
    },
    {
      type: "ul",
      items: [
        "pwd (print working directory) — показывает, в какой папке ты сейчас находишься",
        "ls (list) — показывает содержимое текущей папки",
        "cd <папка> (change directory) — переходит в другую папку",
      ],
    },
    {
      type: "code",
      text: "pwd\nls\ncd project\nls",
    },
    { type: "note", text: "Печатай команду и нажимай Enter. Регистр букв важен: LS и ls — разные команды." },
  ],
  steps: [
    {
      id: "s1",
      title: "Выполни свои первые команды",
      content: [
        {
          type: "p",
          text: "В тренажёре ниже ты находишься в своей домашней папке /home/you. Внутри неё есть папка project. Пройди путь:",
        },
        {
          type: "ul",
          items: [
            "pwd — узнай, где ты",
            "ls — посмотри, что лежит рядом",
            "cd project — зайди в папку project",
            "ls — посмотри её содержимое",
          ],
        },
      ],
      exercise: {
        type: "terminal",
        task: "Выполни команды pwd, ls, затем cd project и ещё раз ls.",
        hint: "Начни с pwd и нажимай Enter после каждой команды. Чтобы перейти в папку, набери: cd project",
        fixture: {
          files: {
            "/home/you/project/hello.py": "print('Привет из терминала!')",
            "/home/you/project/readme.md": "# Проект\nСкоро здесь будет твоя первая программа.",
          },
        },
        goals: [
          { kind: "run", match: "pwd" },
          { kind: "run", match: "ls" },
          { kind: "run", match: "cd project" },
          { kind: "run", match: "ls" },
        ],
      },
    },
    {
      id: "s2",
      title: "Проверь себя",
      content: [
        {
          type: "p",
          text: "Теперь закрепим названия команд:",
        },
      ],
      exercise: {
        type: "fill-blank",
        template: "Чтобы увидеть содержимое папки, используют команду ____ . А команда ____ показывает, где ты сейчас находишься.",
        blanks: [{ accept: ["ls", "list"] }, { accept: ["pwd"] }],
        explanation: "ls — список файлов, pwd — текущий путь.",
      },
    },
    {
      id: "s3",
      title: "Итог",
      content: [
        { type: "p", text: "Ты только что выполнил команды, которые использует каждый разработчик по много раз в день. Дальше — создание файлов и папок." },
      ],
    },
  ],
};
