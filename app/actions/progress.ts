"use server";

import { and, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { getLesson } from "@/lib/content/registry";
import { recordActivity, localDate } from "@/server/streaks";

async function requireUser() {
  return getSessionUser();
}

/** Сохраняет индекс последнего пройденного шага (курсор для resume). */
export async function saveLessonStep(
  levelId: string,
  slug: string,
  stepIdx: number,
): Promise<{ ok: boolean }> {
  const user = await requireUser();
  if (!user) return { ok: false };
  const lesson = getLesson(levelId, slug);
  if (!lesson) return { ok: false };

  const db = getDb();
  const lessonId = `${levelId}/${slug}`;
  const existing = db
    .select({ idx: schema.lessonProgress.current_step_idx })
    .from(schema.lessonProgress)
    .where(
      and(
        eq(schema.lessonProgress.user_id, user.id),
        eq(schema.lessonProgress.lesson_id, lessonId),
      ),
    )
    .get();
  const now = Date.now();
  if (!existing) {
    db.insert(schema.lessonProgress)
      .values({
        user_id: user.id,
        lesson_id: lessonId,
        level_id: levelId,
        current_step_idx: stepIdx,
        updated_at: now,
      })
      .run();
  } else if (stepIdx > existing.idx) {
    db.update(schema.lessonProgress)
      .set({ current_step_idx: stepIdx, updated_at: now })
      .where(
        and(
          eq(schema.lessonProgress.user_id, user.id),
          eq(schema.lessonProgress.lesson_id, lessonId),
        ),
      )
      .run();
  }
  return { ok: true };
}

/** Подтверждает завершение урока (только сервер: ачивки/статистика в Ф2 — по этим записям). */
export async function completeLesson(
  levelId: string,
  slug: string,
): Promise<{ ok: boolean }> {
  const user = await requireUser();
  if (!user) return { ok: false };
  const lesson = getLesson(levelId, slug);
  if (!lesson) return { ok: false };

  const db = getDb();
  const lessonId = `${levelId}/${slug}`;
  const now = Date.now();
  db.insert(schema.lessonProgress)
    .values({
      user_id: user.id,
      lesson_id: lessonId,
      level_id: levelId,
      status: "completed",
      current_step_idx: lesson.steps.length - 1,
      completed_at: now,
      updated_at: now,
    })
    .onConflictDoUpdate({
      target: [schema.lessonProgress.user_id, schema.lessonProgress.lesson_id],
      set: {
        status: "completed",
        current_step_idx: lesson.steps.length - 1,
        completed_at: now,
        updated_at: now,
      },
    })
    .run();

  // Не более одного события lesson_completed на урок в день — повтор «Повторить» не надувает стрик
  const dup = getDb()
    .select({ id: schema.activityEvents.id })
    .from(schema.activityEvents)
    .where(
      and(
        eq(schema.activityEvents.user_id, user.id),
        eq(schema.activityEvents.type, "lesson_completed"),
        eq(schema.activityEvents.event_date, localDate(now)),
        eq(sql`json_extract(${schema.activityEvents.payload}, '$.lessonId')`, lessonId),
      ),
    )
    .get();
  if (!dup) {
    recordActivity(user.id, "lesson_completed", { lessonId, levelId });
  }
  return { ok: true };
}
