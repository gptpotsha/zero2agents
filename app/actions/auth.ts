"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { checkRateLimit } from "@/lib/auth/ratelimit";
import { createSession, destroySession, setSessionCookie } from "@/lib/auth/session";

export type AuthState = { error?: string };

const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Имя должно быть не короче 3 символов")
  .max(20, "Имя должно быть не длиннее 20 символов")
  .regex(/^[a-z0-9_]+$/, "Только латинские буквы, цифры и подчёркивание");
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
  const existing = db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.username, username.data)).get();
  if (existing) return { error: "Это имя уже занято. Придумай другое." };

  const userId = randomUUID();
  db.insert(schema.users)
    .values({
      id: userId,
      username: username.data,
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
  const username = usernameSchema.safeParse(formValue(formData, "username"));
  const password = passwordSchema.safeParse(formValue(formData, "password"));
  if (!username.success || !password.success) return { error: "Неверное имя или пароль" };

  const db = getDb();
  const user = db.select().from(schema.users).where(eq(schema.users.username, username.data)).get();
  if (!user || !user.pass_hash || !verifyPassword(password.data, user.pass_hash)) {
    return { error: "Неверное имя или пароль" };
  }

  const token = await createSession(user.id);
  await setSessionCookie(token);
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
