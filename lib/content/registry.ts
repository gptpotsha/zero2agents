import { LESSON_DEFS, LEVELS } from "@/content/ru";
import { lessonContentSchema, type RegisteredLesson, type LevelMeta, type LessonContent } from "@/lib/content/types";
import { getTrack, TRACKS, compileLesson } from "@/lib/content/compiler";

export type LessonNotFound = null;

type Scope = LessonContent["meta"]["scope"];

let baseCache: { lessons: RegisteredLesson[]; byKey: Map<string, RegisteredLesson> } | undefined;
const compiledCache = new Map<string, RegisteredLesson>();

/**
 * Базовый реестр (без трек-подстановки) — собирается и валидируется один раз.
 * Невалидный урок роняет реестр: ошибка видна в dev, тестах и сборке.
 */
function buildBase() {
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

export function getBaseRegistry() {
  if (!baseCache) baseCache = buildBase();
  return baseCache;
}

/** Совместимость со старым API — базовый реестр без компиляции. */
export function getRegistry() {
  return getBaseRegistry();
}

/**
 * Урок, скомпилированный под трек: generic-agent уроки получают
 * {{agent.*}} → реальные значения манифеста; common-уроки возвращаются как есть.
 */
export function getLessonForTrack(levelId: string, slug: string, trackId: string): RegisteredLesson | null {
  const base = getBaseRegistry().byKey.get(`${levelId}/${slug}`);
  if (!base) return null;
  if (base.meta.scope !== "generic-agent") return base;
  const key = `${trackId}:${levelId}/${slug}`;
  const cached = compiledCache.get(key);
  if (cached) return cached;
  const track = getTrack(trackId);
  if (!track) return null;
  const compiled = lessonContentSchema.parse(compileLesson(base, track)) as RegisteredLesson;
  compiledCache.set(key, compiled);
  return compiled;
}

export function getLesson(levelId: string, slug: string): RegisteredLesson | null {
  return getBaseRegistry().byKey.get(`${levelId}/${slug}`) ?? null;
}

export function listLevels(): (LevelMeta & { lessons: RegisteredLesson[] })[] {
  const { lessons } = getBaseRegistry();
  return LEVELS.map((level) => ({
    ...level,
    lessons: lessons.filter((l) => l.levelId === level.id).sort((a, b) => a.order - b.order),
  }));
}

/** Список активных треков (для UI выбора агента). */
export function listTracks() {
  return TRACKS;
}

/** Для прогресса: порядковый номер урока в своём уровне (1-based). */
export function lessonIndex(levelId: string, slug: string): number {
  const { lessons } = getBaseRegistry();
  return lessons
    .filter((l) => l.levelId === levelId)
    .sort((a, b) => a.order - b.order)
    .findIndex((l) => l.meta.slug === slug);
}

export type { Scope };
