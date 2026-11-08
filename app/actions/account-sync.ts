"use server";

import { eq, and, ne } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { createLinkToken } from "@/lib/auth/account-link";
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

  db.update(schema.users)
    .set({ email: parsed.data })
    .where(eq(schema.users.id, sessionUser.id))
    .run();

  revalidatePath("/settings");
  return { ok: "Email успешно сохранен и привязан к аккаунту." };
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
