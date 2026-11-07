export interface TestOutQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface LevelExam {
  levelId: string;
  title: string;
  passScore: number; // сколько правильных нужно (например, 3 из 3 или 3 из 4)
  questions: TestOutQuestion[];
}

export const LEVEL_EXAMS: Record<string, LevelExam> = {
  l1: {
    levelId: "l1",
    title: "Экзамен: Компьютеры — это не магия",
    passScore: 3,
    questions: [
      {
        id: "q1",
        question: "Какая команда выведет абсолютный путь текущей папки?",
        options: ["pwd", "ls", "where", "cd"],
        correct: 0,
        explanation: "pwd (print working directory) показывает полный путь к папке, в которой ты находишься.",
      },
      {
        id: "q2",
        question: "Какая команда покажет список файлов и папок в текущей директории?",
        options: ["show", "ls", "dir -all", "list"],
        correct: 1,
        explanation: "ls (list) выводит содержимое текущей папки.",
      },
      {
        id: "q3",
        question: "Как перейти на один уровень выше по дереву папок?",
        options: ["cd ..", "cd -", "cd ~", "cd /"],
        correct: 0,
        explanation: ".. обозначает родительскую директорию (на уровень вверх).",
      },
    ],
  },
  l2: {
    levelId: "l2",
    title: "Экзамен: Первые 30 минут в терминале",
    passScore: 3,
    questions: [
      {
        id: "q1",
        question: "Как создать сразу цепочку вложенных папок project/src/utils одной командой?",
        options: ["mkdir -p project/src/utils", "mkdir -r project/src/utils", "touch project/src/utils", "create project/src/utils"],
        correct: 0,
        explanation: "Флаг -p (parents) создаёт все недостающие промежуточные папки.",
      },
      {
        id: "q2",
        question: "Какая команда удалит папку my-dir со всем её содержимым безвозвратно?",
        options: ["rm -r my-dir", "delete my-dir", "rm my-dir", "rmdir -f my-dir"],
        correct: 0,
        explanation: "rm -r (recursive) рекурсивно удаляет папку и все файлы внутри.",
      },
      {
        id: "q3",
        question: "Чем mv отличается от cp?",
        options: [
          "mv перемещает или переименовывает, cp создаёт копию оригинала",
          "cp удаляет оригинал, mv сохраняет",
          "mv работает только с папками, cp только с файлами",
          "Они делают одно и то же",
        ],
        correct: 0,
        explanation: "mv (move) переносит или переименовывает объект, cp (copy) оставляет исходный файл нетронутым.",
      },
    ],
  },
  l3: {
    levelId: "l3",
    title: "Экзамен: Чтение и запись файлов",
    passScore: 3,
    questions: [
      {
        id: "q1",
        question: "В чём разница между операторами > и >> при перенаправлении вывода?",
        options: [
          "> перезаписывает файл с нуля, а >> дописывает текст в конец файла",
          ">> перезаписывает файл, а > дописывает",
          "> читает файл, >> записывает",
          "> создает папку, >> создает файл",
        ],
        correct: 0,
        explanation: "> перезаписывает содержимое файла, >> делает append (дописывает в хвост).",
      },
      {
        id: "q2",
        question: "Какая команда найдёт все строки со словом ERROR в файле server.log?",
        options: ["grep ERROR server.log", "find ERROR server.log", "search ERROR server.log", "cat ERROR server.log"],
        correct: 0,
        explanation: "grep ищет строки, соответствующие паттерну, в указанном файле.",
      },
      {
        id: "q3",
        question: "Что делает конвейер cat logs.txt | grep 404 | wc -l?",
        options: [
          "Считает количество строк со статусом 404 в файле logs.txt",
          "Удаляет строки 404 из logs.txt",
          "Ищет слово wc в файле 404",
          "Создает файл с именем 404",
        ],
        correct: 0,
        explanation: "Пайплайн передает вывод cat в grep, который оставляет только 404, а wc -l считает строки.",
      },
    ],
  },
  l4: {
    levelId: "l4",
    title: "Экзамен: История кода (Git и GitHub)",
    passScore: 3,
    questions: [
      {
        id: "q1",
        question: "Какая последовательность команд сохраняет новые изменения в историю Git с понятным сообщением?",
        options: [
          "git add . затем git commit -m \"сообщение\"",
          "git save \"сообщение\"",
          "git push -m \"сообщение\"",
          "git init .",
        ],
        correct: 0,
        explanation: "Сначала изменения индексируются (git add), затем фиксируются коммитом (git commit).",
      },
      {
        id: "q2",
        question: "Как посмотреть историю предыдущих коммитов проекта?",
        options: ["git log", "git history", "git status", "git diff"],
        correct: 0,
        explanation: "git log выводит хронологическую цепочку коммитов с их хешами, авторами и сообщениями.",
      },
      {
        id: "q3",
        question: "Что происходит при создании ветки через git branch feature?",
        options: [
          "Создаётся указатель на текущий коммит для параллельной работы",
          "Создается копия папки проекта на диске",
          "Удаляется предыдущая ветка",
          "Файлы загружаются на GitHub",
        ],
        correct: 0,
        explanation: "Ветка в Git — это легковесный указатель на коммит, позволяющий вести независимую разработку.",
      },
    ],
  },
  l5: {
    levelId: "l5",
    title: "Экзамен: Как софт работает на самом деле",
    passScore: 3,
    questions: [
      {
        id: "q1",
        question: "В чём фундаментальное отличие HTTP-запросов GET и POST?",
        options: [
          "GET запрашивает данные для чтения, POST отправляет данные на сервер для создания/изменения",
          "GET только для картинок, POST только для текста",
          "POST быстрее, чем GET",
          "GET работает только по HTTPS",
        ],
        correct: 0,
        explanation: "GET — идемпотентный запрос на чтение; POST передает тело запроса для изменения состояния сервера.",
      },
      {
        id: "q2",
        question: "Что означает HTTP статус-код 404?",
        options: [
          "Запрошенный ресурс или эндпоинт не найден на сервере",
          "Успешное выполнение запроса",
          "Внутренняя фатальная ошибка на сервере",
          "Доступ запрещен (нужна авторизация)",
        ],
        correct: 0,
        explanation: "404 Not Found — сервер понял запрос, но по указанному пути ничего нет.",
      },
      {
        id: "q3",
        question: "Что такое JSON?",
        options: [
          "Текстовый формат обмена данными на основе пар ключ-значение",
          "Язык программирования для баз данных",
          "Протокол шифрования паролей",
          "Бинарный формат изображений",
        ],
        correct: 0,
        explanation: "JSON (JavaScript Object Notation) — универсальный текстовый формат передачи структур данных.",
      },
    ],
  },
  l8: {
    levelId: "l8",
    title: "Экзамен: Твой AI-агент",
    passScore: 3,
    questions: [
      {
        id: "q1",
        question: "Какая папка является контекстом для терминального AI-кодинг-агента?",
        options: [
          "Текущая рабочая папка проекта, откуда запущен агент",
          "Всегда корень диска C:/",
          "Папка Downloads пользователя",
          "Агент не имеет доступа к папкам",
        ],
        correct: 0,
        explanation: "Агент видит файлы репозитория именно той папки, где он был запущен.",
      },
      {
        id: "q2",
        question: "Из каких четырёх частей состоит формула эффективного запроса к агенту?",
        options: [
          "ЧТО сделать + ГДЕ + критерий успеха + контекст/ограничения",
          "Вежливое приветствие + имя модели + дата + смайлик",
          "Только пример кода из StackOverflow",
          "Команда git push + пароль",
        ],
        correct: 0,
        explanation: "Формула: конкретное действие (ЧТО), файл/модуль (ГДЕ), как понять что готово (признак) и ограничения.",
      },
      {
        id: "q3",
        question: "Что агент делает перед внесением изменений в существующий проект?",
        options: [
          "Читает файлы проекта и историю коммитов для понимания контекста",
          "Сразу удаляет все файлы и пишет заново",
          "Спрашивает пароль от GitHub",
          "Отключает интернет",
        ],
        correct: 0,
        explanation: "Агент сначала исследует кодовую базу, существующие соглашения и зависимости.",
      },
    ],
  },
};

export function getExamForLevel(levelId: string): LevelExam | null {
  return LEVEL_EXAMS[levelId] ?? null;
}
