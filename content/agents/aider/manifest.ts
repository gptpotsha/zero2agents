import type { TrackManifest } from "@/lib/content/types";

/** Трек Aider — открытый AI-агент для парного программирования в терминале. */
export const manifest: TrackManifest = {
  id: "aider",
  name: "Aider",
  binary: "aider",
  accent: "#F59E0B",
  tagline: "Open-source агент для парного программирования",
  capabilities: [
    "правит код прямо в git-репозитории",
    "автоматически делает осмысленные коммиты",
    "работает с разными LLM-провайдерами",
    "показывает diff изменений перед применением",
  ],
  promptExamples: [
    "Добавь функцию валидации в utils.js",
    "Объясни, что делает эта функция",
    "Напиши тесты для модуля parser",
  ],
};
