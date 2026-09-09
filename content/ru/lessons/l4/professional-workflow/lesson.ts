import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "professional-workflow",
    title: "Как работают профессионалы",
    minutes: 6,
    goal: "Собрать все команды git в единый рабочий цикл",
    scope: "common",
    skills: ["git", "workflow", "практики"],
  },
  content: [
    {
      type: "p",
      text: "Ты знаешь все базовые команды. Вот как они собираются в типичный день разработчика:",
    },
    {
      type: "code",
      text: "git pull                      # 1. обновиться с облака\ngit checkout -b fix-form      # 2. ветка под задачу\n# ... работа, правки ...\ngit status                    # 3. что изменилось?\ngit add .                     # 4. подготовить\ngit commit -m \"Исправил форму\" # 5. сохранить\ngit push                      # 6. выгрузить\n# затем: merge/Pull Request в main",
    },
    {
      type: "ul",
      items: [
        "Одна задача = одна ветка",
        "Маленькие частые коммиты с понятными сообщениями",
        "git status — перед каждым коммитом",
        "Никогда не коммить напрямую в main без ревью (в командах)",
      ],
    },
    { type: "note", text: "Выглядит многословно? Через неделю руки запомнят порядок, и он станет одним плавным движением." },
  ],
  steps: [
    {
      id: "s1",
      title: "Прогони цикл целиком",
      content: [
        { type: "p", text: "Собери профессиональный минимум в тренажёре: init → правка → add → commit → status." },
      ],
      exercise: {
        type: "terminal",
        task: "git init → echo v1 > app.js → git add . → git commit -m \"Первая версия\" → git status.",
        fixture: {
          files: { "/home/you/my-blog/README.md": "# Проект" },
        },
        goals: [
          { kind: "git", state: "committed" },
          { kind: "output", contains: "working tree clean" },
        ],
      },
    },
    {
      id: "s2",
      title: "Проверь себя",
      exercise: {
        type: "quiz",
        question: "Правильный порядок действий при сохранении работы?",
        options: [
          "git status → git add → git commit",
          "git commit → git add → git status",
          "git add → git commit → git init",
          "git push → git commit → git add",
        ],
        correct: [0],
        explanation: "Сначала смотрим, что изменилось; готовим; сохраняем в историю.",
      },
    },
  ],
};
