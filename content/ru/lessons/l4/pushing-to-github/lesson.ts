import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "pushing-to-github",
    title: "Выгружаем на GitHub: git push",
    minutes: 4,
    goal: "Понять механику git push — отправки коммитов в облако",
    scope: "common",
    skills: ["git", "git push", "github"],
  },
  content: [
    {
      type: "p",
      text: "git push отправляет твои локальные коммиты на сервер (например, на GitHub). После push копия истории живёт в облаке.",
    },
    {
      type: "code",
      text: "git remote add origin https://github.com/you/my-blog.git  # привязать облако (раз)\ngit push -u origin main                                    # отправить ветку main",
    },
    {
      type: "p",
      text: "remote (удалённый репозиторий) — «адрес» облака, привязанный к твоему проекту. origin — стандартное имя первого remote. -u запоминает связку, чтобы дальше писать просто git push.",
    },
    { type: "note", text: "В тренажёре команды push/pull выводят подсказку: для них нужен реальный аккаунт GitHub. Локальный git здесь — твоя база." },
  ],
  steps: [
    {
      id: "s1",
      title: "Проверь себя",
      exercise: {
        type: "quiz",
        question: "Что делает git push?",
        options: [
          "Отправляет локальные коммиты в удалённый репозиторий",
          "Скачивает изменения из облака",
          "Создаёт новый локальный репозиторий",
          "Показывает историю коммитов",
        ],
        correct: [0],
        explanation: "push = выгрузить. Скачать — pull. Привязать облако — git remote add.",
      },
    },
    {
      id: "s2",
      title: "Мини-практика (локально)",
      exercise: {
        type: "terminal",
        task: "Подготовь проект к пушу: если ещё не сделано — git init, git add ., git commit -m \"Готов к выгрузке\".",
        fixture: {
          files: { "/home/you/my-blog/index.html": "<h1>Блог</h1>" },
        },
        goals: [{ kind: "git", state: "committed" }],
      },
    },
  ],
};
