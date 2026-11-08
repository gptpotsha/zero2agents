import { randomBytes, randomInt } from "node:crypto";
import { eq, and, gt } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import type { User } from "@/lib/db/schema";

const TOKEN_TTL_MS = 10 * 60 * 1000; // 10 минут

/**
 * Генерирует одноразовый токен и 6-значный код для привязки Telegram к сайту или наоборот.
 */
export async function createLinkToken(
  userId: string,
  purpose: "tg_link" | "web_magic_login" | "email_merge",
): Promise<{ token: string; code: string; expiresAt: number }> {
  const db = getDb();
  const token = `${purpose}_${randomBytes(16).toString("hex")}`;
  const code = randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + TOKEN_TTL_MS;

  db.insert(schema.accountLinkTokens)
    .values({
      id: crypto.randomUUID(),
      user_id: userId,
      token,
      code,
      purpose,
      expires_at: expiresAt,
      used_at: null,
    })
    .run();

  return { token, code, expiresAt };
}

/**
 * Валидирует и сжигает токен привязки по токену или коду.
 */
export async function consumeLinkToken(identifier: {
  token?: string;
  code?: string;
  purpose: "tg_link" | "web_magic_login" | "email_merge";
}): Promise<string | null> {
  const db = getDb();
  const now = Date.now();

  let query = db.select().from(schema.accountLinkTokens);

  let row;
  if (identifier.token) {
    row = query
      .where(
        and(
          eq(schema.accountLinkTokens.token, identifier.token),
          eq(schema.accountLinkTokens.purpose, identifier.purpose),
          gt(schema.accountLinkTokens.expires_at, now),
        ),
      )
      .get();
  } else if (identifier.code) {
    row = query
      .where(
        and(
          eq(schema.accountLinkTokens.code, identifier.code),
          eq(schema.accountLinkTokens.purpose, identifier.purpose),
          gt(schema.accountLinkTokens.expires_at, now),
        ),
      )
      .get();
  }

  if (!row || row.used_at !== null) return null;

  db.update(schema.accountLinkTokens)
    .set({ used_at: now })
    .where(eq(schema.accountLinkTokens.id, row.id))
    .run();

  return row.user_id;
}

/**
 * Атомарное слияние двух профилей в один с объединением прогресса.
 * primaryId — аккаунт, который остаётся основным (например, старый аккаунт с сайта).
 * secondaryId — аккаунт, который объединяется и удаляется (например, временный аккаунт из бота).
 */
export async function mergeUserAccounts(primaryId: string, secondaryId: string): Promise<User> {
  if (primaryId === secondaryId) {
    return getDb().select().from(schema.users).where(eq(schema.users.id, primaryId)).get()!;
  }

  const db = getDb();

  const primaryUser = db.select().from(schema.users).where(eq(schema.users.id, primaryId)).get();
  const secondaryUser = db.select().from(schema.users).where(eq(schema.users.id, secondaryId)).get();

  if (!primaryUser || !secondaryUser) {
    throw new Error("Один из пользователей для слияния не найден");
  }

  db.transaction((tx) => {
    // 1. Слияние прогресса уроков (lesson_progress)
    const secondaryProgress = tx
      .select()
      .from(schema.lessonProgress)
      .where(eq(schema.lessonProgress.user_id, secondaryId))
      .all();

    for (const p of secondaryProgress) {
      const existing = tx
        .select()
        .from(schema.lessonProgress)
        .where(
          and(
            eq(schema.lessonProgress.user_id, primaryId),
            eq(schema.lessonProgress.lesson_id, p.lesson_id),
          ),
        )
        .get();

      if (!existing) {
        tx.insert(schema.lessonProgress)
          .values({
            user_id: primaryId,
            lesson_id: p.lesson_id,
            level_id: p.level_id,
            status: p.status,
            current_step_idx: p.current_step_idx,
            completed_at: p.completed_at,
            updated_at: p.updated_at,
          })
          .run();
      } else {
        // Если у secondary статус completed, а у primary in_progress — повышаем статус
        const shouldComplete = p.status === "completed" && existing.status !== "completed";
        const maxStep = Math.max(existing.current_step_idx, p.current_step_idx);

        if (shouldComplete || maxStep > existing.current_step_idx) {
          tx.update(schema.lessonProgress)
            .set({
              status: shouldComplete ? "completed" : existing.status,
              completed_at: shouldComplete ? (p.completed_at ?? Date.now()) : existing.completed_at,
              current_step_idx: maxStep,
              updated_at: Date.now(),
            })
            .where(
              and(
                eq(schema.lessonProgress.user_id, primaryId),
                eq(schema.lessonProgress.lesson_id, p.lesson_id),
              ),
            )
            .run();
        }
      }
    }

    tx.delete(schema.lessonProgress).where(eq(schema.lessonProgress.user_id, secondaryId)).run();

    // 2. Перенос связанных таблиц: activity_events, notes, srs_cards, support_tickets, lesson_comments, sessions
    tx.update(schema.activityEvents)
      .set({ user_id: primaryId })
      .where(eq(schema.activityEvents.user_id, secondaryId))
      .run();

    tx.update(schema.notes)
      .set({ user_id: primaryId })
      .where(eq(schema.notes.user_id, secondaryId))
      .run();

    tx.update(schema.srsCards)
      .set({ user_id: primaryId })
      .where(eq(schema.srsCards.user_id, secondaryId))
      .run();

    tx.update(schema.supportTickets)
      .set({ user_id: primaryId })
      .where(eq(schema.supportTickets.user_id, secondaryId))
      .run();

    tx.update(schema.lessonComments)
      .set({ user_id: primaryId })
      .where(eq(schema.lessonComments.user_id, secondaryId))
      .run();

    tx.update(schema.sessions)
      .set({ user_id: primaryId })
      .where(eq(schema.sessions.user_id, secondaryId))
      .run();

    tx.update(schema.accountLinkTokens)
      .set({ user_id: primaryId })
      .where(eq(schema.accountLinkTokens.user_id, secondaryId))
      .run();

    // 3. ВАЖНО: сбрасываем уникальные поля у secondary перед обновлением primary,
    // чтобы не нарушить UNIQUE constraint (users.telegram_id / users.email)
    tx.update(schema.users)
      .set({
        telegram_id: null,
        telegram_username: null,
        email: null,
      })
      .where(eq(schema.users.id, secondaryId))
      .run();

    // 4. Обновляем данные Telegram и профиля в основном аккаунте
    tx.update(schema.users)
      .set({
        telegram_id: primaryUser.telegram_id ?? secondaryUser.telegram_id,
        telegram_username: primaryUser.telegram_username ?? secondaryUser.telegram_username,
        first_name: primaryUser.first_name ?? secondaryUser.first_name,
        email: primaryUser.email ?? secondaryUser.email,
        track_id: primaryUser.track_id ?? secondaryUser.track_id,
        role_id: primaryUser.role_id ?? secondaryUser.role_id,
        is_subscribed_channels: Math.max(
          primaryUser.is_subscribed_channels,
          secondaryUser.is_subscribed_channels,
        ),
        onboarding_completed: Math.max(
          primaryUser.onboarding_completed,
          secondaryUser.onboarding_completed,
        ),
      })
      .where(eq(schema.users.id, primaryId))
      .run();

    // 5. Удаляем вторичный профиль
    tx.delete(schema.users).where(eq(schema.users.id, secondaryId)).run();
  });

  return db.select().from(schema.users).where(eq(schema.users.id, primaryId)).get()!;
}

