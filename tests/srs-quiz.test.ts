import { describe, expect, it } from "vitest";
import { getDb, schema } from "@/lib/db";
import { createOrUpdateSrsCard, processSrsAnswer } from "@/lib/srs/service";
import { eq } from "drizzle-orm";

describe("SRS Leitner Quiz State Machine (3 attempts & hints)", () => {
  it("создаёт SRS-карточку для завершённого урока", async () => {
    const db = getDb();
    const testUserId = crypto.randomUUID();

    db.insert(schema.users)
      .values({
        id: testUserId,
        username: `srs_student_${Date.now()}`,
        created_at: Date.now(),
      })
      .run();

    const cardId = await createOrUpdateSrsCard(testUserId, "l1/first-commands");
    expect(cardId).toBeDefined();

    const card = db.select().from(schema.srsCards).where(eq(schema.srsCards.id, cardId)).get();
    expect(card).toBeDefined();
    expect(card?.question_id).toBe("first-commands");
    expect(card?.box).toBe(1);
    expect(card?.current_attempts).toBe(0);
  });

  it("проходит полный цикл 3-х попыток с прогрессивными подсказками при ошибках", async () => {
    const db = getDb();
    const testUserId = crypto.randomUUID();

    db.insert(schema.users)
      .values({
        id: testUserId,
        username: `srs_fail_student_${Date.now()}`,
        created_at: Date.now(),
      })
      .run();

    const cardId = await createOrUpdateSrsCard(testUserId, "l1/first-commands");

    // Попытка 1: Неверный ответ (ls) -> должна выдаваться концептуальная подсказка hint1
    const res1 = await processSrsAnswer(cardId, "ls");
    expect(res1.correct).toBe(false);
    if (!res1.correct) {
      expect(res1.attempt).toBe(1);
      expect(res1.hint).toContain("Print Working Directory");
    }

    // Попытка 2: Снова неверный ответ (cd) -> должна выдаваться синтаксическая подсказка hint2
    const res2 = await processSrsAnswer(cardId, "cd");
    expect(res2.correct).toBe(false);
    if (!res2.correct) {
      expect(res2.attempt).toBe(2);
      expect(res2.hint).toContain("начинается на 'p'");
    }

    // Попытка 3: Третья ошибка (whoami) -> исчерпаны попытки, сброс в Box 1, выдается разбор и правильный ответ
    const res3 = await processSrsAnswer(cardId, "whoami");
    expect(res3.correct).toBe(false);
    if (!res3.correct) {
      expect(res3.attempt).toBe(3);
      expect(res3.correctAnswer).toBe("pwd");
      expect(res3.explanation).toContain("pwd");
      expect(res3.lessonUrl).toContain("/learn/l1/first-commands");
    }

    const cardAfterFail = db
      .select()
      .from(schema.srsCards)
      .where(eq(schema.srsCards.id, cardId))
      .get();
    expect(cardAfterFail?.box).toBe(1);
    expect(cardAfterFail?.current_attempts).toBe(0);
  });

  it("при правильном ответе повышает Box и рассчитывает следующий интервал", async () => {
    const db = getDb();
    const testUserId = crypto.randomUUID();

    db.insert(schema.users)
      .values({
        id: testUserId,
        username: `srs_pass_student_${Date.now()}`,
        created_at: Date.now(),
      })
      .run();

    const cardId = await createOrUpdateSrsCard(testUserId, "l1/first-commands");

    const res = await processSrsAnswer(cardId, "pwd");
    expect(res.correct).toBe(true);
    if (res.correct) {
      expect(res.box).toBe(2);
      expect(res.isMastered).toBe(false);
    }

    const updatedCard = db
      .select()
      .from(schema.srsCards)
      .where(eq(schema.srsCards.id, cardId))
      .get();
    expect(updatedCard?.box).toBe(2);
  });
});
