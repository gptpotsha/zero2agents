import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "mcp-config",
    title: "Настраиваем MCP",
    minutes: 6,
    goal: "Разобрать JSON-конфиг MCP-серверов: поля command и args, формат и место хранения файла",
    scope: "generic-agent",
    skills: ["{{agent.binary}}", "MCP", "JSON"],
  },
  content: [
    {
      type: "p",
      text: "Конфиг MCP — обычный JSON-файл со списком серверов. У каждого сервера — имя и способ запуска. Ключевые поля: command (какая команда запускает сервер) и args (аргументы — параметры этой команды).",
    },
    {
      type: "code",
      text: '{\n  "mcpServers": {\n    "browser": {\n      "command": "npx",\n      "args": ["-y", "@model/browser-mcp"]\n    },\n    "sqlite": {\n      "command": "npx",\n      "args": ["-y", "@model/sqlite-mcp", "shop.db"]\n    }\n  }\n}',
    },
    {
      type: "ul",
      items: [
        "Имя сервера («browser») — как агент будет к нему обращаться",
        "command — программа, которая запускает сервер (часто это npx)",
        "args — список параметров: имя пакета, путь к базе, флаги",
      ],
    },
    {
      type: "p",
      text: "Файл обычно называется mcp-config.json (в некоторых агентах — mcp.json) и лежит там же, где мы раскладывали навыки: личный — в домашней папке, проектный — в корне репозитория. Изменил конфиг — перезапусти агента, и новые серверы появятся в его арсенале.",
    },
    {
      type: "note",
      text: "JSON не прощает опечаток: лишняя запятая или кавычка без пары — и конфиг не прочитается. Проверяй синтаксис, если сервер не появился.",
    },
  ],
  steps: [
    {
      id: "s1",
      title: "Проверь понимание",
      exercise: {
        type: "quiz",
        question: "За что отвечают поля command и args в конфиге?",
        options: [
          "command — команда запуска сервера, args — её параметры",
          "command — имя агента, args — его версия",
          "command — название сервиса, args — пароль к нему",
          "command — путь к логам, args — уровень логирования",
        ],
        correct: [0],
        explanation:
          "Конфиг описывает, как именно запустить сервер: сама программа в command и её аргументы списком в args.",
      },
    },
    {
      id: "s2",
      title: "Найди ошибку",
      exercise: {
        type: "fill-blank",
        template:
          "Конфиг MCP пишется в формате ____, у сервера указывают команду запуска (поле ____) и её параметры (поле args).",
        blanks: [
          { accept: ["json"] },
          { accept: ["command", "команда"] },
        ],
        explanation: "JSON-файл, поля command и args — минимальный набор для подключения сервера.",
      },
    },
  ],
};
