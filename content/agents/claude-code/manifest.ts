import type { TrackManifest } from "@/lib/content/types";

/**
 * Мини-трек Claude Code (паритет с оригиналом zero2claude).
 * В Ф0 используется как каркас: generic-уроки с {{agent.*}} появятся в Ф1.
 * Плейсхолдеры в тексте/фикстурах/ответах резолвятся из этого манифеста.
 */
export const manifest: TrackManifest = {
  id: "claude-code",
  name: "Claude Code",
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

export function resolvePlaceholders(template: string, track: TrackManifest): string {
  return template
    .replaceAll("{{agent.name}}", track.name)
    .replaceAll("{{agent.binary}}", track.binary)
    .replaceAll("{{agent.accent}}", track.accent);
}
