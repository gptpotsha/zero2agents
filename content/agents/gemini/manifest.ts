import type { TrackManifest } from "@/lib/content/types";

/** Трек Gemini CLI — AI-агент от Google для терминала. */
export const manifest: TrackManifest = {
  id: "gemini",
  name: "Gemini CLI",
  binary: "gemini",
  accent: "#4285F4",
  tagline: "AI-агент от Google, открытый и мультимодальный",
  capabilities: [
    "читает и ищет по файлам проекта",
    "исполняет команды и скрипты",
    "работает с текстом, кодом и картинками",
    "щедрые бесплатные лимиты для старта",
  ],
  promptExamples: [
    "Что делает этот проект и как его запустить?",
    "Найди дубли кода и предложи, как убрать",
    "Сгенерируй README по файлам проекта",
  ],
};
