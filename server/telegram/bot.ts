import { Bot, InlineKeyboard } from "grammy";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getOrCreateTelegramUser } from "@/lib/auth/telegram";
import { consumeLinkToken, mergeUserAccounts } from "@/lib/auth/account-link";
import { ROLES, listRoles } from "@/lib/content/plan";

const REQUIRED_CHANNELS = [
  { username: "homotext", url: "https://t.me/homotext", title: "homotext" },
  { username: "NetGeniusAI", url: "https://t.me/NetGeniusAI", title: "NetGeniusAI" },
];

let _botInstance: Bot | null = null;

export function getTelegramBot(): Bot {
  if (_botInstance) return _botInstance;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN не задан в переменных окружения");
  }

  const bot = new Bot(token);

  // Проверка подписки пользователя на каналы
  async function checkUserSubscriptions(userId: number): Promise<{ isSubscribed: boolean; missing: string[] }> {
    const missing: string[] = [];

    for (const channel of REQUIRED_CHANNELS) {
      try {
        const member = await bot.api.getChatMember(`@${channel.username}`, userId);
        const activeStatuses = ["creator", "administrator", "member", "restricted"];
        if (!activeStatuses.includes(member.status)) {
          missing.push(channel.username);
        }
      } catch (err) {
        // Если бот не админ в канале или ошибка доступа, логируем
        console.warn(`[Telegram Bot] Не удалось проверить подписку на @${channel.username}:`, err);
      }
    }

    return { isSubscribed: missing.length === 0, missing };
  }

  // /start обработчик
  bot.command("start", async (ctx) => {
    const payload = ctx.match?.trim(); // deep-link параметр
    const tgUser = ctx.from;
    if (!tgUser) return;

    // 1. Проверяем, не является ли payload токеном привязки аккаунта с сайта (link_XXXX)
    if (payload?.startsWith("link_")) {
      const webUserId = await consumeLinkToken({ token: payload, purpose: "tg_link" });
      if (webUserId) {
        const currentTgUser = await getOrCreateTelegramUser({
          id: tgUser.id,
          username: tgUser.username,
          first_name: tgUser.first_name,
        });

        // Сливаем аккаунты: веб-аккаунт остается основным
        await mergeUserAccounts(webUserId, currentTgUser.id);

        await ctx.reply(
          `🎉 **Аккаунт успешно привязан!**\n\nТвой Telegram теперь синхронизирован с профилем на платформе. Твой прогресс сохранен!`,
          { parse_mode: "Markdown" },
        );
        return;
      }
    }

    // Регистрируем / получаем пользователя
    const user = await getOrCreateTelegramUser({
      id: tgUser.id,
      username: tgUser.username,
      first_name: tgUser.first_name,
      utm_source: payload || undefined,
    });

    // 2. Проверка подписки на обязательные каналы
    const subCheck = await checkUserSubscriptions(tgUser.id);
    const db = getDb();

    db.update(schema.users)
      .set({ is_subscribed_channels: subCheck.isSubscribed ? 1 : 0 })
      .where(eq(schema.users.id, user.id))
      .run();

    if (!subCheck.isSubscribed) {
      const kb = new InlineKeyboard();
      for (const ch of REQUIRED_CHANNELS) {
        kb.url(`📢 Подписаться на @${ch.username}`, ch.url).row();
      }
      kb.text("✅ Я подписался — Проверить", "verify_subscriptions");

      await ctx.reply(
        `👋 Привет, ${tgUser.first_name ?? "будущий архитектор агентов"}!\n\n` +
          `Чтобы получить доступ к интерактивной обучающей платформе **Zero2Agents**, подпишись на наши каналы:\n\n` +
          `🔹 [@homotext](https://t.me/homotext)\n` +
          `🔹 [@NetGeniusAI](https://t.me/NetGeniusAI)\n\n` +
          `После подписки нажми кнопку ниже:`,
        {
          parse_mode: "Markdown",
          reply_markup: kb,
          link_preview_options: { is_disabled: true },
        },
      );
      return;
    }

    // 3. Если подписан — переход к онбордингу
    await sendOnboardingStep(ctx, user.id);
  });

  // Callback проверки подписки
  bot.callbackQuery("verify_subscriptions", async (ctx) => {
    const tgUser = ctx.from;
    const subCheck = await checkUserSubscriptions(tgUser.id);

    if (!subCheck.isSubscribed) {
      await ctx.answerCallbackQuery({
        text: "❌ Подписка пока не найдена. Подпишись на оба канала и попробуй снова!",
        show_alert: true,
      });
      return;
    }

    await ctx.answerCallbackQuery({ text: "✅ Подписка подтверждена!" });

    const user = await getOrCreateTelegramUser({
      id: tgUser.id,
      username: tgUser.username,
      first_name: tgUser.first_name,
    });

    getDb()
      .update(schema.users)
      .set({ is_subscribed_channels: 1 })
      .where(eq(schema.users.id, user.id))
      .run();

    await ctx.deleteMessage().catch(() => {});
    await sendOnboardingStep(ctx, user.id);
  });

  // Отправка шага онбординга: выбор роли
  async function sendOnboardingStep(ctx: any, userId: string) {
    const roles = listRoles();
    const kb = new InlineKeyboard();

    for (const r of roles) {
      kb.text(`${r.icon} ${r.name}`, `role_${r.id}`).row();
    }

    const text =
      `🚀 **Добро пожаловать в Zero2Agents!**\n\n` +
      `Здесь ты освоишь терминал, Git и работу с автономными AI-агентами (Claude Code, OpenAI Codex, Gemini CLI, Aider) с нуля до реальных проектов.\n\n` +
      `🎯 **Выбери свою цель/роль**, чтобы мы составили для тебя персональный трек обучения:`;

    await ctx.reply(text, { parse_mode: "Markdown", reply_markup: kb });
  }

  // Обработка выбора роли
  bot.callbackQuery(/^role_(.+)$/, async (ctx) => {
    const roleId = ctx.match[1];
    const tgUser = ctx.from;
    const db = getDb();

    const user = db.select().from(schema.users).where(eq(schema.users.telegram_id, tgUser.id)).get();
    if (user) {
      db.update(schema.users)
        .set({ role_id: roleId })
        .where(eq(schema.users.id, user.id))
        .run();
    }

    await ctx.answerCallbackQuery();

    // Шаг 2: Выбор трек-агента
    const kb = new InlineKeyboard()
      .text("🟣 Claude Code", "track_claude-code")
      .text("🟢 OpenAI Codex", "track_codex")
      .row()
      .text("🔵 Gemini CLI", "track_gemini")
      .text("⚡ Aider", "track_aider");

    await ctx.editMessageText(
      `Отличный выбор!\n\n🤖 **С какого AI-агента хочешь начать?**\n(Ты сможешь переключать агентов в любой момент):`,
      { reply_markup: kb },
    );
  });

  // Обработка выбора трека агента
  bot.callbackQuery(/^track_(.+)$/, async (ctx) => {
    const trackId = ctx.match[1];
    const tgUser = ctx.from;
    const db = getDb();

    const user = db.select().from(schema.users).where(eq(schema.users.telegram_id, tgUser.id)).get();
    if (user) {
      db.update(schema.users)
        .set({ track_id: trackId, onboarding_completed: 1 })
        .where(eq(schema.users.id, user.id))
        .run();
    }

    await ctx.answerCallbackQuery();

    const webAppUrl = process.env.NEXT_PUBLIC_APP_URL || "https://prochatbot.pro";

    const kb = new InlineKeyboard().webApp("🚀 Открыть платформу Zero2Agents", webAppUrl);

    // Если это админ (@PR0_chatbot) — добавляем кнопку Админки прямо сюда
    const isAdmin = tgUser.username?.toLowerCase() === "pr0_chatbot";
    if (isAdmin) {
      kb.row().webApp("🛠 Админ-панель (Mini App)", `${webAppUrl}/admin`);
    }

    await ctx.editMessageText(
      `🎉 **Твой персональный план готов!**\n\n` +
        `• Доступ ко всем 14 интерактивным уровням открыт.\n` +
        `• Практический терминал и файловое дерево ждут тебя.\n` +
        `• Каждое утро бот будет присылать короткий отчет и вопросы для закрепления.\n\n` +
        `Жми кнопку ниже, чтобы начать первый урок!`,
      { reply_markup: kb, parse_mode: "Markdown" },
    );
  });

  // Команда /web — одноразовая ссылка для мгновенного входа в браузере на ПК
  bot.command("web", async (ctx) => {
    const tgUser = ctx.from;
    if (!tgUser) return;

    const db = getDb();
    const user = db.select().from(schema.users).where(eq(schema.users.telegram_id, tgUser.id)).get();
    if (!user) {
      await ctx.reply("Сначала нажми /start для регистрации.");
      return;
    }

    const { createLinkToken } = await import("@/lib/auth/account-link");
    const { token, code } = await createLinkToken(user.id, "web_magic_login");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zero2agents.com";
    const magicUrl = `${baseUrl}/login?magic=${token}`;

    await ctx.reply(
      `💻 **Вход на платформу с компьютера:**\n\n` +
        `1. Перейди по ссылке: [Войти в Zero2Agents](${magicUrl})\n` +
        `2. Либо введи на странице входа 6-значный код: \`${code}\`\n\n` +
        `⏱ Ссылка и код действуют 10 минут.`,
      { parse_mode: "Markdown" },
    );
  });

  // Команда /admin — прямой доступ к Mini App админ-панели для @PR0_chatbot
  bot.command("admin", async (ctx) => {
    const tgUser = ctx.from;
    if (!tgUser) return;

    const isAdmin = tgUser.username?.toLowerCase() === "pr0_chatbot";
    if (!isAdmin) {
      await ctx.reply("❌ Доступ ограничен. Эта команда только для администратора (@PR0_chatbot).");
      return;
    }

    const webAppUrl = process.env.NEXT_PUBLIC_APP_URL || "https://prochatbot.pro";
    const kb = new InlineKeyboard().webApp("🛠 Открыть Админ-панель", `${webAppUrl}/admin`);

    await ctx.reply(
      `👑 **Добро пожаловать в центр управления Zero2Agents!**\n\n` +
        `Здесь ты можешь отслеживать приток пользователей, источники трафика, активность и отвечать на вопросы студентов.`,
      { parse_mode: "Markdown", reply_markup: kb },
    );
  });

  _botInstance = bot;
  return bot;
}

