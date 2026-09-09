import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "first-commit",
    title: "Первый коммит: git commit",
    minutes: 5,
    goal: "Сделать первый коммит с осмысленным сообщением",
    scope: "common",
    skills: ["git", "git commit", "сообщения коммитов"],
  },
  content: [
    {
      type: "p",
      text: "Коммит — снимок проекта в истории. Формула: git commit -m \"сообщение\". Флаг -m (message) задаёт пояснение — что и зачем изменилось.",
    },
    {
      type: "code",
      text: 'git commit -m "Добавил главную страницу"\n# [main a1b2c3d] Добавил главную страницу\n#  1 file changed',
    },
    {
      type: "p",
      text: "Хорошее сообщение — в повелительном наклонении и по делу: «Исправил валидацию формы», «Удалил неиспользуемые стили». Плохое: «правки», «qwerty», «fix». Через месяц ты сам не поймёшь, что это было.",
    },
    { type: "note", text: "После коммита git status скажет «working tree clean» — все изменения в истории." },
  ],
  steps: [
    {
      id: "s1",
      title: "Сделай первый коммит",
      content: [
        { type: "p", text: "Файл уже в индексе (staged). Сделай коммит с сообщением «Добавил главную страницу», затем проверь git status." },
      ],
      exercise: {
        type: "terminal",
        task: 'git commit -m "Добавил главную страницу", затем git status.',
        fixture: {
          files: { "/home/you/my-blog/index.html": "<h1>Блог</h1>" },
        },
        goals: [
          { kind: "git", state: "message", message: "Добавил главную страницу" },
          { kind: "output", contains: "working tree clean" },
        ],
      },
    },
    {
      id: "s2",
      title: "Проверь себя",
      exercise: {
        type: "quiz",
        question: "Какое сообщение коммита хорошее?",
        options: [
          "«Исправил валидацию email в форме регистрации»",
          "«правки»",
          "«фикс бага (окончательный) (2)»",
          "«asdfgh»",
        ],
        correct: [0],
        explanation: "Хорошее сообщение отвечает на вопрос «что изменилось и зачем» — его поймёшь даже ты через полгода.",
      },
    },
  ],
};
