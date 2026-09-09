import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "sql-basics",
    title: "SQL: язык запросов к БД",
    minutes: 5,
    goal: "Понять на уровне идей, как SELECT читает данные, а INSERT добавляет",
    scope: "common",
    skills: ["концепции", "sql", "select", "insert"],
  },
  content: [
    {
      type: "p",
      text: "У каждой базы данных есть свой язык общения — SQL (Structured Query Language, «язык структурированных запросов»). Он не привязан к одному языку программирования: Python, JavaScript, Go — все говорят с БД на SQL.",
    },
    {
      type: "p",
      text: "SQL читается почти как английский. Две главные операции на старте: достать данные и положить данные.",
    },
    {
      type: "h",
      text: "SELECT: достать",
    },
    {
      type: "code",
      text: "SELECT имя, почта FROM customers;\n-- «выбери столбцы имя и почта из таблицы покупателей»\n\nSELECT * FROM orders WHERE сумма > 1000;\n-- «все столбцы заказов, где сумма больше 1000»",
    },
    {
      type: "ul",
      items: [
        "FROM — из какой таблицы берём",
        "WHERE — фильтр: взять только строки, подходящие под условие",
        "* означает «все столбцы»",
      ],
    },
    {
      type: "h",
      text: "INSERT: положить",
    },
    {
      type: "code",
      text: "INSERT INTO customers (имя, почта)\nVALUES ('Аня', 'anya@ex.com');\n-- «добавь в покупателей строку с именем Аня и почтой anya@ex.com»",
    },
    {
      type: "p",
      text: "Есть и обратные операции: UPDATE меняет существующие строки, DELETE удаляет. Чувствуешь параллель с HTTP из прошлых уроков? SELECT — как GET (посмотреть, ничего не меняя), INSERT/UPDATE/DELETE — как POST и его собратья (изменить данные). Идея одна: чтение отдельно от записи.",
    },
    { type: "note", text: "Всё, что ты изучал в этом уровне, складывается в одну картину: браузер (клиент) шлёт HTTP-запрос на endpoint API, backend-код обрабатывает его, делает SQL-запрос к базе и возвращает JSON." },
  ],
  steps: [
    {
      id: "s1",
      title: "Проверь понимание",
      exercise: {
        type: "quiz",
        question: "Нужно получить почты всех покупателей из Санкт-Петербурга. Какой запрос подойдёт?",
        options: [
          "SELECT почта FROM customers WHERE город = 'СПб'",
          "INSERT INTO customers (почта) VALUES ('СПб')",
          "DELETE FROM customers WHERE почта",
          "UPDATE customers SET почта = 'СПб'",
        ],
        correct: [0],
        explanation: "Чтение — это SELECT, таблица — FROM, фильтр по условию — WHERE. Остальные операции меняют данные, а не читают.",
      },
    },
    {
      id: "s2",
      title: "Проверь себя",
      exercise: {
        type: "fill-blank",
        template: "Команда ____ достаёт данные из таблицы, команда ____ добавляет новые строки; фильтр по условию задаёт слово ____.",
        blanks: [
          { accept: ["select"] },
          { accept: ["insert"] },
          { accept: ["where"] },
        ],
        explanation: "SELECT — прочитать, INSERT — добавить, WHERE — оставить только подходящие строки.",
      },
    },
    {
      id: "s3",
      title: "Итог",
      content: [
        { type: "p", text: "Приложение собрано: клиент, сервер, API, база. Осталось вынести его из ноутбука в интернет — начинается облако." },
      ],
    },
  ],
};
