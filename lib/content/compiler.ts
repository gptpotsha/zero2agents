import type { LessonContent, TrackManifest } from "@/lib/content/types";
import { manifest as claudeCode } from "@/content/agents/claude-code/manifest";
import { manifest as codex } from "@/content/agents/codex/manifest";
import { manifest as gemini } from "@/content/agents/gemini/manifest";
import { manifest as aider } from "@/content/agents/aider/manifest";

/** Реестр треков. Добавление агента = новый манифест-файл + строка здесь. */
export const TRACKS: TrackManifest[] = [claudeCode, codex, gemini, aider];

export function listTracks(): TrackManifest[] {
  return TRACKS;
}

export function getTrack(trackId: string): TrackManifest | null {
  return TRACKS.find((t) => t.id === trackId) ?? null;
}

/** Заменяет все {{agent.*}}-плейсхолдеры. Неизвестный плейсхолдер — ошибка сборки. */
export function resolvePlaceholders(template: string, track: TrackManifest): string {
  const vars: Record<string, string> = {
    "agent.name": track.name,
    "agent.binary": track.binary,
    "agent.accent": track.accent,
    "agent.tagline": track.tagline,
  };
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.replaceAll(`{{${key}}}`, value);
  }
  const unresolved = out.match(/\{\{agent\.[a-z]+\}\}/g);
  if (unresolved) {
    throw new Error(`Неизвестные плейсхолдеры (${track.id}): ${unresolved.join(", ")}`);
  }
  return out;
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
