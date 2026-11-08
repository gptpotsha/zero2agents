import type { Metadata } from "next";
import "./globals.css";
import { TelegramAppBridge } from "@/components/telegram/telegram-app-bridge";

export const metadata: Metadata = {
  title: {
    default: "С нуля до AI-агентов",
    template: "%s · С нуля до AI-агентов",
  },
  description:
    "Интерактивный курс: терминал, git, основы разработки и работа с AI-кодинг-агентами — [CC], Codex, Gemini CLI, Aider и другими.",
};

/** Применяет тему до первой отрисовки: тёмная по умолчанию, светлая — если сохранена. */
const themeInitScript = `(function(){try{var t=localStorage.getItem('z2a-theme');if(t!=='light'){document.documentElement.classList.add('dark');}document.documentElement.style.colorScheme=(t==='light'?'light':'dark');}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="h-full antialiased dark" suppressHydrationWarning>
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <TelegramAppBridge>{children}</TelegramAppBridge>
      </body>
    </html>
  );
}
