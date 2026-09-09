import type { LessonContent } from "@/lib/content/types";

export const lesson: LessonContent = {
  meta: {
    slug: "grep-pipe-wc",
    title: "Комбинация: grep | wc",
    minutes: 5,
    goal: "Собрать из изученных команд конвейер, который считает совпадения",
    scope: "common",
    skills: ["терминал", "grep", "wc", "pipe", "конвейер"],
  },
  content: [
    {
      type: "p",
      text: "Пора соединить всё, что ты выучил на уровне. Вопрос из реальной жизни: «Сколько раз в логе встречается ошибка?» Ответ даёт конвейер из двух команд.",
    },
    {
      type: "ul",
      items: [
        "grep ERROR server.log — отбирает строки с ошибками",
        "grep ERROR server.log | wc -l — отбирает И сразу считает их количество",
        "Читается так: «найди строки с ERROR и посчитай их»",
      ],
    },
    {
      type: "code",
      text: "grep ERROR server.log\ngrep ERROR server.log | wc -l\ngrep -r TODO . | wc -l",
    },
    {
      type: "note",
      text: "Обрати внимание: промежуточный файл не создаётся. Данные текут из команды в команду прямо в памяти — поэтому конвейеры быстрые и не захламляют папки. Это и есть философия Unix: маленькие команды, которые отлично работают вместе.",
    },
  ],
  steps: [
    {
      id: "s1",
      title: "Quiz: прочитай конвейер",
      exercise: {
        type: "quiz",
        question: "Что покажет команда grep WARNING server.log | wc -l?",
        options: [
          "Сколько строк лога содержат WARNING",
          "Саму строку лога с первым WARNING",
          "Номер строки, где впервые встречается WARNING",
          "Файл WARNING со всеми совпадениями",
        ],
        correct: [0],
        explanation: "grep отберёт подходящие строки, а wc -l посчитает их количество. Вместе — счётчик совпадений.",
      },
    },
    {
      id: "s2",
      title: "Quiz: собери команду из блоков",
      exercise: {
        type: "quiz",
        question: "Ты хочешь узнать, сколько в проекте незакрытых задач (строк со словом TODO во всех файлах). Какая команда верна?",
        options: [
          "grep -r TODO . | wc -l",
          "wc -l TODO | grep .",
          "grep TODO | wc -l .",
          "cat -r TODO | grep -l",
        ],
        correct: [0],
        explanation: "Порядок такой: рекурсивный поиск (-r) по текущей папке (.), затем труба |, затем подсчёт строк (wc -l).",
      },
    },
    {
      id: "s3",
      title: "Заполни пропуски",
      exercise: {
        type: "fill-blank",
        template: "Чтобы посчитать, сколько строк файла содержит слово ERROR, соединяют команды: grep ERROR server.log ____ wc -l . Флаг -l у команды ____ оставляет только число строк.",
        blanks: [{ accept: ["|", "труба"] }, { accept: ["wc"] }],
        explanation: "Конвейер «grep | wc -l» — стандартный способ сосчитать совпадения.",
      },
    },
  ],
};
