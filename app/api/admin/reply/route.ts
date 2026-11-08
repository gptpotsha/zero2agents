import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getTelegramBot } from "@/server/telegram/bot";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const dbUser = db.select().from(schema.users).where(eq(schema.users.id, user.id)).get();

    const isAuthorized =
      dbUser?.telegram_username?.toLowerCase() === "pr0_chatbot" ||
      dbUser?.username?.toLowerCase() === "pr0_chatbot" ||
      dbUser?.role === "admin";

    if (!isAuthorized) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const { ticketId, replyText } = await req.json();
    if (!ticketId || !replyText) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

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
      return NextResponse.json({ ok: false, error: "Ticket not found" }, { status: 404 });
    }

    // Обновляем тикет
    db.update(schema.supportTickets)
      .set({
        admin_reply: replyText,
        status: "answered",
        answered_at: Date.now(),
        replied_via: ticketWithUser.user.telegram_id ? "telegram" : "web_comment",
      })
      .where(eq(schema.supportTickets.id, ticketId))
      .run();

    // Если у пользователя есть telegram_id — отправляем ответ прямо в бота
    if (ticketWithUser.user.telegram_id) {
      try {
        const bot = getTelegramBot();
        await bot.api.sendMessage(
          ticketWithUser.user.telegram_id,
          `✉️ **Ответ на твой вопрос:**\n\n` +
            `_«${ticketWithUser.ticket.question_text}»_\n\n` +
            `💬 **Ответ преподавателя:**\n${replyText}`,
          { parse_mode: "Markdown" },
        );
      } catch (tgErr) {
        console.warn("[Admin Reply TG Send Error]", tgErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

