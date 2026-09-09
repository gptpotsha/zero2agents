import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "l2-review",
    title: "Ревью уровня 2",
    minutes: 6,
    goal: "Закрепить навигацию и управление файлами перед уровнем 3",
    scope: "common",
    skills: ["повторение", "pwd", "ls", "cd", "mkdir", "touch", "rm", "cp", "mv"],
  },
  content: [
    {
      type: "p",
      text: "Уровень 2 дал тебе полный арсенал работы с файлами. Проверим, что всё осело в голове.",
    },
    {
      type: "code",
      text: "pwd      # где я\nls -a    # что здесь\ncd ..    # наверх\nmkdir -p a/b  # структура\ntouch f  # пустой файл\nrm -r d  # удалить папку\ncp x y   # копия\nmv x y   # переместить/переименовать",
    },
  ],
  steps: [
    {
      id: "s1",
      title: "Мини-экзамен",
      exercise: {
        type: "quiz",
        question: "Ты в /home/you/projects/app и хочешь попасть в /home/you. Какая команда верная?",
        options: [
          "cd ../..",
          "cd ..",
          "cd home/you",
          "cd ~app",
        ],
        correct: [0],
        explanation: "Два уровня вверх: из app в projects, из projects в home-папку. Либо cd ~ — домой сразу.",
      },
    },
    {
      id: "s2",
      title: "Практика на скорость",
      exercise: {
        type: "terminal",
        task: "Собери всё: создай lab/in.txt с текстом данных, скопируй его в lab/out.txt, удали lab/in.txt.",
        hint: "echo данных > lab/in.txt → cp lab/in.txt lab/out.txt → rm lab/in.txt",
        goals: [
          { kind: "fs", assert: { path: "/home/you/lab/in.txt", exists: false } },
          { kind: "fs", assert: { path: "/home/you/lab/out.txt", exists: true, contains: "данных" } },
        ],
      },
    },
    {
      id: "s3",
      title: "Финальный вопрос",
      exercise: {
        type: "quiz",
        question: "Твоя домашняя папка — единственное безопасное место. Что НЕ стоит делать без проверки?",
        options: [
          "Выполнять rm -r, не перечитав команду",
          "Выполнять pwd",
          "Создавать папки с понятными именами",
          "Проверять содержимое через ls",
        ],
        correct: [0],
        explanation: "Рекурсивное удаление без проверки пути — главный источник потерянных файлов.",
      },
    },
  ],
};
