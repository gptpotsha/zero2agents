import "server-only";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { computeStreak } from "@/server/streaks";
import { getRegistry, listLevels } from "@/lib/content/registry";

export type Achievement = {
  code: string;
  icon: string;
  title: string;
  description: string;
  /** 0..1 — прогресс выполнения; 1 = получено. */
  progress: number;
  earned: boolean;
};

const LEVEL_ICONS: Record<string, string> = {
  l1: "💻",
  l2: "⚡",
  l3: "📂",
  l4: "🌿",
  l5: "🌐",
  l8: "🤖",
  l9: "🧠",
  l10: "🔌",
  l11: "🧭",
  l12: "🚀",
  l13: "🛠️",
  l14: "🎮",
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

  // Общий счётчик уроков из реестра контента
  const total = getRegistry().lessons.length;
  const perLevel = new Map<string, number>();
  for (const row of completedRows) {
    perLevel.set(row.level_id, (perLevel.get(row.level_id) ?? 0) + 1);
  }

  const mk = (
    code: string,
    icon: string,
    title: string,
    description: string,
    progress: number,
  ): Achievement => ({
    code,
    icon,
    title,
    description,
    progress: Math.min(1, Math.max(0, progress)),
    earned: progress >= 1,
  });

  const list: Achievement[] = [
    mk("first_lesson", "🌱", "Первый урок", "Заверши свой первый урок", completed / 1),
    mk("five_lessons", "📗", "Пятёрка", "Заверши 5 уроков", completed / 5),
    mk("quarter", "💪", "Четверть пути", "Заверши 25% курса", completed / Math.max(1, total * 0.25)),
    mk("half", "🏃", "Половина пути", "Заверши 50% курса", completed / Math.max(1, total * 0.5)),
    mk("graduate", "🎓", "Выпускник", "Заверши весь курс", completed / Math.max(1, total)),
  ];

  // Level Master — динамически по всем уровням из реестра
  const allLevels = listLevels();
  for (const lvl of allLevels) {
    if (lvl.lessons.length === 0) continue;
    const done = perLevel.get(lvl.id) ?? 0;
    const icon = LEVEL_ICONS[lvl.id] ?? (lvl.scope === "agent" ? "🤖" : "💻");
    list.push(
      mk(
        `level_${lvl.id}_master`,
        icon,
        `Мастер уровня ${lvl.order}`,
        `Заверши все уроки уровня ${lvl.order} (${lvl.title})`,
        done / lvl.lessons.length,
      ),
    );
  }

  list.push(
    mk("streak_3", "🔥", "Стрик 3 дня", "Учись 3 дня подряд", current / 3),
    mk("streak_7", "🔥🔥", "Стрик 7 дней", "Учись 7 дней подряд", longest / 7),
    mk("streak_30", "☄️", "Стрик 30 дней", "Учись 30 дней подряд", longest / 30),
  );

  return list;
}
