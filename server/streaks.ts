import "server-only";
import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { localDate, computeStreakFromDates, DAY_MS } from "@/lib/streaks-core";

export { localDate };

export function recordActivity(
  userId: string,
  type: "lesson_completed" | "exercise_passed",
  payload: Record<string, unknown>,
): void {
  const now = Date.now();
  getDb()
    .insert(schema.activityEvents)
    .values({
      id: randomUUID(),
      user_id: userId,
      type,
      payload: JSON.stringify(payload),
      created_at: now,
      event_date: localDate(now),
    })
    .run();
}

export interface StreakInfo {
  current: number;
  longest: number;
  /** Даты (YYYY-MM-DD) с активностью за последние N дней — для heatmap. */
  activeDates: Map<string, number>; // дата -> число завершённых уроков
}

/** Считает стрик по уникальным датам событий lesson_completed. */
export function computeStreak(userId: string, heatmapDays = 91): StreakInfo {
  const rows = getDb()
    .select({
      event_date: schema.activityEvents.event_date,
    })
    .from(schema.activityEvents)
    .where(and(eq(schema.activityEvents.user_id, userId), eq(schema.activityEvents.type, "lesson_completed")))
    .all();

  const perDay = new Map<string, number>();
  for (const r of rows) perDay.set(r.event_date, (perDay.get(r.event_date) ?? 0) + 1);

  const { current, longest } = computeStreakFromDates([...perDay.keys()], localDate());

  // Heatmap: последние heatmapDays дней
  const activeDates = new Map<string, number>();
  const cutoff = Date.now() - heatmapDays * DAY_MS;
  for (const [d, n] of perDay) {
    if (new Date(d + "T00:00:00").getTime() >= cutoff) activeDates.set(d, n);
  }

  return { current, longest, activeDates };
}

/** Последние завершённые уроки (для блока «недавно завершённые»). */
export function recentCompleted(userId: string, limit = 5) {
  return getDb()
    .select({
      lesson_id: schema.lessonProgress.lesson_id,
      level_id: schema.lessonProgress.level_id,
      completed_at: schema.lessonProgress.completed_at,
    })
    .from(schema.lessonProgress)
    .where(and(eq(schema.lessonProgress.user_id, userId), eq(schema.lessonProgress.status, "completed")))
    .orderBy(desc(schema.lessonProgress.completed_at))
    .limit(limit)
    .all();
}
