import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "websocket-connection",
    title: "Связь игроков: WebSocket",
    minutes: 5,
    goal: "Понять, чем постоянное соединение отличается от обычного HTTP-запроса",
    scope: "common",
    skills: ["websocket", "сети", "концепции"],
  },
  content: [
    {
      type: "p",
      text: "В уровне 5 ты выучил HTTP: запрос → ответ → соединение закрыто. Для игры этого мало: второй игрок должен увидеть ход мгновенно, а не после обновления страницы.",
    },
    {
      type: "ul",
      items: [
        "HTTP — как переписка по почте: спросил — получил ответ — тишина до следующего письма",
        "WebSocket — как телефонный звонок: соединение установлено один раз, обе стороны говорят, когда хотят",
      ],
    },
    {
      type: "code",
      text: "// WebSocket в жизни проекта:\n// браузер: соединение открыто\nws.send(JSON.stringify({ type: 'move', cell: 4 }));\n// сервер: рассылка всем\nwss.clients.forEach(client => client.send(data));",
    },
    { type: "note", text: "WebSocket — тоже HTTP в начале: рукопожатие (handshake) начинается обычным запросом, а потом соединение «апгрейдится» до постоянного. JSON с урока 5 — формат сообщений." },
  ],
  steps: [
    {
      id: "s1",
      title: "Проверь понимание",
      exercise: {
        type: "quiz",
        question: "Почему для мгновенных ходов WebSocket лучше опроса через HTTP?",
        options: [
          "Соединение постоянное — сервер сам доставляет событие без запросов",
          "WebSocket шифрует данные, HTTP — нет",
          "HTTP не умеет передавать текст",
          "WebSocket работает без сервера",
        ],
        correct: [0],
        explanation: "Опрос (polling) = постоянные пустые запросы «ну что там?». WebSocket — сервер сам пушит, когда есть событие.",
      },
    },
    {
      id: "s2",
      title: "Итог",
      content: [
        { type: "p", text: "Механика ясна: сообщение-JSON по постоянному соединению. Следующий урок — соединить этим каналом твои фронт и сервер." },
      ],
    },
  ],
};
