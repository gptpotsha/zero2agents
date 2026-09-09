import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "cat-files",
    title: "Заглядываем внутрь файлов",
    minutes: 5,
    goal: "Показывать содержимое текстовых файлов командой cat",
    scope: "common",
    skills: ["терминал", "cat", "файлы"],
  },
  content: [
    {
      type: "p",
      text: "Файл создан — но что в нём? Открывать редактор ради пары строк неудобно. В терминале есть команда, которая просто печатает файл на экран.",
    },
    {
      type: "ul",
      items: [
        "cat <файл> — вывести содержимое файла в терминал",
        "cat <файл1> <файл2> — вывести сразу несколько файлов подряд",
        "cat — сокращение от concatenate, «склеить»: команда задумана, чтобы склеивать и печатать текст",
      ],
    },
    {
      type: "code",
      text: "cat todo.txt\ncat todo.txt notes.txt",
    },
    {
      type: "note",
      text: "cat работает с текстом. Если скормить ему картинку или архив, вместо читаемых строк на экран посыпется «каша» из служебных символов — это нормально, просто файл не текстовый.",
    },
  ],
  steps: [
    {
      id: "s1",
      title: "Посмотри в файл",
      content: [
        {
          type: "p",
          text: "В твоей домашней папке лежит файл todo.txt со списком дел. Выполни команду cat todo.txt и прочитай, что внутри.",
        },
      ],
      exercise: {
        type: "terminal",
        task: "Выполни команду cat todo.txt, чтобы увидеть содержимое файла.",
        hint: "Набери: cat todo.txt — и нажми Enter.",
        fixture: {
          files: {
            "/home/you/todo.txt": "изучить терминал\nнаписать первый скрипт\nпогладить кота",
          },
        },
        goals: [{ kind: "run", match: "cat todo.txt" }],
      },
    },
    {
      id: "s2",
      title: "Несколько файлов сразу",
      content: [
        {
          type: "p",
          text: "Теперь в папке есть и второй файл — diary.txt. Команде cat можно передать несколько имён через пробел, и она выведет их содержимое друг за другом.",
        },
      ],
      exercise: {
        type: "terminal",
        task: "Выполни команду cat todo.txt diary.txt — два файла подряд.",
        hint: "Перечисли оба файла после команды: cat todo.txt diary.txt",
        fixture: {
          files: {
            "/home/you/todo.txt": "изучить терминал\nнаписать первый скрипт",
            "/home/you/diary.txt": "День 1. Оказалось, терминал — это не страшно.",
          },
        },
        goals: [{ kind: "run", match: "cat todo.txt diary.txt" }],
      },
    },
    {
      id: "s3",
      title: "Проверь себя",
      exercise: {
        type: "fill-blank",
        template: "Чтобы напечатать содержимое файла на экран, используется команда ____ . Ей можно передать сразу несколько имён файлов через пробел.",
        blanks: [{ accept: ["cat"] }],
        explanation: "cat — от слова concatenate: команда читает файлы и печатает их текст в терминал.",
      },
    },
  ],
};
