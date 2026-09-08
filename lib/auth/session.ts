import "server-only";
import { randomBytes, createHash, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { eq, lt } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import type { User } from "@/lib/db/schema";

export const SESSION_COOKIE = "z2a_session";
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 дней

function sha256hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const now = Date.now();
  await getDb()
    .insert(schema.sessions)
    .values({
      id: randomUUID(),
      user_id: userId,
      token_hash: sha256hex(token),
      expires_at: now + SESSION_TTL_MS,
      created_at: now,
    })
    .run();
  return token;
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await getDb()
      .delete(schema.sessions)
      .where(eq(schema.sessions.token_hash, sha256hex(token)))
      .run();
  }
  jar.delete(SESSION_COOKIE);
}

export type SessionUser = Pick<User, "id" | "username" | "role">;

/** Возвращает пользователя по cookie сессии, иначе null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = getDb();
  const now = Date.now();
  const row = db
    .select({
      session_id: schema.sessions.id,
      expires_at: schema.sessions.expires_at,
      user: {
        id: schema.users.id,
        username: schema.users.username,
        role: schema.users.role,
      },
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.user_id, schema.users.id))
    .where(eq(schema.sessions.token_hash, sha256hex(token)))
    .get();
  if (!row) return null;
  if (row.expires_at < now) {
    await db.delete(schema.sessions).where(eq(schema.sessions.id, row.session_id)).run();
    return null;
  }
  return row.user;
}

/** Подчистка протухших сессий (вызывается изредка). */
export async function cleanupExpiredSessions(): Promise<void> {
  await getDb()
    .delete(schema.sessions)
    .where(lt(schema.sessions.expires_at, Date.now()))
    .run();
}
