import "dotenv/config";
import { getTelegramBot } from "../server/telegram/bot";

async function runPolling() {
  console.log("Запускаем бота в режиме Long Polling для локальной разработки / тестирования...");
  const bot = getTelegramBot();

  // Удаляем старый вебхук, если был, чтобы работал polling
  await bot.api.deleteWebhook({ drop_pending_updates: false });
  console.log("Вебхук сброшен. Бот начинает слушать сообщения (Long Polling)...");

  bot.start({
    onStart: (info) => {
      console.log(`🤖 Бот @${info.username} успешно запущен и слушает команды!`);
    },
  });
}

runPolling().catch((err) => {
  console.error("Ошибка запуска бота:", err);
  process.exit(1);
});

