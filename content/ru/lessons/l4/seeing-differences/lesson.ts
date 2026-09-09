import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "seeing-differences",
    title: "Что изменилось: git status и сравнение",
    minutes: 5,
    goal: "Научиться узнавать состояние файлов до и после правок",
    scope: "common",
    skills: ["git", "git status", "диагностика"],
  },
  content: [
    {
      type: "p",
      text: "git status — твой приборная панель. Она всегда отвечает на три вопроса: что изменено, что подготовлено к коммиту, что вообще не отслеживается.",
    },
    {
      type: "ul",
      items: [
        "Untracked files — файл есть, но git за ним не следит (нужен git add)",
        "Changes not staged — отслеживается, но изменился после коммита (нужен git add)",
        "Changes to be committed — в индексе, готов к git commit",
        "working tree clean — всё сохранено в истории",
      ],
    },
    { type: "note", text: "Привычка профессионалов: git status перед каждым коммитом. Десять секунд — и ты точно знаешь, что сейчас сохранишь." },
  ],
  steps: [
    {
      id: "s1",
      title: "Диагностика запущенного проекта",
      content: [
        { type: "p", text: "В репозитории: два закоммиченных файла, один изменён, один новый без add. Разберись через git status, что где." },
      ],
      exercise: {
        type: "terminal",
        task: "git status — выясни состояние всех файлов.",
        fixture: {
          files: {
            "/home/you/my-blog/index.html": "<h1>Блог v3</h1>",
            "/home/you/my-blog/style.css": "body { color: navy }",
            "/home/you/my-blog/draft.md": "черновик записи",
          },
        },
        goals: [
          { kind: "git", state: "has-commits" },
          { kind: "output", contains: "modified:   index.html" },
          { kind: "output", contains: "draft.md" },
        ],
      },
    },
    {
      id: "s2",
      title: "Проверь себя",
      exercise: {
        type: "quiz",
        question: "git status показывает файл в разделе Untracked. Что это значит?",
        options: [
          "Файл новый — git о нём ещё не знает",
          "Файл удалён",
          "Файл готов к коммиту",
          "Файл повреждён",
        ],
        correct: [0],
        explanation: "Untracked = существует в папке, но не входит в историю. Лечится git add.",
      },
    },
  ],
};
