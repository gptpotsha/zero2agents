import "dotenv/config";
import { Bot } from "grammy";

async function main() {
  console.log("Проверяем подключение к Telegram Bot API...");
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN не задан");
  }
  const bot = new Bot(token);
  const me = await bot.api.getMe();
  console.log(`Успешно! Бот: @${me.username} (ID: ${me.id}, Имя: ${me.first_name})`);

  // Проверяем доступность каналов
  const channels = ["homotext", "NetGeniusAI"];
  for (const ch of channels) {
    try {
      const chat = await bot.api.getChat(`@${ch}`);
      console.log(`Канал @${ch} доступен: "${chat.title}" (ID: ${chat.id})`);
    } catch (err: any) {
      console.log(`Канал @${ch}: ${err?.message || err}`);
    }
  }
}

main().catch((err) => {
  console.error("Ошибка проверки бота:", err);
  process.exit(1);
});
