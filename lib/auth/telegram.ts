import { createHmac } from "node:crypto";
import { eq, or } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import type { User } from "@/lib/db/schema";
import { mergeUserAccounts } from "./account-link";

export interface TelegramAuthData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

/**
 * Валидация Telegram WebApp initData (HMAC-SHA256).
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramInitData(
  initData: string,
  botToken: string,
): { valid: boolean; user?: TelegramAuthData } {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return { valid: false };

    // Собираем data-check-string (все параметры кроме hash, отсортированные по алфавиту)
    params.delete("hash");
    const entries: string[] = [];
    params.forEach((val, key) => {
      entries.push(`${key}=${val}`);
    });
    entries.sort();
    const dataCheckString = entries.join("\n");

    // Секретный ключ для WebApp = HMAC_SHA256("WebAppData", botToken)
    const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();

    // Проверочный HMAC
    const calculatedHash = createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (calculatedHash.toLowerCase() !== hash.toLowerCase()) {
      return { valid: false };
    }

    const userRaw = params.get("user");
    if (!userRaw) return { valid: false };

    const parsedUser = JSON.parse(userRaw) as TelegramAuthData;
    return { valid: true, user: parsedUser };
  } catch {
    return { valid: false };
  }
}

/**
 * Находит существующего пользователя или регистрирует нового по Telegram профилю.
 */
export async function getOrCreateTelegramUser(tgUser: {
  id: number;
  username?: string;
  first_name?: string;
  utm_source?: string;
}): Promise<User> {
  const db = getDb();
  const existing = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.telegram_id, tgUser.id))
    .get();

  if (existing) {
    // Обновляем никнейм или имя, если изменились
    if (
      (tgUser.username && existing.telegram_username !== tgUser.username) ||
      (tgUser.first_name && existing.first_name !== tgUser.first_name)
    ) {
      db.update(schema.users)
        .set({
          telegram_username: tgUser.username ?? existing.telegram_username,
          first_name: tgUser.first_name ?? existing.first_name,
        })
        .where(eq(schema.users.id, existing.id))
        .run();
    }
    return existing;
  }

  // Создаем уникальный username для пользователя
  const baseUsername = tgUser.username?.toLowerCase() || `tg_${tgUser.id}`;
  let finalUsername = baseUsername;
  let counter = 1;

  while (
    db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.username, finalUsername))
      .get()
  ) {
    finalUsername = `${baseUsername}_${counter++}`;
  }

  const userId = crypto.randomUUID();
  const now = Date.now();

  db.insert(schema.users)
    .values({
      id: userId,
      username: finalUsername,
      pass_hash: null, // пользователь Telegram без пароля изначально
      telegram_id: tgUser.id,
      telegram_username: tgUser.username ?? null,
      first_name: tgUser.first_name ?? null,
      utm_source: tgUser.utm_source ?? null,
      created_at: now,
    })
    .run();

  return db.select().from(schema.users).where(eq(schema.users.id, userId)).get()!;
}

