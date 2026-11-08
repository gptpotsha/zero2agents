import { getDb, schema } from "@/lib/db";
import { eq, and, sql } from "drizzle-orm";
import { LEITNER_INTERVALS_MS } from "@/server/telegram/scheduler";
import { getLesson } from "@/lib/content/registry";

export interface SrsQuestionData {
  question: string;
  options: string[];
  correctAnswer: string;
  hint1: string; // Концептуальная подсказка (1-я ошибка)
  hint2: string; // Синтаксическая подсказка (2-я ошибка)
  explanation: string; // Полный разбор с ответом (3-я ошибка)
}

const LESSON_QUESTIONS_BANK: Record<string, SrsQuestionData> = {
  "first-commands": {
    question: "Какая команда выводит путь к текущей рабочей директории в терминале («где я нахожусь»)?",
    options: ["pwd", "ls", "cd", "whoami"],
    correctAnswer: "pwd",
    hint1: "Вспомни английскую аббревиатуру: Print Working Directory.",
    hint2: "Команда состоит из трёх строчных букв и начинается на 'p'.",
    explanation: "Команда `pwd` (print working directory) выводит абсолютный путь к текущей папке.",
  },
  "what-is-terminal": {
    question: "Что такое CLI (Command Line Interface) простыми словами?",
    options: [
      "Текстовый интерфейс управления через команды",
      "Оконный графический редактор файлов",
      "Сетевой протокол для браузера",
      "СУБД для хранения данных",
    ],
    correctAnswer: "Текстовый интерфейс управления через команды",
    hint1: "Обрати внимание на слова «Command Line» — ввод строк команд без мыши.",
    hint2: "Это интерфейс на основе ввода текста в окно терминала, в отличие от GUI.",
    explanation: "CLI — интерфейс командной строки, где пользователь вводит текстовые инструкции напрямую в систему.",
  },
  "files-and-folders": {
    question: "Какая команда создаёт новую директорию (папку)?",
    options: ["mkdir", "touch", "cat", "create"],
    correctAnswer: "mkdir",
    hint1: "Сокращение от 'make directory'.",
    hint2: "touch создаёт пустой файл, а для папки команда начинается на 'm'.",
    explanation: "Команда `mkdir <имя>` создаёт новую папку. `touch <имя>` создаёт пустой файл.",
  },
  "git-init": {
    question: "Какая команда инициализирует новый Git-репозиторий в текущей папке?",
    options: ["git init", "git start", "git create", "git clone"],
    correctAnswer: "git init",
    hint1: "Сокращение от английского 'initialize'.",
    hint2: "Шаблон команды: git <действие>. Действие — init.",
    explanation: "Команда `git init` создаёт скрытую папку `.git/` и начинает отслеживание версий.",
  },
  "git-commit": {
    question: "Какая команда добавляет все изменённые файлы в staging area перед фиксацией?",
    options: ["git add .", "git commit -m", "git push", "git save"],
    correctAnswer: "git add .",
    hint1: "Сначала файлы нужно добавить (add) в индекс подготовки.",
    hint2: "Точка '.' означает 'всё в текущей директории': `git add .`.",
    explanation: "`git add .` индексирует все изменения в текущей директории перед выполнением `git commit`.",
  },
  "git-branches": {
    question: "Какая современная команда переключает рабочее дерево на существующую ветку feature?",
    options: ["git switch feature", "git branch feature", "git move feature", "git merge feature"],
    correctAnswer: "git switch feature",
    hint1: "Специальная команда для переключения веток, заменившая неоднозначный checkout.",
    hint2: "Английское слово 'переключить': `switch`.",
    explanation: "`git switch <ветка>` безопасно переключает рабочую копию на указанную ветку.",
  },
  "pipes-and-redirects": {
    question: "Какой оператор передаёт стандартный вывод одной команды на вход другой (конвейер)?",
    options: ["| (pipe)", ">", ">>", "&"],
    correctAnswer: "| (pipe)",
    hint1: "Символ выглядит как вертикальная труба между командами.",
    hint2: "Вертикальная черта на клавиатуре: `|`.",
    explanation: "Символ `|` (пайплайн) соединяет stdout первой команды со stdin второй команды.",
  },
  "system-prompt": {
    question: "Какова главная роль системного промпта (system prompt) для AI-агента?",
    options: [
      "Задать роль, инструменты, правила и ограничения агента",
      "Установить токен доступа к API",
      "Скомпилировать исходный код проекта",
      "Очистить кэш терминала",
    ],
    correctAnswer: "Задать роль, инструменты, правила и ограничения агента",
    hint1: "Это высокоуровневая мета-инструкция, определяющая модель поведения.",
    hint2: "Она задает 'кто ты', 'какие инструменты доступны' и 'что запрещено делать'.",
    explanation: "Системный промпт определяет контекст, доступные инструменты и границы дозволенного для агента.",
  },
};

/**
 * Возвращает вопрос для урока (из банка или генерирует адаптивный).
 */
export function getQuestionForLesson(levelId: string, slug: string): SrsQuestionData {
  if (LESSON_QUESTIONS_BANK[slug]) {
    return LESSON_QUESTIONS_BANK[slug];
  }

  const lesson = getLesson(levelId, slug);
  const title = lesson?.meta.title || slug;
  const skills = lesson?.meta.skills?.join(", ") || "терминал и разработка";

  return {
    question: `В уроке «${title}» отрабатывалась тема: ${skills}. Какое утверждение верно?`,
    options: [
      `Команды урока помогают автоматизировать работу в окружении (${skills})`,
      "Регистр символов в терминале никогда не имеет значения",
      "Все команды терминала всегда выполняются с правами root без спроса",
      "Git удаляет всю историю изменений при создании новой ветки",
    ],
    correctAnswer: `Команды урока помогают автоматизировать работу в окружении (${skills})`,
    hint1: "Подумай о назначении изучаемых инструментов и важности регистра в UNIX.",
    hint2: "В UNIX/Linux регистр критически важен, а команды созданы для автоматизации.",
    explanation: `В уроке «${title}» изучаются основы темы: ${skills}. Инструменты позволяют разработчику быстро и точно автоматизировать действия.`,
  };
}

/**
 * Создаёт или обновляет SRS-карточку в БД при завершении урока студентом.
 */
export async function createOrUpdateSrsCard(userId: string, lessonId: string) {
  const db = getDb();
  const [levelId, slug] = lessonId.includes("/") ? lessonId.split("/") : ["1", lessonId];
  const questionId = slug || lessonId;
  const now = Date.now();

  const existing = db
    .select()
    .from(schema.srsCards)
    .where(and(eq(schema.srsCards.user_id, userId), eq(schema.srsCards.lesson_id, lessonId)))
    .get();

  if (existing) {
    db.update(schema.srsCards)
      .set({
        question_id: questionId,
        status: "pending",
        current_attempts: 0,
        next_review_at: now + 24 * 60 * 60 * 1000,
        updated_at: now,
      })
      .where(eq(schema.srsCards.id, existing.id))
      .run();
    return existing.id;
  }

  const cardId = crypto.randomUUID();
  db.insert(schema.srsCards)
    .values({
      id: cardId,
      user_id: userId,
      lesson_id: lessonId,
      question_id: questionId,
      box: 1,
      next_review_at: now + 24 * 60 * 60 * 1000,
      current_attempts: 0,
      status: "pending",
      created_at: now,
      updated_at: now,
    })
    .run();

  return cardId;
}

export type SrsAnswerResult =
  | { correct: true; box: number; isMastered: boolean }
  | {
      correct: false;
      attempt: number;
      hint?: string;
      explanation?: string;
      correctAnswer?: string;
      lessonUrl?: string;
    };

/**
 * Машина состояний 3-х попыток ответа на SRS-вопрос.
 */
export async function processSrsAnswer(
  cardId: string,
  selectedAnswer: string,
): Promise<SrsAnswerResult> {
  const db = getDb();
  const card = db.select().from(schema.srsCards).where(eq(schema.srsCards.id, cardId)).get();
  if (!card) throw new Error("Карточка не найдена");

  const [levelId, slug] = card.lesson_id.includes("/") ? card.lesson_id.split("/") : ["1", card.lesson_id];
  const qData = getQuestionForLesson(levelId, slug);
  const now = Date.now();

  const isCorrect =
    selectedAnswer.trim().toLowerCase() === qData.correctAnswer.trim().toLowerCase();

  if (isCorrect) {
    const nextBox = Math.min(card.box + 1, 5);
    const interval = LEITNER_INTERVALS_MS[nextBox - 1];
    const isMastered = nextBox >= 5;

    db.update(schema.srsCards)
      .set({
        box: nextBox,
        status: isMastered ? "mastered" : "pending",
        current_attempts: 0,
        next_review_at: now + interval,
        updated_at: now,
      })
      .where(eq(schema.srsCards.id, cardId))
      .run();

    return { correct: true, box: nextBox, isMastered };
  }

  // Ошибка студента
  const newAttempt = card.current_attempts + 1;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://prochatbot.pro";
  const lessonUrl = `${baseUrl}/learn/${card.lesson_id}`;

  if (newAttempt === 1) {
    // 1-я ошибка: Концептуальная подсказка
    db.update(schema.srsCards)
      .set({
        current_attempts: 1,
        updated_at: now,
      })
      .where(eq(schema.srsCards.id, cardId))
      .run();

    return {
      correct: false,
      attempt: 1,
      hint: qData.hint1,
    };
  }

  if (newAttempt === 2) {
    // 2-я ошибка: Синтаксическая подсказка
    db.update(schema.srsCards)
      .set({
        current_attempts: 2,
        updated_at: now,
      })
      .where(eq(schema.srsCards.id, cardId))
      .run();

    return {
      correct: false,
      attempt: 2,
      hint: qData.hint2,
    };
  }

  // 3-я ошибка: Исчерпаны попытки -> Сброс в Box 1, подробный разбор и ссылка на урок
  db.update(schema.srsCards)
    .set({
      box: 1,
      current_attempts: 0,
      status: "pending",
      next_review_at: now + 24 * 60 * 60 * 1000, // Повторим завтра
      updated_at: now,
    })
    .where(eq(schema.srsCards.id, cardId))
    .run();

  return {
    correct: false,
    attempt: 3,
    explanation: qData.explanation,
    correctAnswer: qData.correctAnswer,
    lessonUrl,
  };
}
