import "server-only";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { computeStreak } from "@/server/streaks";

export type Achievement = {
  code: string;
  icon: string;
  title: string;
  description: string;
  /** 0..1 — прогресс выполнения; 1 = получено. */
  progress: number;
  earned: boolean;
};

/**
 * Ачивки вычисляются на лету из lesson_progress и стрика.
 * (Таблицы achievements в БД не нужны, пока условия простые; JSON-правила — задел из плана.)
 */
export function computeAchievements(userId: string): Achievement[] {
  const db = getDb();
  const completedRows = db
    .select({ lesson_id: schema.lessonProgress.lesson_id, level_id: schema.lessonProgress.level_id })
    .from(schema.lessonProgress)
    .where(and(eq(schema.lessonProgress.user_id, userId), eq(schema.lessonProgress.status, "completed")))
    .all();
  const completed = completedRows.length;

  const { current, longest } = computeStreak(userId, 0);

  const levels = db
    .selectDistinct({ level_id: schema.lessonProgress.level_id })
    .from(schema.lessonProgress)
    .where(and(eq(schema.lessonProgress.user_id, userId), eq(schema.lessonProgress.status, "completed")))
    .all()
    .map((r) => r.level_id);

  // Все уроки в реестре: нужен общий счётчик из контента
  const { lessons } = require("@/lib/content/registry") as {
    lessons: { levelId: string; meta: { slug: string } }[];
  };
  const total = lessons.length;
  const perLevel = new Map<string, number>();
  for (const row of completedRows) perLevel.set(row.level_id, (perLevel.get(row.level_id) ?? 0) + 1);

  const mk = (
    code: string,
    icon: string,
    title: string,
    description: string,
    progress: number,
  ): Achievement => ({ code, icon, title, description, progress: Math.min(1, progress), earned: progress >= 1 });

  const list: Achievement[] = [
    mk("first_lesson", "🌱", "Первый урок", "Заверши свой первый урок", completed / 1),
    mk("five_lessons", "📗", "Пятёрка", "Заверши 5 уроков", completed / 5),
    mk("quarter", "💪", "Четверть пути", "Заверши 25% курса", completed / Math.max(1, total * 0.25)),
    mk("half", "🏃", "Половина пути", "Заверши 50% курса", completed / Math.max(1, total * 0.5)),
    mk("graduate", "🎓", "Выпускник", "Заверши весь курс", completed / Math.max(1, total)),
  ];

  // Level Master — по одному на существующий уровень
  const levelMeta: Record<string, { title: string; count: number; icon: string }> = {
    l1: { title: "Мастер уровня 1", count: 3, icon: "💻" },
  };
  for (const [lvl, meta] of Object.entries(levelMeta)) {
    const done = perLevel.get(lvl) ?? 0;
    list.push(mk(`level_${lvl}_master`, meta.icon, meta.title, `Заверши все уроки уровня ${lvl.replace("l", "")}`, done / meta.count));
  }
  void levels;

  list.push(
    mk("streak_3", "🔥", "Стрик 3 дня", "Учись 3 дня подряд", current / 3),
    mk("streak_7", "🔥🔥", "Стрик 7 дней", "Учись 7 дней подряд", longest / 7),
    mk("streak_30", "☄️", "Стрик 30 дней", "Учись 30 дней подряд", longest / 30),
  );

  return list;
}
