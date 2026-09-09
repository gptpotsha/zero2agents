import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "creating-folders",
    title: "Создаём папки: mkdir",
    minutes: 5,
    goal: "Создавать папки командой mkdir и вкладывать их друг в друга",
    scope: "common",
    skills: ["терминал", "mkdir", "структура проекта"],
  },
  content: [
    {
      type: "p",
      text: "mkdir (make directory) — «сделай папку». Одна команда — и новая папка готова.",
    },
    {
      type: "code",
      text: "mkdir projects          # одна папка\nmkdir docs photos       # несколько сразу\nmkdir -p a/b/c          # цепочку вложенных",
    },
    {
      type: "p",
      text: "Флаг -p (parents) создаёт сразу всю цепочку: если папки a нет, mkdir -p a/b/c сделает и a, и a/b, и a/b/c. Без -p команда упадёт с ошибкой — родитель должен существовать.",
    },
    { type: "note", text: "Порядок в имени папки — только буквы, цифры и дефисы. Пробелы и кириллица будут мешать всю жизнь проекта." },
  ],
  steps: [
    {
      id: "s1",
      title: "Построй структуру",
      content: [
        { type: "p", text: "Создай папку projects, а внутри неё — папку my-site. Проверь ls, что всё на месте." },
      ],
      exercise: {
        type: "terminal",
        task: "Создай projects/my-site (двумя командами mkdir или одной с -p) и проверь через ls projects.",
        goals: [
          { kind: "fs", assert: { path: "/home/you/projects", exists: true, isDir: true } },
          { kind: "fs", assert: { path: "/home/you/projects/my-site", exists: true, isDir: true } },
        ],
      },
    },
    {
      id: "s2",
      title: "Проверь себя",
      exercise: {
        type: "quiz",
        question: "Чем mkdir -p a/b/c отличается от mkdir a/b/c?",
        options: [
          "С -p создастся вся цепочка, даже если a нет",
          "Ничем, это синонимы",
          "Без -p папки будут скрытыми",
          "-p защищает от удаления",
        ],
        correct: [0],
        explanation: "Флаг -p (parents) создаёт недостающие родительские папки по всему пути.",
      },
    },
  ],
};
