import { LESSON_DEFS, LEVELS } from "@/content/ru";
import { lessonContentSchema, type RegisteredLesson, type LevelMeta } from "@/lib/content/types";

export type LessonNotFound = null;

let cache: { lessons: RegisteredLesson[]; byKey: Map<string, RegisteredLesson> } | undefined;

/**
 * Собирает и валидирует контент один раз. Любой невалидный урок
 * роняет реестр — ошибка видна сразу (в dev, в тестах и в сборке).
 */
function buildRegistry() {
  const lessons: RegisteredLesson[] = LESSON_DEFS.map((def) => {
    const parsed = lessonContentSchema.safeParse(def.lesson);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      throw new Error(`Невалидный урок ${def.levelId}/${def.lesson.meta.slug}: ${issues}`);
    }
    return { ...parsed.data, levelId: def.levelId, order: def.order };
  }).sort((a, b) => a.order - b.order);

  const byKey = new Map(lessons.map((l) => [`${l.levelId}/${l.meta.slug}`, l]));
  return { lessons, byKey };
}

export function getRegistry() {
  if (!cache) cache = buildRegistry();
  return cache;
}

export function getLesson(levelId: string, slug: string): RegisteredLesson | null {
  return getRegistry().byKey.get(`${levelId}/${slug}`) ?? null;
}

export function listLevels(): (LevelMeta & { lessons: RegisteredLesson[] })[] {
  const { lessons } = getRegistry();
  return LEVELS.map((level) => ({
    ...level,
    lessons: lessons.filter((l) => l.levelId === level.id).sort((a, b) => a.order - b.order),
  }));
}

/** Для прогресса: порядковый номер урока в своём уровне (1-based). */
export function lessonIndex(levelId: string, slug: string): number {
  const { lessons } = getRegistry();
  const idx = lessons.findIndex((l) => l.levelId === levelId && l.meta.slug === slug);
  return idx === -1 ? -1 : lessons.filter((l) => l.levelId === levelId).sort((a, b) => a.order - b.order).findIndex((l) => l.meta.slug === slug);
}
