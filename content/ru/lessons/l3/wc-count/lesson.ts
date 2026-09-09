import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "wc-count",
    title: "Считаем строки и слова",
    minutes: 4,
    goal: "Понимать, как команда wc считает строки, слова и символы",
    scope: "common",
    skills: ["терминал", "wc", "подсчёт"],
  },
  content: [
    {
      type: "p",
      text: "wc (word count) — счётчик. Скорми ей файл, и она ответит тремя числами: сколько в файле строк, слов и байт (символов).",
    },
    {
      type: "ul",
      items: [
        "wc файл — вывести три числа: строки, слова, байты",
        "wc -l файл — посчитать только строки (l — lines)",
        "wc -w файл — посчитать только слова (w — words)",
        "wc чаще всего работает в конвейере: cat файл | wc -l",
      ],
    },
    {
      type: "code",
      text: "wc diary.txt\ncat diary.txt | wc -l",
    },
    {
      type: "note",
      text: "Комбинация | wc -l — одна из самых частых в терминале: «сколько строк вернулось?». Например, grep ERROR server.log | wc -l покажет, сколько раз сервер ошибся. Эту связку ты соберёшь руками через два урока.",
    },
  ],
  steps: [
    {
      id: "s1",
      title: "Quiz: порядок чисел",
      exercise: {
        type: "quiz",
        question: "Команда wc notes.txt напечатала: 12 48 630. Что означает первое число?",
        options: [
          "Число строк в файле",
          "Число слов в файле",
          "Число символов в файле",
          "Номер версии файла",
        ],
        correct: [0],
        explanation: "wc выводит числа в порядке: строки, слова, байты. Флаг -l оставляет только первое.",
      },
    },
    {
      id: "s2",
      title: "Заполни пропуски",
      exercise: {
        type: "fill-blank",
        template: "Команда ____ считает строки, слова и символы файла. Флаг ____ оставляет в выводе только число строк.",
        blanks: [{ accept: ["wc"] }, { accept: ["-l"] }],
        explanation: "wc — word count; -l — lines (строки), -w — words (слова).",
      },
    },
  ],
};
