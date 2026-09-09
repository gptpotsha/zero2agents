import type { TrackManifest } from "@/lib/content/types";

/** Трек [OC] CLI — AI-агент от [OI] для терминала. */
export const manifest: TrackManifest = {
  id: "codex",
  name: "[OC] CLI",
  binary: "codex",
  accent: "#10A37F",
  tagline: "AI-агент от [OI], живёт в терминале",
  capabilities: [
    "читает и правит файлы проекта",
    "запускает команды в песочнице",
    "предлагает план перед изменениями",
    "работает с git и тестами",
  ],
  promptExamples: [
    "Объясни структуру этого проекта",
    "Исправь падающий тест и объясни причину",
    "Добавь обработку ошибок в этот модуль",
  ],
};
