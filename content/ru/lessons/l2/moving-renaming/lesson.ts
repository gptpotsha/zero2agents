import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "moving-renaming",
    title: "Перемещаем и переименовываем: mv",
    minutes: 6,
    goal: "Освоить mv — одну команду и для переноса, и для переименования",
    scope: "common",
    skills: ["терминал", "mv", "переименование"],
  },
  content: [
    {
      type: "p",
      text: "mv (move) — «перемести». Но у неё есть вторая профессия: переименование. На самом деле это одно и то же — изменение пути файла.",
    },
    {
      type: "code",
      text: "mv draft.txt final.txt        # переименовать\ncp ... # нет, не так:\nmv draft.txt ~/documents/     # переместить в папку\nmv draft.txt ~/documents/final.txt # и переместить, и переименовать",
    },
    {
      type: "p",
      text: "Схема та же, что у cp: откуда, куда. Разница в результате: mv стирает оригинал, cp — сохраняет.",
    },
    { type: "note", text: "mv не спрашивает разрешения при перезаписи — как и cp. Привычка проверять ls перед mv ещё никому не мешала." },
  ],
  steps: [
    {
      id: "s1",
      title: "Переименуй",
      content: [
        { type: "p", text: "Файл draft.txt пора назвать всерьёз: переименуй его в final.txt через mv." },
      ],
      exercise: {
        type: "terminal",
        task: "Переименуй draft.txt в final.txt.",
        fixture: {
          files: { "/home/you/draft.txt": "черновик" },
        },
        goals: [
          { kind: "fs", assert: { path: "/home/you/final.txt", exists: true, contains: "черновик" } },
          { kind: "fs", assert: { path: "/home/you/draft.txt", exists: false } },
        ],
      },
    },
    {
      id: "s2",
      title: "Перенеси",
      content: [
        { type: "p", text: "Теперь перенеси final.txt в папку archive и проверь ls archive." },
      ],
      exercise: {
        type: "terminal",
        task: "Создай папку archive и перемести в неё final.txt.",
        goals: [
          { kind: "fs", assert: { path: "/home/you/archive", exists: true, isDir: true } },
          { kind: "fs", assert: { path: "/home/you/archive/final.txt", exists: true } },
          { kind: "fs", assert: { path: "/home/you/final.txt", exists: false } },
        ],
      },
    },
    {
      id: "s3",
      title: "Проверь себя",
      exercise: {
        type: "quiz",
        question: "Чем mv отличается от cp?",
        options: [
          "mv стирает оригинал, cp сохраняет",
          "mv работает только с папками",
          "cp стирает оригинал, mv сохраняет",
          "Ничем, это синонимы",
        ],
        correct: [0],
        explanation: "move — перемещение (оригинал исчезает), copy — копирование (оригинал остаётся).",
      },
    },
  ],
};
