"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export type SettingsState = { ok?: string; error?: string };

/** Сбрасывает весь учебный прогресс текущего пользователя. */
export async function resetProgressAction(): Promise<SettingsState> {
  const user = await getSessionUser();
  if (!user) return { error: "Сессия истекла — войди заново." };

  const db = getDb();
  const res = db
    .delete(schema.lessonProgress)
    .where(eq(schema.lessonProgress.user_id, user.id))
    .run();
  return { ok: res.changes > 0 ? "Прогресс сброшен. Все уроки снова открыты с нуля." : "Прогресса не было — сбрасывать нечего." };
}

const newPasswordSchema = z
  .string()
  .min(8, "Новый пароль должен быть не короче 8 символов")
  .max(128, "Пароль слишком длинный");

/** Смена пароля: проверяем текущий, сохраняем новый хэш. */
export async function changePasswordAction(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { error: "Сессия истекла — войди заново." };

  const current = String(formData.get("current_password") ?? "");
  const next = String(formData.get("new_password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  const parsed = newPasswordSchema.safeParse(next);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (next !== confirm) return { error: "Новый пароль и подтверждение не совпадают." };

  const db = getDb();
  const user = db.select().from(schema.users).where(eq(schema.users.id, sessionUser.id)).get();
  if (!user) return { error: "Пользователь не найден." };
  if (!verifyPassword(current, user.pass_hash)) {
    return { error: "Текущий пароль неверный." };
  }
  if (verifyPassword(next, user.pass_hash)) {
    return { error: "Новый пароль совпадает с текущим." };
  }

  db.update(schema.users)
    .set({ pass_hash: hashPassword(next) })
    .where(eq(schema.users.id, user.id))
    .run();
  return { ok: "Пароль изменён. Используй новый при следующем входе." };
}
