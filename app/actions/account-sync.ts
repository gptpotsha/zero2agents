"use server";

import { eq, and, ne } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { createLinkToken } from "@/lib/auth/account-link";
import { getTelegramBot } from "@/server/telegram/bot";
import { InlineKeyboard } from "grammy";
import { revalidatePath } from "next/cache";

const emailSchema = z.string().trim().email("Укажи корректный email-адрес");

/** Обновление или привязка Email к текущему аккаунту */
export async function updateEmailAction(
  _prev: { ok?: string; error?: string },
  formData: FormData,
): Promise<{ ok?: string; error?: string }> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { error: "Сессия истекла — войди заново." };

  const rawEmail = String(formData.get("email") ?? "").toLowerCase();
  const parsed = emailSchema.safeParse(rawEmail);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const db = getDb();

  // Проверяем, не занят ли email другим пользователем
  const existing = db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(and(eq(schema.users.email, parsed.data), ne(schema.users.id, sessionUser.id)))
    .get();

  if (existing) {
    return { error: "Этот email уже привязан к другому аккаунту." };
  }

  // При сохранении нового email сбрасываем статус верификации
  db.update(schema.users)
    .set({ email: parsed.data, email_verified: 0 })
    .where(eq(schema.users.id, sessionUser.id))
    .run();

  revalidatePath("/settings");

  // Автоматически отправляем запрос на подтверждение в Telegram, если бот привязан
  await sendEmailVerificationRequestAction();

  return { ok: "Email сохранен. В Telegram-бот отправлена кнопка подтверждения!" };
}

/** Отправка запроса на верификацию Email через привязанного Telegram-бота */
export async function sendEmailVerificationRequestAction(): Promise<{ ok: boolean; error?: string }> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { ok: false, error: "Сессия истекла." };

  const db = getDb();
  const user = db.select().from(schema.users).where(eq(schema.users.id, sessionUser.id)).get();

  if (!user || !user.email) {
    return { ok: false, error: "Email не указан." };
  }

  if (!user.telegram_id) {
    return { ok: false, error: "Сначала привяжите Telegram-бота, чтобы подтвердить Email в 1 клик." };
  }

  try {
    const bot = getTelegramBot();
    const kb = new InlineKeyboard()
      .text("✅ Подтвердить Email", `verify_email_${user.id}`)
      .text("❌ Отклонить", "cancel_email_verify");

    await bot.api.sendMessage(
      user.telegram_id,
      `🔐 **Запрос на подтверждение Email:**\n\n` +
        `К твоему аккаунту привязывается адрес: \`${user.email}\`\n\n` +
        `Если это сделал ты, нажми кнопку ниже:`,
      { parse_mode: "Markdown", reply_markup: kb },
    );

    return { ok: true };
  } catch (err) {
    return { ok: false, error: "Не удалось отправить сообщение в Telegram: " + (err as Error).message };
  }
}

/** Создание одноразовой ссылки и 6-значного кода для привязки Telegram */
export async function generateTgLinkAction(): Promise<{
  ok: boolean;
  link?: string;
  code?: string;
  error?: string;
}> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { ok: false, error: "Сессия истекла." };

  try {
    const { token, code } = await createLinkToken(sessionUser.id, "tg_link");
    const botUsername = "ZeroToAgent_bot";
    const link = `https://t.me/${botUsername}?start=${token}`;
    return { ok: true, link, code };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
