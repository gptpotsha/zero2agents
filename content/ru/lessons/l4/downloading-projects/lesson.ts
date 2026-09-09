import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "downloading-projects",
    title: "Скачиваем проекты: git clone и git pull",
    minutes: 4,
    goal: "Различать clone (первая копия) и pull (обновление)",
    scope: "common",
    skills: ["git", "git clone", "git pull"],
  },
  content: [
    {
      type: "p",
      text: "Две команды для получения кода из облака:",
    },
    {
      type: "ul",
      items: [
        "git clone <адрес> — скачать репозиторий целиком, со всей историей. Делается один раз, когда проекта у тебя ещё нет",
        "git pull — подтянуть новые коммиты в уже склонированный проект. Делается регулярно",
      ],
    },
    {
      type: "p",
      text: "Скачал чужой проект с GitHub — это clone. Коллега запушил изменения, а тебе нужны свежие — это pull.",
    },
    { type: "note", text: "В реальном git clone создаёт папку с именем проекта. Проверено миллионами разработчиков." },
  ],
  steps: [
    {
      id: "s1",
      title: "Проверь понимание",
      exercise: {
        type: "quiz",
        question: "Ты уже склонировал проект неделю назад. Как получить свежие изменения?",
        options: [
          "git pull внутри папки проекта",
          "git clone ещё раз",
          "git init заново",
          "git commit",
        ],
        correct: [0],
        explanation: "clone — один раз для создания копии; pull — каждый раз для обновления.",
      },
    },
    {
      id: "s2",
      title: "Итог",
      content: [
        { type: "p", text: "Поток данных освоен: clone/pull — вниз, commit/push — вверх. Дальше — про ветки: как экспериментировать, не ломая основную версию." },
      ],
    },
  ],
};
