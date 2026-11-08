import "server-only";
import { getTelegramBot } from "@/server/telegram/bot";
import { getDb, schema } from "@/lib/db";
import { eq, and, lte, isNotNull } from "drizzle-orm";
import { InlineKeyboard } from "grammy";

/** Интервалы повторения Лейтнера в миллисекундах */
const LEITNER_INTERVALS_MS = [
  1 * 24 * 60 * 60 * 1000,  // Box 1: 1 день
  3 * 24 * 60 * 60 * 1000,  // Box 2: 3 дня
  7 * 24 * 60 * 60 * 1000,  // Box 3: 7 дней
  14 * 24 * 60 * 60 * 1000, // Box 4: 14 дней
  30 * 24 * 60 * 60 * 1000, // Box 5: 30 дней
];

/**
 * 09:00: Утренний дайджест прогресса и мотивация
 */
export async function sendMorningDigests() {
  const bot = getTelegramBot();
  const db = getDb();

  const usersWithTg = db
    .select()
    .from(schema.users)
    .where(and(isNotNull(schema.users.telegram_id), eq(schema.users.bot_blocked, 0)))
    .all();

  const webAppUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zero2agents.com";

  for (const user of usersWithTg) {
    if (!user.telegram_id) continue;

    // Подсчитываем завершенные уроки
    const completedLessons = db
      .select()
      .from(schema.lessonProgress)
      .where(
        and(
          eq(schema.lessonProgress.user_id, user.id),
          eq(schema.lessonProgress.status, "completed"),
        ),
      )
      .all();

    const kb = new InlineKeyboard().webApp("🚀 Продолжить в Mini App", webAppUrl);

    const message =
      `☀️ **Доброе утро, ${user.first_name || user.username}!**\n\n` +
      `📊 Твой прогресс на платформе: **${completedLessons.length}/151 уроков**\n` +
      `🔥 Сохраняй темп обучения и держи стрик!\n\n` +
      `👉 Следующий шаг в твоем плане уже ждет тебя:`;

    try {
      await bot.api.sendMessage(user.telegram_id, message, {
        parse_mode: "Markdown",
        reply_markup: kb,
      });
    } catch (err: any) {
      if (err?.error_code === 403) {
        // Бот заблокирован пользователем
        db.update(schema.users)
          .set({ bot_blocked: 1 })
          .where(eq(schema.users.id, user.id))
          .run();
      }
    }
  }
}

/**
 * Отправка ежедневного контрольного вопроса (SRS)
 */
export async function sendDailySrsQuestions() {
  const bot = getTelegramBot();
  const db = getDb();
  const now = Date.now();

  // Находим карточки, срок повторения которых наступил
  const dueCards = db
    .select({
      card: schema.srsCards,
      user: schema.users,
    })
    .from(schema.srsCards)
    .innerJoin(schema.users, eq(schema.srsCards.user_id, schema.users.id))
    .where(
      and(
        lte(schema.srsCards.next_review_at, now),
        eq(schema.srsCards.status, "pending"),
        isNotNull(schema.users.telegram_id),
      ),
    )
    .all();

  for (const item of dueCards) {
    if (!item.user.telegram_id) continue;

    const kb = new InlineKeyboard()
      .text("A) pwd", `srs_${item.card.id}_pwd`)
      .text("B) ls", `srs_${item.card.id}_ls`)
      .row()
      .text("C) cd", `srs_${item.card.id}_cd`)
      .text("D) whoami", `srs_${item.card.id}_whoami`);

    const text =
      `🧠 **Ежедневный контрольный вопрос для закрепления:**\n\n` +
      `Какая команда выводит текущую рабочую директорию в терминале (точку «Вы находитесь здесь»)?\n\n` +
      `Попытка 1 из 3:`;

    try {
      await bot.api.sendMessage(item.user.telegram_id, text, {
        parse_mode: "Markdown",
        reply_markup: kb,
      });

      db.update(schema.srsCards)
        .set({ status: "active_in_chat" })
        .where(eq(schema.srsCards.id, item.card.id))
        .run();
    } catch (err) {
      console.warn("[SRS Scheduler Error]", err);
    }
  }
}

