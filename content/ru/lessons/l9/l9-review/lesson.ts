import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "l9-review",
    title: "Ревью уровня 9",
    minutes: 6,
    goal: "Закрепить: зачем навыки, устройство SKILL.md и библиотека навыков — и создать первый файл навыка руками",
    scope: "generic-agent",
    skills: ["{{agent.binary}}", "SKILL.md", "повторение"],
  },
  content: [
    {
      type: "p",
      text: "Уровень 9 научил превращать повторяющиеся просьбы в навыки. Быстрая прикидка перед экзаменом:",
    },
    {
      type: "code",
      text: '---\nname: имя-навыка\ndescription: когда применять — это видит агент всегда\n---\n\n# Инструкции: шаги, чек-листы, примеры',
    },
    {
      type: "ul",
      items: [
        "Навык = записанная один раз инструкция, которую агент применяет сам",
        "Description в шапке решает, когда навык откроется",
        "Личные навыки — дома, проектные — в git рядом с кодом",
      ],
    },
  ],
  steps: [
    {
      id: "s1",
      title: "Мини-экзамен",
      exercise: {
        type: "quiz",
        question: "Что делает description навыка?",
        options: [
          "Помогает агенту понять, когда пора открыть и применить навык",
          "Задает имя файла на диске",
          "Ускоряет загрузку навыка в память",
          "Скрывает навык от других пользователей",
        ],
        correct: [0],
        explanation:
          "Агент всегда видит только шапки всех навыков. Именно описание подсказывает ему: эта ситуация — моя, открываю тело файла.",
      },
    },
    {
      id: "s2",
      title: "Практика: создай файл навыка",
      exercise: {
        type: "terminal",
        task:
          "Собери первый навык: в /home/you создай папку skills, внутри неё — папку page-review, а в ней файл SKILL.md со шапкой навыка (name и description).",
        hint: "mkdir -p skills/page-review, затем echo с перенаправлением > запишет строки в файл.",
        goals: [
          { kind: "fs", assert: { path: "/home/you/skills/page-review/SKILL.md", exists: true } },
          { kind: "fs", assert: { path: "/home/you/skills/page-review/SKILL.md", contains: "name:" } },
        ],
      },
    },
    {
      id: "s3",
      title: "Итог уровня",
      content: [
        {
          type: "p",
          text: "Ты умеешь упаковывать свои правила в переиспользуемые файлы и раскладывать их по личной и командной библиотеке. В уровне 10 подключим к агенту внешний мир: базы данных, браузеры и сервисы — через MCP.",
        },
      ],
    },
  ],
};
