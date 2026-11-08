import { getDb, schema } from "@/lib/db";
import { eq, and, isNotNull } from "drizzle-orm";
import { getTelegramBot } from "@/server/telegram/bot";
import { InlineKeyboard } from "grammy";

export interface CreateTicketParams {
  userId: string;
  source: "lesson_player" | "bot_question" | "web_comment";
  questionText: string;
  lessonId?: string | null;
}

/**
 * Создаёт тикет поддержки и отправляет мгновенный алерт администраторам в Telegram.
 */
export async function createSupportTicket(params: CreateTicketParams) {
  const db = getDb();
  const ticketId = crypto.randomUUID();
  const now = Date.now();

  const user = db.select().from(schema.users).where(eq(schema.users.id, params.userId)).get();
  if (!user) throw new Error("Пользователь не найден");

  db.insert(schema.supportTickets)
    .values({
      id: ticketId,
      user_id: params.userId,
      source: params.source,
      lesson_id: params.lessonId ?? null,
      question_text: params.questionText,
      status: "open",
      created_at: now,
    })
    .run();

  // Отправляем пуш-уведомление администраторам в Telegram, если бот настроен
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return ticketId;
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://prochatbot.pro";
    const bot = getTelegramBot();

    // Находим всех администраторов с telegram_id
    const admins = db
      .select()
      .from(schema.users)
      .where(and(eq(schema.users.role, "admin"), isNotNull(schema.users.telegram_id)))
      .all();

    // Гарантируем отправку главному администратору @PR0_chatbot (5439779879)
    const adminTgIds = new Set<number>();
    if (admins.length > 0) {
      for (const a of admins) {
        if (a.telegram_id) adminTgIds.add(a.telegram_id);
      }
    }
    adminTgIds.add(5439779879); // potsha / pr0_chatbot

    const sourceLabel =
      params.source === "lesson_player"
        ? `Урок: \`${params.lessonId || "не указан"}\``
        : params.source === "bot_question"
        ? "Telegram-бот (/ask)"
        : "Комментарий на сайте";

    const text =
      `📩 **Новый вопрос от студента!**\n\n` +
      `👤 **${user.username}** ${user.telegram_username ? `(@${user.telegram_username})` : ""}\n` +
      `📍 Источник: ${sourceLabel}\n\n` +
      `❓ **Вопрос:**\n_${params.questionText}_\n\n` +
      `🔖 \`Тикет #${ticketId.slice(0, 8)}\`\n` +
      `💡 _Чтобы ответить, сделай Reply (Ответить) на это сообщение или открой админку:_`;

    const kb = new InlineKeyboard()
      .webApp("🛠 Открыть в админке", `${baseUrl}/admin`)
      .text("✅ Закрыть тикет", `close_ticket_${ticketId}`);

    for (const tgId of adminTgIds) {
      try {
        await bot.api.sendMessage(tgId, text, {
          parse_mode: "Markdown",
          reply_markup: kb,
        });
      } catch (sendErr) {
        console.warn(`[Ticket Alert Error] Не удалось отправить алерт админу ${tgId}:`, sendErr);
      }
    }
  } catch (err) {
    console.warn("[Ticket Push Error]", err);
  }

  return ticketId;
}

/**
 * Обрабатывает ответ администратора на тикет:
 * 1. Сохраняет ответ в БД
 * 2. Доставляет ответ студенту в Telegram (если привязан)
 * 3. Если вопрос был по уроку — публикует ответ в комментарии к уроку
 */
export async function replyToSupportTicket({
  ticketId,
  replyText,
  adminUserId,
}: {
  ticketId: string;
  replyText: string;
  adminUserId?: string;
}) {
  const db = getDb();
  const ticketWithUser = db
    .select({
      ticket: schema.supportTickets,
      user: schema.users,
    })
    .from(schema.supportTickets)
    .innerJoin(schema.users, eq(schema.supportTickets.user_id, schema.users.id))
    .where(eq(schema.supportTickets.id, ticketId))
    .get();

  if (!ticketWithUser) {
    throw new Error("Тикет не найден");
  }

  const { ticket, user } = ticketWithUser;

  // Обновляем тикет
  db.update(schema.supportTickets)
    .set({
      admin_reply: replyText,
      status: "answered",
      answered_at: Date.now(),
      replied_via: user.telegram_id ? "telegram" : "web_comment",
    })
    .where(eq(schema.supportTickets.id, ticketId))
    .run();

  // Если у студента есть Telegram — отправляем ответ прямо в бота
  if (user.telegram_id && process.env.TELEGRAM_BOT_TOKEN) {
    try {
      const bot = getTelegramBot();
      const lessonNotice = ticket.lesson_id ? `📚 К уроку: **${ticket.lesson_id}**\n` : "";
      await bot.api.sendMessage(
        user.telegram_id,
        `✉️ **Преподаватель ответил на твой вопрос!**\n\n` +
          lessonNotice +
          `❓ _«${ticket.question_text}»_\n\n` +
          `💬 **Ответ:**\n${replyText}`,
        { parse_mode: "Markdown" },
      );
    } catch (tgErr) {
      console.warn("[Support Reply TG Send Error]", tgErr);
    }
  }

  // Если вопрос был привязан к уроку — публикуем ответ преподавателя в комментарии урока
  if (ticket.lesson_id) {
    try {
      db.insert(schema.lessonComments)
        .values({
          id: crypto.randomUUID(),
          user_id: adminUserId || user.id,
          lesson_id: ticket.lesson_id,
          author_name: "Преподаватель (Zero2Agents)",
          content: `💬 В ответ на вопрос: «${ticket.question_text}»:\n\n${replyText}`,
          created_at: Date.now(),
        })
        .run();
    } catch (commentErr) {
      console.warn("[Support Reply Comment Insert Error]", commentErr);
    }
  }

  return { ok: true };
}
