import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "l12-review",
    title: "Ревью уровня 12",
    minutes: 6,
    goal: "Закрепить: субагенты, worktrees, бюджет, headless — и финальная практика",
    scope: "generic-agent",
    skills: ["{{agent.binary}}", "git", "повторение"],
  },
  content: [
    {
      type: "p",
      text: "Финальный уровень курса — про масштаб: много агентов, много копий, ноль человек за экраном. Шпаргалка:",
    },
    {
      type: "code",
      text: "# Продвинутые приёмы в одну таблицу\n\nСубагент        = чистый контекст на черновую работу\ngit worktree    = вторая рабочая копия на другую ветку\nAPI-счёт        = платишь за объём контекста\nHeadless-режим  = агент как шаг скрипта или CI",
    },
  ],
  steps: [
    {
      id: "s1",
      title: "Мини-экзамен",
      exercise: {
        type: "quiz",
        question: "Ты хочешь править два файла параллельно: один агент — на ветке main, другой — на ветке feature. Что использовать?",
        options: [
          "Два git worktree одного репозитория",
          "Два полных клона из интернета",
          "Одну папку и двух агентов в ней же",
          "Почтовую переписку между ветками",
        ],
        correct: [0],
        explanation:
          "Worktree даёт вторую папку на другую ветку при общей истории — без клонов и без конфликтов между агентами.",
      },
    },
    {
      id: "s2",
      title: "Финальная практика",
      exercise: {
        type: "terminal",
        task: "Собери финальный проект: папку pipeline с файлом конфига CONFIG.md (строка «Режим: headless»), git-репозиторий и коммит «Готов к автономии».",
        hint: "mkdir pipeline → echo \"Режим: headless\" > pipeline/CONFIG.md → cd pipeline → git init → git add . → git commit -m \"Готов к автономии\"",
        goals: [
          { kind: "fs", assert: { path: "/home/you/pipeline/CONFIG.md", exists: true, contains: "Режим: headless" } },
          { kind: "git", state: "message", message: "Готов к автономии" },
          { kind: "git", state: "clean" },
        ],
      },
    },
    {
      id: "s3",
      title: "Итог курса",
      content: [
        { type: "p", text: "Ты прошёл путь от терминала до автономных агентов: {{agent.name}} для тебя — инструмент, у которого ты знаешь контекст, память, границы и цену. Дальше — практика на настоящих проектах: формула одна, задачи будут только сложнее." },
      ],
    },
  ],
};
