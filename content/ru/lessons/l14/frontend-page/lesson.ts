import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "frontend-page",
    title: "Страница игры",
    minutes: 6,
    goal: "Сгенерировать фронтенд игры через агента и проверить его глазами",
    scope: "generic-agent",
    skills: ["{{agent.binary}}", "html", "фронтенд"],
  },
  content: [
    {
      type: "p",
      text: "Фронтенд — то, что видит игрок: поле 3×3, клики по клеткам, статус партии. Здесь уровень 5 превращается в практику: браузер — клиент, твой server.js — сервер.",
    },
    {
      type: "code",
      text: '# Запрос агенту:\n"Создай index.html с полем 3x3 из кнопок, статусом партии\nи подключением script.js. Стили в style.css: поле по центру,\nкрупные клетки. Без фреймворков — чистый HTML/CSS/JS."',
    },
    {
      type: "p",
      text: "После генерации — человеческая проверка (этап ревью из уровня 13): открой index.html в браузере двойным кликом. Поле видно? Кнопки нажимаются? Если что-то не так — не переписывай сам, вернись к агенту с конкретикой: «клетки слиплись, добавь отступы между ними».",
    },
    { type: "note", text: "Внешний шаг: генерация и открытие в браузере — у себя. Агент меняет файлы, браузер показывает — этот цикл и есть разработка фронтенда." },
  ],
  steps: [
    {
      id: "s1",
      title: "Разминка: каркас страницы",
      exercise: {
        type: "terminal",
        task: "Создай в tic-tac-toe файлы index.html, style.css, script.js (touch) и запиши в index.html заголовок через echo.",
        fixture: {
          files: { "/home/you/tic-tac-toe/package.json": "{}" },
        },
        goals: [
          { kind: "fs", assert: { path: "/home/you/tic-tac-toe/index.html", contains: "Крестики-нолики" } },
          { kind: "fs", assert: { path: "/home/you/tic-tac-toe/style.css", exists: true } },
          { kind: "fs", assert: { path: "/home/you/tic-tac-toe/script.js", exists: true } },
        ],
      },
    },
    {
      id: "s2",
      title: "Проверь себя",
      exercise: {
        type: "fill-blank",
        template: "После генерации фронтенда агентом сделай человеческую ____ : открой страницу в браузере и проверь ____ .",
        blanks: [
          { accept: ["проверку", "ревью"] },
          { accept: ["глазами", "визуально"] },
        ],
        explanation: "Агент генерирует — человек смотрит результат в браузере. Это цикл разработки фронтенда.",
      },
    },
  ],
};
