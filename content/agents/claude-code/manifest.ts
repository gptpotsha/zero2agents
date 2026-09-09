import type { TrackManifest } from "@/lib/content/types";

/**
 * Трек [CC] (паритет с оригиналом zero2claude).
 * Добавление нового трека = новый файл-манифест с тем же интерфейсом
 * + строка в TRACKS (lib/content/compiler.ts).
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
