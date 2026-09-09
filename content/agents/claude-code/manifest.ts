import type { TrackManifest } from "@/lib/content/types";

/**
 * Мини-трек [CC] (паритет с оригиналом zero2claude).
 * Плейсхолдеры в тексте/фикстурах/ответах резолвятся из этого манифеста.
 * Добавление нового трека = новый файл-манифест с тем же интерфейсом.
 */
export const manifest: TrackManifest = {
  id: "claude-code",
  name: "[CC]",
  binary: "claude",
  accent: "#D97757",
  tagline: "AI-агент от Anthropic для терминала",
  capabilities: [
    "работает прямо в терминале",
    "читает и правит файлы проекта",
    "выполняет команды и тесты",
    "подключает MCP-серверы и навыки",
  ],
  promptExamples: [
    "Объясни, что делает этот проект",
    "Найди баг в функции валидации и исправь его",
    "Напиши тесты для этого модуля",
  ],
};

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
