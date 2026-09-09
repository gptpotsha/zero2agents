import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "staging-changes",
    title: "Выбираем, что сохранить: git add",
    minutes: 5,
    goal: "Понять двухступенчатую модель git: рабочая папка → индекс → коммит",
    scope: "common",
    skills: ["git", "git add", "staging"],
  },
  content: [
    {
      type: "p",
      text: "В git нельзя просто «сохранить всё». Сначала ты выбираешь, ЧТО попадёт в коммит — помещаешь файлы в staging area (индекс). Команда — git add.",
    },
    {
      type: "code",
      text: "git add index.html   # один файл\ngit add .            # все изменения в текущей папке",
    },
    {
      type: "p",
      text: "Зачем эта ступень? Ты можешь менять 10 файлов, но закоммитить осмысленно только 2 из них — те, что относятся к одной задаче. Мелкие понятные коммиты лучше одного гигантского.",
    },
    { type: "note", text: "Проверить, что попало в индекс, — командой git status: раздел «Changes to be committed»." },
  ],
  steps: [
    {
      id: "s1",
      title: "Подготовь файл к коммиту",
      content: [
        { type: "p", text: "В репозитории лежит index.html. Выполни git status — увидишь Untracked files. Затем git add index.html и снова git status." },
      ],
      exercise: {
        type: "terminal",
        task: "git status → git add index.html → git status. Что изменилось?",
        fixture: {
          files: { "/home/you/my-blog/index.html": "<h1>Блог</h1>" },
        },
        goals: [
          { kind: "output", contains: "Untracked files" },
          { kind: "output", contains: "new file:   index.html" },
        ],
      },
    },
    {
      id: "s2",
      title: "Проверь себя",
      exercise: {
        type: "quiz",
        question: "Что делает git add?",
        options: [
          "Помещает файлы в индекс — готовит к коммиту",
          "Сразу сохраняет версию в историю",
          "Добавляет файл на GitHub",
          "Создаёт новый файл",
        ],
        correct: [0],
        explanation: "git add — только подготовка. Сохранение в историю — git commit (следующий урок).",
      },
    },
  ],
};
