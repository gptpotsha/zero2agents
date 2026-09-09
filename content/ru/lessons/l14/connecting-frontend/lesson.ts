import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "connecting-frontend",
    title: "Соединяем фронт и сервер",
    minutes: 6,
    goal: "Через агента связать страницу и сервер и разобрать типичные ошибки",
    scope: "generic-agent",
    skills: ["{{agent.binary}}", "websocket", "отладка"],
  },
  content: [
    {
      type: "p",
      text: "Части готовы: сервер (урок 3), логика (урок 4), страница (урок 5), понимание канала (урок 6). Пора соединить. Запрос агенту:",
    },
    {
      type: "code",
      text: '"Соедини index.html с server.js: при клике по клетке\nотправляй ход по WebSocket, при получении хода — обновляй поле.\nУбедись, что порт в script.js совпадает с портом сервера."',
    },
    {
      type: "p",
      text: "Типичные ошибки первой сборки — и как их читает junior (уровень 13):",
    },
    {
      type: "ul",
      items: [
        "«connection refused» — сервер не запущен: node server.js в отдельном терминале",
        "«WebSocket connection failed» + номер порта — порт в script.js не тот, что слушает сервер",
        "ход виден у одного игрока — сервер забыл разослать сообщение остальным",
      ],
    },
    { type: "note", text: "Внешний шаг: проверяешь у себя — два окна браузера, два хода, оба окна синхронны. Ошибка? Скопируй текст ошибки агенту — он диагностирует (уровень 13, отладка с агентом)." },
  ],
  steps: [
    {
      id: "s1",
      title: "Разминка: заготовка сообщения",
      exercise: {
        type: "terminal",
        task: "Запиши формат сообщения хода в protocol.txt через echo, а внутри — тип move и номер клетки. Затем проверь cat'ом.",
        hint: "JSON из уровня 5 — формат сообщений между игроками.",
        fixture: {
          files: { "/home/you/tic-tac-toe/package.json": "{}" },
        },
        goals: [
          { kind: "fs", assert: { path: "/home/you/tic-tac-toe/protocol.txt", contains: "move" } },
        ],
      },
    },
    {
      id: "s2",
      title: "Проверь себя",
      exercise: {
        type: "quiz",
        question: "Браузер пишет «connection refused». Первая проверка?",
        options: [
          "Запущен ли сервер (node server.js) и тот ли порт",
          "Переустановить браузер",
          "Перезагрузить компьютер",
          "Удалить server.js и написать заново",
        ],
        correct: [0],
        explanation: "Refused = никто не слушает этот порт. Проверь сервер и порт — 90% таких ошибок там.",
      },
    },
  ],
};
