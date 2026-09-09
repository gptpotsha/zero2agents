import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "starting-repo",
    title: "Создаём репозиторий: git init",
    minutes: 5,
    goal: "Превратить обычную папку в git-репозиторий",
    scope: "common",
    skills: ["git", "git init", "репозиторий"],
  },
  content: [
    {
      type: "p",
      text: "Репозиторий — папка, за которой git следит. Внутри неё git создаёт скрытую подпапку .git — там живёт вся история. Команда одна: git init.",
    },
    {
      type: "code",
      text: "cd my-blog\ngit init\n# Initialized empty Git repository in .../my-blog/.git/",
    },
    {
      type: "p",
      text: "После init ничего визуально не изменилось — но теперь git наблюдает за папкой. Проверить это можно командой git status.",
    },
    { type: "note", text: "git init делается один раз на проект, в его корневой папке. Не в домашней папке целиком!" },
  ],
  steps: [
    {
      id: "s1",
      title: "Инициализируй репозиторий",
      content: [
        { type: "p", text: "В папке my-blog выполни git init, затем git status — посмотри, что git думает о твоих файлах." },
      ],
      exercise: {
        type: "terminal",
        task: "Выполни git init в текущей папке, затем git status.",
        fixture: {
          files: { "/home/you/my-blog/index.html": "<h1>Блог</h1>" },
        },
        goals: [
          { kind: "git", state: "repo" },
          { kind: "run", match: "git status" },
          { kind: "output", contains: "No commits yet" },
        ],
      },
    },
    {
      id: "s2",
      title: "Проверь себя",
      exercise: {
        type: "fill-blank",
        template: "Команда ____ превращает папку в репозиторий, а скрытая папка ____ хранит всю историю изменений.",
        blanks: [
          { accept: ["git init"] },
          { accept: [".git"] },
        ],
        explanation: "git init создаёт .git внутри проекта — там живёт история.",
      },
    },
  ],
};
