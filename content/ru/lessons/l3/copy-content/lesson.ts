import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "copy-content",
    title: "Копируем содержимое",
    minutes: 4,
    goal: "Копировать содержимое файла в другой файл через cat и перенаправление",
    scope: "common",
    skills: ["терминал", "cat", "редирект", "cp"],
  },
  content: [
    {
      type: "p",
      text: "В прошлом уровне ты копировал файлы командой cp. Но есть и второй способ — через перенаправление: cat печатает содержимое файла, а стрелка направляет этот вывод в новый файл.",
    },
    {
      type: "ul",
      items: [
        "cat файл > новый — прочитать файл и записать его содержимое в новый",
        "cp файл новый — то же самое, но одной командой (ты уже это знаешь)",
        "Так работает и склейка: cat файл1 файл2 > общий — содержимое двух файлов попадёт в третий",
      ],
    },
    {
      type: "code",
      text: "cat poem.txt > poem-copy.txt\ncat part1.txt part2.txt > full.txt",
    },
    {
      type: "note",
      text: "Зачем два способа? cp проще для копии одного файла. Но вариант с cat масштабируется: можно склеить сколько угодно файлов или направить вывод в другую папку — и это фундамент для более сложных приёмов впереди.",
    },
  ],
  steps: [
    {
      id: "s1",
      title: "Сделай копию через cat",
      content: [
        { type: "p", text: "В домашней папке лежит файл recipe.txt. Скопируй его содержимое в файл recipe-backup.txt с помощью cat и стрелки, затем проверь оба файла." },
      ],
      exercise: {
        type: "terminal",
        task: "Выполни cat recipe.txt > recipe-backup.txt и убедись, что копия содержит тот же текст.",
        hint: "cat recipe.txt > recipe-backup.txt — вывод cat уйдёт в новый файл. Проверить можно так: cat recipe-backup.txt",
        fixture: {
          files: {
            "/home/you/recipe.txt": "Блины\n- 2 яйца\n- мука\n- молоко",
          },
        },
        goals: [
          { kind: "fs", assert: { path: "/home/you/recipe-backup.txt", exists: true, contains: "мука" } },
        ],
      },
    },
    {
      id: "s2",
      title: "Склей два файла",
      content: [
        { type: "p", text: "А теперь собери два файла в один: список покупок и список дел должны превратиться в единый plans.txt." },
      ],
      exercise: {
        type: "terminal",
        task: "Выполни cat shopping.txt todo.txt > plans.txt и проверь, что в новом файле есть содержимое обоих.",
        hint: "cat shopping.txt todo.txt > plans.txt — cat выведет оба файла подряд, а стрелка запишет всё в plans.txt",
        fixture: {
          files: {
            "/home/you/shopping.txt": "хлеб\nмолоко",
            "/home/you/todo.txt": "позвонить маме",
          },
        },
        goals: [
          { kind: "fs", assert: { path: "/home/you/plans.txt", exists: true, contains: "молоко" } },
          { kind: "fs", assert: { path: "/home/you/plans.txt", exists: true, contains: "позвонить маме" } },
        ],
      },
    },
    {
      id: "s3",
      title: "Проверь себя",
      exercise: {
        type: "quiz",
        question: "Чем способ cat a.txt > b.txt отличается от cp a.txt b.txt?",
        options: [
          "Результат одинаков, но cat с перенаправлением можно склеить сразу несколько файлов",
          "cat при этом удаляет исходный файл a.txt",
          "cp не умеет копировать содержимое, только имена файлов",
          "cat с перенаправлением работает только в домашних папках",
        ],
        correct: [0],
        explanation: "Оба способа создают копию содержимого, но cat + стрелка допускает несколько источников: cat один два > итог.",
      },
    },
  ],
};
