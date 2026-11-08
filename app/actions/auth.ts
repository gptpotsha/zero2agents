"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { checkRateLimit } from "@/lib/auth/ratelimit";
import { createSession, destroySession, setSessionCookie } from "@/lib/auth/session";
import { consumeLinkToken } from "@/lib/auth/account-link";

export type AuthState = { error?: string };

const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Имя должно быть не короче 3 символов")
  .max(50, "Имя должно быть не длиннее 50 символов");

const passwordSchema = z.string().min(8, "Пароль должен быть не короче 8 символов").max(128);

function formValue(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "");
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  try {
    await checkRateLimit();
  } catch (e) {
    return { error: (e as Error).message };
  }
  const username = usernameSchema.safeParse(formValue(formData, "username"));
  const password = passwordSchema.safeParse(formValue(formData, "password"));
  if (!username.success) return { error: username.error.issues[0].message };
  if (!password.success) return { error: password.error.issues[0].message };

  const db = getDb();
  const existing = db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(or(eq(schema.users.username, username.data), eq(schema.users.email, username.data)))
    .get();
  if (existing) return { error: "Это имя или email уже занято. Придумай другое." };

  const userId = randomUUID();
  const isEmail = username.data.includes("@");

  db.insert(schema.users)
    .values({
      id: userId,
      username: username.data,
      email: isEmail ? username.data : null,
      pass_hash: hashPassword(password.data),
      created_at: Date.now(),
    })
    .run();

  const token = await createSession(userId);
  await setSessionCookie(token);
  redirect("/dashboard");
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  try {
    await checkRateLimit();
  } catch (e) {
    return { error: (e as Error).message };
  }
  const loginInput = usernameSchema.safeParse(formValue(formData, "username"));
  const password = passwordSchema.safeParse(formValue(formData, "password"));
  if (!loginInput.success || !password.success) return { error: "Неверное имя или пароль" };

  const db = getDb();
  // Разрешаем вход как по username, так и по email
  const user = db
    .select()
    .from(schema.users)
    .where(or(eq(schema.users.username, loginInput.data), eq(schema.users.email, loginInput.data)))
    .get();

  if (!user || !user.pass_hash || !verifyPassword(password.data, user.pass_hash)) {
    return { error: "Неверное имя или пароль" };
  }

  const token = await createSession(user.id);
  await setSessionCookie(token);
  redirect("/dashboard");
}

/** Вход по 6-значному коду из бота (/web) */
export async function loginWithMagicCodeAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const code = formValue(formData, "code").trim();
  if (!code || code.length < 5) {
    return { error: "Введи корректный 6-значный код из Telegram-бота." };
  }

  const userId = await consumeLinkToken({ code, purpose: "web_magic_login" });
  if (!userId) {
    return { error: "Код неверен или срок его действия (10 мин) истёк." };
  }

  const token = await createSession(userId);
  await setSessionCookie(token);
  redirect("/dashboard");
}

/** Вход по одноразовой ссылке из бота (/web?magic=...) */
export async function loginWithMagicTokenAction(token: string): Promise<AuthState> {
  if (!token || !token.startsWith("web_magic_login_")) {
    return { error: "Недействительный токен входа." };
  }

  const userId = await consumeLinkToken({ token, purpose: "web_magic_login" });
  if (!userId) {
    return { error: "Ссылка устарела или уже была использована (срок действия 10 минут)." };
  }

  const sessionToken = await createSession(userId);
  await setSessionCookie(sessionToken);
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
