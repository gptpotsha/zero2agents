import "dotenv/config";
import { getTelegramBot } from "../server/telegram/bot";
import {
  sendMorningDigests,
  sendDailySrsQuestions,
  sendAdminDailyDigest,
} from "../server/telegram/scheduler";

let lastDigestDay = "";
let lastAdminDigestDay = "";

/**
 * Планировщик периодических задач:
 * - 09:00 MSK: Утренний дайджест студентам и контрольные вопросы SRS
 * - 09:30 MSK: Утренняя сводка ключевых метрик администратору
 * - Каждые 15 минут: проверка созревших карточек SRS
 */
function startBackgroundScheduler() {
  console.log("⏰ Фоновый планировщик задач (Cron) активирован.");

  setInterval(async () => {
    try {
      // Московское время (UTC+3)
      const now = new Date();
      const mskDate = new Date(now.getTime() + 3 * 60 * 60 * 1000);
      const hours = mskDate.getUTCHours();
      const minutes = mskDate.getUTCMinutes();
      const dayKey = mskDate.toISOString().slice(0, 10);

      // 09:00 MSK: Утренний дайджест студентам
      if (hours === 9 && minutes === 0 && lastDigestDay !== dayKey) {
        lastDigestDay = dayKey;
        console.log(`[Scheduler ${dayKey} 09:00] Отправляем утренние дайджесты и SRS-вопросы...`);
        await sendMorningDigests().catch((err) => console.error("[Morning Digest Error]", err));
        await sendDailySrsQuestions().catch((err) => console.error("[SRS Error]", err));
      }

      // 09:30 MSK: Сводка админу
      if (hours === 9 && minutes === 30 && lastAdminDigestDay !== dayKey) {
        lastAdminDigestDay = dayKey;
        console.log(`[Scheduler ${dayKey} 09:30] Отправляем утреннюю сводку админу...`);
        await sendAdminDailyDigest().catch((err) => console.error("[Admin Digest Error]", err));
      }

      // Каждые 15 минут проверяем новые карточки повторения
      if (minutes % 15 === 0) {
        await sendDailySrsQuestions().catch((err) => console.error("[Periodic SRS Error]", err));
      }
    } catch (err) {
      console.error("[Scheduler Error]", err);
    }
  }, 60 * 1000);
}

async function runPolling() {
  console.log("Запускаем бота в режиме Long Polling для разработки / тестирования...");
  const bot = getTelegramBot();

  // Удаляем старый вебхук, если был, чтобы работал polling
  await bot.api.deleteWebhook({ drop_pending_updates: false });
  console.log("Вебхук сброшен. Бот начинает слушать сообщения (Long Polling)...");

  // Запуск фонового планировщика
  startBackgroundScheduler();

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
