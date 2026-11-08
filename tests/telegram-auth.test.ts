import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import { validateTelegramInitData } from "@/lib/auth/telegram";
import { createLinkToken, consumeLinkToken, mergeUserAccounts } from "@/lib/auth/account-link";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

describe("Telegram WebApp initData validation", () => {
  const botToken = "123456789:ABCdefGHIjklMNOpqrsTUVwxyz";

  it("успешно валидирует корректную подпись initData", () => {
    const userJson = JSON.stringify({
      id: 987654321,
      first_name: "Ivan",
      username: "ivan_dev",
    });

    const authDate = Math.floor(Date.now() / 1000).toString();
    const dataCheckString = `auth_date=${authDate}\nuser=${userJson}`;

    const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
    const hash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

    const initData = `auth_date=${authDate}&user=${encodeURIComponent(userJson)}&hash=${hash}`;

    const res = validateTelegramInitData(initData, botToken);
    expect(res.valid).toBe(true);
    expect(res.user?.id).toBe(987654321);
    expect(res.user?.username).toBe("ivan_dev");
  });

  it("отклоняет неверный hash", () => {
    const initData = `auth_date=123456789&user=${encodeURIComponent('{"id":1}')}&hash=wronghash`;
    const res = validateTelegramInitData(initData, botToken);
    expect(res.valid).toBe(false);
  });
});

describe("Account Link Tokens (createLinkToken & consumeLinkToken)", () => {
  it("создает токен и 6-значный код и успешно потребляет по коду", async () => {
    const db = getDb();
    const testUserId = crypto.randomUUID();

    // Создаем временного пользователя в БД
    db.insert(schema.users)
      .values({
        id: testUserId,
        username: `test_token_user_${Date.now()}`,
        created_at: Date.now(),
      })
      .run();

    const { token, code } = await createLinkToken(testUserId, "tg_link");
    expect(token.startsWith("tg_link_")).toBe(true);
    expect(code).toMatch(/^\d{6}$/);

    // Потребляем по коду
    const consumedUserId = await consumeLinkToken({ code, purpose: "tg_link" });
    expect(consumedUserId).toBe(testUserId);

    // Повторное потребление должно вернуть null (токен уже сожжен)
    const reConsumed = await consumeLinkToken({ code, purpose: "tg_link" });
    expect(reConsumed).toBeNull();
  });
});

describe("mergeUserAccounts (безопасное слияние без конфликта UNIQUE)", () => {
  it("сливает вторичный Telegram-аккаунт в основной веб-аккаунт", async () => {
    const db = getDb();
    const primaryId = crypto.randomUUID();
    const secondaryId = crypto.randomUUID();
    const testTgId = 777000111 + Math.floor(Math.random() * 100000);

    // 1. Создаем primary (веб-пользователь без telegram_id)
    db.insert(schema.users)
      .values({
        id: primaryId,
        username: `primary_user_${Date.now()}`,
        email: `primary_${Date.now()}@example.com`,
        created_at: Date.now(),
      })
      .run();

    // 2. Создаем secondary (telegram-пользователь)
    db.insert(schema.users)
      .values({
        id: secondaryId,
        username: `tg_user_${Date.now()}`,
        telegram_id: testTgId,
        telegram_username: "test_tg_login",
        created_at: Date.now(),
      })
      .run();

    // 3. Создаем прогресс уроков
    db.insert(schema.lessonProgress)
      .values({
        user_id: secondaryId,
        lesson_id: "l01-intro",
        level_id: "1",
        status: "completed",
        current_step_idx: 5,
        completed_at: Date.now(),
        updated_at: Date.now(),
      })
      .run();

    // 4. Запускаем слияние
    const merged = await mergeUserAccounts(primaryId, secondaryId);

    expect(merged.id).toBe(primaryId);
    expect(merged.telegram_id).toBe(testTgId);
    expect(merged.telegram_username).toBe("test_tg_login");

    // Проверяем, что secondaryUser удален
    const deletedSecondary = db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, secondaryId))
      .get();
    expect(deletedSecondary).toBeUndefined();

    // Проверяем, что прогресс перенесен в primary
    const progress = db
      .select()
      .from(schema.lessonProgress)
      .where(eq(schema.lessonProgress.user_id, primaryId))
      .get();
    expect(progress).toBeDefined();
    expect(progress?.status).toBe("completed");
  });
});
