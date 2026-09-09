import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "l4-review",
    title: "Ревью уровня 4",
    minutes: 6,
    goal: "Закрепить git: репозиторий, индекс, коммиты, история",
    scope: "common",
    skills: ["git", "повторение"],
  },
  content: [
    {
      type: "p",
      text: "Уровень 4 дал тебе суперсилу: история версий. Соберём карту команд.",
    },
    {
      type: "code",
      text: "git init            # создать репозиторий\ngit status          # что происходит?\ngit add <файл|.>    # в индекс\ngit commit -m \"…\"   # снимок в историю\ngit log             # дневник проекта\ngit branch/switch   # ветки (концепт)",
    },
  ],
  steps: [
    {
      id: "s1",
      title: "Теория под давлением",
      exercise: {
        type: "quiz",
        question: "Файл изменён, но git status не показывает его в «Changes to be committed». Что произошло?",
        options: [
          "Забыли git add после правки",
          "Файл закоммичен слишком много раз",
          "Git удалил файл из истории",
          "Нужен git init заново",
        ],
        correct: [0],
        explanation: "Правка в рабочей папке не попадает в индекс сама — всегда нужен git add.",
      },
    },
    {
      id: "s2",
      title: "Практика: два проекта",
      exercise: {
        type: "terminal",
        task: "Создай папку lab с файлом a.txt, сделай репозиторий и два коммита: «файл a» (после создания) и «правка a» (после echo правка > lab/a.txt — не забудь git add).",
        hint: "mkdir lab → touch... точнее echo текст > lab/a.txt → git init → git add . → commit → echo правка > lab/a.txt → git add . → commit",
        goals: [
          { kind: "git", state: "clean" },
          { kind: "fs", assert: { path: "/home/you/lab/a.txt", contains: "правка" } },
        ],
      },
    },
    {
      id: "s3",
      title: "Итог уровня",
      content: [
        { type: "p", text: "Ты умеешь держать под контролем версии любого проекта. Уровень 5 — «Как софт работает на самом деле»: клиент, сервер, API, база данных." },
      ],
    },
  ],
};
