"use server";

import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { getRegistry } from "@/lib/content/registry";
import { localDate } from "@/server/streaks";
import { revalidatePath } from "next/cache";

export type TestOutResult = { ok: boolean; message?: string; error?: string };

/**
 * Досрочная сдача экзамена уровня экстерном:
 * Все уроки выбранного уровня переводятся в статус completed.
 */
export async function testOutLevelAction(levelId: string): Promise<TestOutResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Сессия истекла — войди заново." };

  const { lessons } = getRegistry();
  const levelLessons = lessons.filter((l) => l.levelId === levelId);
  if (levelLessons.length === 0) {
    return { ok: false, error: "Уровень не найден." };
  }

  const db = getDb();
  const now = Date.now();
  const today = localDate(0);

  // Помечаем все уроки уровня как completed
  for (const l of levelLessons) {
    const lessonId = `${l.levelId}/${l.meta.slug}`;
    const existing = db
      .select({ status: schema.lessonProgress.status })
      .from(schema.lessonProgress)
      .where(
        and(
          eq(schema.lessonProgress.user_id, user.id),
          eq(schema.lessonProgress.lesson_id, lessonId),
        ),
      )
      .get();

    if (!existing) {
      db.insert(schema.lessonProgress)
        .values({
          user_id: user.id,
          lesson_id: lessonId,
          level_id: levelId,
          status: "completed",
          current_step_idx: l.steps.length,
          completed_at: now,
          updated_at: now,
        })
        .run();
    } else if (existing.status !== "completed") {
      db.update(schema.lessonProgress)
        .set({
          status: "completed",
          current_step_idx: l.steps.length,
          completed_at: now,
          updated_at: now,
        })
        .where(
          and(
            eq(schema.lessonProgress.user_id, user.id),
            eq(schema.lessonProgress.lesson_id, lessonId),
          ),
        )
        .run();
    }
  }

  // Фиксируем активность
  db.insert(schema.activityEvents)
    .values({
      id: crypto.randomUUID(),
      user_id: user.id,
      type: "level_tested_out",
      payload: JSON.stringify({ levelId, lessonsCount: levelLessons.length }),
      created_at: now,
      event_date: today,
    })
    .run();

  revalidatePath("/dashboard");
  revalidatePath(`/learn/${levelId}`);
  return { ok: true, message: `Уровень успешно сдан экстерном! Все уроки (${levelLessons.length}) помечены как пройденные.` };
}
