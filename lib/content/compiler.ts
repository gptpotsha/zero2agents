import type { LessonContent, TrackManifest } from "@/lib/content/types";
import { resolvePlaceholders } from "@/content/agents/claude-code/manifest";
import { manifest as claudeCode } from "@/content/agents/claude-code/manifest";

/** Реестр треков. Добавление агента = новый манифест-файл + строка здесь. */
export const TRACKS: TrackManifest[] = [claudeCode];

export function listTracks(): TrackManifest[] {
  return TRACKS;
}

export function getTrack(trackId: string): TrackManifest | null {
  return TRACKS.find((t) => t.id === trackId) ?? null;
}

/**
 * Компиляция урока под трек: рекурсивно резолвит {{agent.*}} во всех строках
 * контента, меты и шагов. Упражнения проверок не трогаем — они state-based.
 * Ошибка: неучтённый плейсхолдер или невалидный результат — падение сборки.
 */
export function compileLesson(lesson: LessonContent, track: TrackManifest): LessonContent {
  const compiled = JSON.parse(resolvePlaceholders(JSON.stringify(lesson), track)) as LessonContent;
  if (!compiled?.meta?.slug || !Array.isArray(compiled.steps)) {
    throw new Error(`Компиляция урока сломала структуру (${lesson.meta.slug} → ${track.id})`);
  }
  return compiled;
}
