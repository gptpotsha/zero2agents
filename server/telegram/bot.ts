import { Bot, InlineKeyboard } from "grammy";
import { getDb, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { getOrCreateTelegramUser } from "@/lib/auth/telegram";
import { consumeLinkToken, mergeUserAccounts } from "@/lib/auth/account-link";
import { ROLES, listRoles } from "@/lib/content/plan";

export const REQUIRED_CHANNELS = [
  { username: "homotext", url: "https://t.me/homotext", title: "homotext" },
  { username: "NetGeniusAI", url: "https://t.me/NetGeniusAI", title: "NetGeniusAI" },
];

let _botInstance: Bot | null = null;

/**
 * Проверка подписки пользователя на обязательные каналы.
 * Fail-closed: любая ошибка (например, чат не найден или пользователь не состоит) считает канал неподписанным.
 */
export async function checkUserSubscriptions(
  userId: number,
  botOverride?: Bot,
): Promise<{ isSubscribed: boolean; missing: string[] }> {
  const bot = botOverride || getTelegramBot();
  const missing: string[] = [];

  for (const channel of REQUIRED_CHANNELS) {
    try {
      const member = await bot.api.getChatMember(`@${channel.username}`, userId);
      const activeStatuses = ["creator", "administrator", "member", "restricted"];
      if (!activeStatuses.includes(member.status)) {
        missing.push(channel.username);
      }
    } catch (err: any) {
      console.warn(`[Telegram Bot] Проверка подписки на @${channel.username} для ${userId}:`, err?.description || err?.message || err);
      // Если пользователя нет в чате или ошибка — fail-closed
      missing.push(channel.username);
    }
  }

  return { isSubscribed: missing.length === 0, missing };
}

export function getTelegramBot(): Bot {
  if (_botInstance) return _botInstance;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN не задан в переменных окружения");
  }

  const bot = new Bot(token);

  // /start обработчик
  bot.command("start", async (ctx) => {
    const payload = ctx.match?.trim(); // deep-link параметр
    const tgUser = ctx.from;
    if (!tgUser) return;

    // 1. Проверяем, не является ли payload токеном привязки аккаунта с сайта (tg_link_XXXX или link_XXXX)
    if (payload?.startsWith("tg_link_") || payload?.startsWith("link_")) {
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
      } else {
        await ctx.reply(
          `❌ Ссылка привязки недействительна или её срок (10 минут) истёк. Сгенерируй новую ссылку в Личном кабинете.`,
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
    const subCheck = await checkUserSubscriptions(tgUser.id, bot);
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

  // Обработка ручного ввода 6-значного кода привязки аккаунта
  bot.hears(/^\d{6}$/, async (ctx) => {
    const code = ctx.match[0];
    const tgUser = ctx.from;
    if (!tgUser) return;

    const webUserId = await consumeLinkToken({ code, purpose: "tg_link" });
    if (webUserId) {
      const currentTgUser = await getOrCreateTelegramUser({
        id: tgUser.id,
        username: tgUser.username,
        first_name: tgUser.first_name,
      });

      await mergeUserAccounts(webUserId, currentTgUser.id);

      await ctx.reply(
        `🎉 **Аккаунт успешно привязан по коду!**\n\nТвой Telegram теперь синхронизирован с профилем на платформе. Твой прогресс сохранен!`,
        { parse_mode: "Markdown" },
      );
    } else {
      await ctx.reply(
        `❌ Код привязки не найден или его срок (10 минут) истёк. Сгенерируй новый код в Личном кабинете на сайте.`,
      );
    }
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

    const kb = new InlineKeyboard()
      .webApp("🚀 Открыть платформу Zero2Agents", webAppUrl)
      .row()
      .webApp("👤 Личный кабинет и настройки", `${webAppUrl}/settings`);

    // Если это админ (@PR0_chatbot или role === 'admin') — добавляем кнопку Админки прямо сюда
    const isAdmin =
      tgUser.username?.toLowerCase() === "pr0_chatbot" ||
      tgUser.id === 5439779879 ||
      user?.role === "admin";
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

  // Обработка кнопки подтверждения Email в 1 клик
  bot.callbackQuery(/^verify_email_(.+)$/, async (ctx) => {
    const targetUserId = ctx.match[1];
    const tgUser = ctx.from;
    const db = getDb();

    const user = db.select().from(schema.users).where(eq(schema.users.id, targetUserId)).get();
    if (!user || user.telegram_id !== tgUser.id) {
      await ctx.answerCallbackQuery({ text: "Ошибка доступа или неверный запрос.", show_alert: true });
      return;
    }

    db.update(schema.users)
      .set({ email_verified: 1 })
      .where(eq(schema.users.id, user.id))
      .run();

    await ctx.answerCallbackQuery({ text: "✅ Email успешно подтверждён!" });
    await ctx.editMessageText(
      `✅ **Email подтверждён!**\n\nАдрес \`${user.email}\` успешно привязан и верифицирован для аккаунта **${user.username}**.`,
      { parse_mode: "Markdown" },
    );
  });

  bot.callbackQuery("cancel_email_verify", async (ctx) => {
    await ctx.answerCallbackQuery({ text: "Отклонено" });
    await ctx.editMessageText("❌ Привязка Email отменена.");
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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://prochatbot.pro";
    const magicUrl = `${baseUrl}/login?magic=${token}`;

    await ctx.reply(
      `💻 **Вход на платформу с компьютера:**\n\n` +
        `1. Перейди по ссылке: [Войти в Zero2Agents](${magicUrl})\n` +
        `2. Либо введи на странице входа 6-значный код: \`${code}\`\n\n` +
        `⏱ Ссылка и код действуют 10 минут.`,
      { parse_mode: "Markdown" },
    );
  });

  // Команда /profile или /cabinet — прямой переход в Личный кабинет Mini App
  bot.command(["profile", "cabinet", "settings"], async (ctx) => {
    const webAppUrl = process.env.NEXT_PUBLIC_APP_URL || "https://prochatbot.pro";
    const kb = new InlineKeyboard().webApp("👤 Открыть Личный кабинет", `${webAppUrl}/settings`);

    await ctx.reply(
      `👤 **Личный кабинет Zero2Agents:**\n\n` +
        `Здесь ты можешь сменить цель/роль обучения, переключить AI-агента, настроить пароль для входа с ПК и управлять своим прогрессом.`,
      { parse_mode: "Markdown", reply_markup: kb },
    );
  });

  // Команда /quiz для запуска контрольного вопроса на закрепление материала
  bot.command(["quiz", "srs"], async (ctx) => {
    const tgUser = ctx.from;
    if (!tgUser) return;

    const db = getDb();
    const user = db.select().from(schema.users).where(eq(schema.users.telegram_id, tgUser.id)).get();
    if (!user) {
      await ctx.reply("Сначала нажми /start для регистрации.");
      return;
    }

    // Ищем доступную карточку повторения
    let card = db
      .select()
      .from(schema.srsCards)
      .where(and(eq(schema.srsCards.user_id, user.id), eq(schema.srsCards.status, "pending")))
      .get();

    if (!card) {
      card = db
        .select()
        .from(schema.srsCards)
        .where(eq(schema.srsCards.user_id, user.id))
        .get();
    }

    if (!card) {
      await ctx.reply(
        `🎓 **У тебя пока нет карточек для повторения!**\n\n` +
          `Пройди первый урок на платформе Zero2Agents, и бот автоматически создаст контрольный вопрос для закрепления темы.`,
        { parse_mode: "Markdown" },
      );
      return;
    }

    const { sendSrsQuestionToUser } = await import("@/server/telegram/scheduler");
    await sendSrsQuestionToUser(card.id, tgUser.id);
  });

  // Обработка ответов на викторину SRS (3 попытки с прогрессивными подсказками)
  bot.callbackQuery(/^srs_([^_]+)_(\d+)$/, async (ctx) => {
    const cardId = ctx.match[1];
    const optIdx = parseInt(ctx.match[2], 10);

    const db = getDb();
    const card = db.select().from(schema.srsCards).where(eq(schema.srsCards.id, cardId)).get();
    if (!card) {
      await ctx.answerCallbackQuery({ text: "Вопрос устарел или не найден.", show_alert: true });
      return;
    }

    const [levelId, slug] = card.lesson_id.includes("/") ? card.lesson_id.split("/") : ["1", card.lesson_id];
    const { getQuestionForLesson, processSrsAnswer } = await import("@/lib/srs/service");
    const qData = getQuestionForLesson(levelId, slug);

    const chosenAnswer = qData.options[optIdx];
    if (!chosenAnswer) {
      await ctx.answerCallbackQuery({ text: "Неверный выбор.", show_alert: true });
      return;
    }

    const result = await processSrsAnswer(cardId, chosenAnswer);
    const webAppUrl = process.env.NEXT_PUBLIC_APP_URL || "https://prochatbot.pro";

    if (result.correct) {
      await ctx.answerCallbackQuery({ text: "🎉 Абсолютно верно!" });
      const kb = new InlineKeyboard().webApp("🚀 Открыть платформу", webAppUrl);

      await ctx.editMessageText(
        `🎉 **Абсолютно верно!**\n\n` +
          `Твой ответ: \`${chosenAnswer}\`\n\n` +
          `📈 Карточка повышена в **Box ${result.box} из 5** системы интервального повторения Лейтнера.\n` +
          (result.isMastered ? "🏆 **Поздравляем! Эта тема полностью освоена!**\n\n" : "\n") +
          `Держи темп и продолжай обучение:`,
        { parse_mode: "Markdown", reply_markup: kb },
      );
      return;
    }

    // Неверный ответ
    await ctx.answerCallbackQuery({ text: "❌ Неверно. Изучи подсказку!", show_alert: true });

    if (result.attempt === 1) {
      const kb = new InlineKeyboard();
      qData.options.forEach((opt, idx) => {
        kb.text(opt, `srs_${card.id}_${idx}`);
        if (idx % 2 === 1) kb.row();
      });

      await ctx.editMessageText(
        `❌ **Не совсем так.** (Попытка 1 из 3)\n\n` +
          `📚 Урок: \`${card.lesson_id}\`\n` +
          `❓ ${qData.question}\n\n` +
          `💡 **Концептуальная подсказка:**\n_${result.hint}_\n\n` +
          `Попробуй ещё раз:`,
        { parse_mode: "Markdown", reply_markup: kb },
      );
      return;
    }

    if (result.attempt === 2) {
      const kb = new InlineKeyboard();
      qData.options.forEach((opt, idx) => {
        kb.text(opt, `srs_${card.id}_${idx}`);
        if (idx % 2 === 1) kb.row();
      });

      await ctx.editMessageText(
        `❌ **Снова не то.** (Попытка 2 из 3)\n\n` +
          `📚 Урок: \`${card.lesson_id}\`\n` +
          `❓ ${qData.question}\n\n` +
          `🔍 **Синтаксическая подсказка:**\n_${result.hint}_\n\n` +
          `Осталась последняя попытка:`,
        { parse_mode: "Markdown", reply_markup: kb },
      );
      return;
    }

    // Попытка 3: Исчерпаны все 3 попытки
    const kb = new InlineKeyboard()
      .url("📖 Повторить урок на платформе", result.lessonUrl || webAppUrl)
      .row()
      .webApp("🚀 Открыть Zero2Agents", webAppUrl);

    await ctx.editMessageText(
      `😔 **Попытки исчерпаны.** (Попытка 3 из 3)\n\n` +
        `Правильный ответ: **${result.correctAnswer}**\n\n` +
        `📖 **Разбор темы:**\n${result.explanation}\n\n` +
        `Карточка сброшена в Box 1 — мы повторим этот вопрос завтра. Обязательно освежи тему в уроке:`,
      { parse_mode: "Markdown", reply_markup: kb },
    );
  });

  // Команда /admin — прямой доступ к Mini App админ-панели для администратора
  bot.command("admin", async (ctx) => {
    const tgUser = ctx.from;
    if (!tgUser) return;

    const db = getDb();
    const user = db.select().from(schema.users).where(eq(schema.users.telegram_id, tgUser.id)).get();
    const isAdmin =
      tgUser.username?.toLowerCase() === "pr0_chatbot" ||
      tgUser.id === 5439779879 ||
      user?.role === "admin";

    if (!isAdmin) {
      await ctx.reply("❌ Доступ ограничен. Эта команда только для администратора.");
      return;
    }

    const subCommand = ctx.match?.trim().toLowerCase();
    if (subCommand === "stats" || subCommand === "digest") {
      const { sendAdminDailyDigest } = await import("@/server/telegram/scheduler");
      await sendAdminDailyDigest();
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

  // Команда /ask для вопросов преподавателю от студентов
  bot.command("ask", async (ctx) => {
    const questionText = ctx.match?.trim();
    const tgUser = ctx.from;
    if (!tgUser) return;

    if (!questionText) {
      await ctx.reply(
        `💬 **Как задать вопрос преподавателю:**\n\n` +
          `Напиши команду и свой вопрос в одном сообщении, например:\n` +
          `\`/ask Как настроить SSH ключ на сервере?\`\n\n` +
          `Мы мгновенно перешлем вопрос автору, а его ответ придёт прямо сюда в чат!`,
        { parse_mode: "Markdown" },
      );
      return;
    }

    const user = await getOrCreateTelegramUser({
      id: tgUser.id,
      username: tgUser.username,
      first_name: tgUser.first_name,
    });

    const { createSupportTicket } = await import("@/lib/support/tickets");
    await createSupportTicket({
      userId: user.id,
      source: "bot_question",
      questionText,
    });

    await ctx.reply(
      `📨 **Вопрос отправлен автору платформы!**\n\n` +
        `Преподаватель уже получил уведомление. Как только он ответит, сообщение придёт тебе в этот чат.`,
      { parse_mode: "Markdown" },
    );
  });

  // Закрытие тикета через inline-кнопку в сообщении администратора
  bot.callbackQuery(/^close_ticket_(.+)$/, async (ctx) => {
    const ticketId = ctx.match[1];
    const db = getDb();
    db.update(schema.supportTickets)
      .set({ status: "closed" })
      .where(eq(schema.supportTickets.id, ticketId))
      .run();

    await ctx.answerCallbackQuery({ text: "Тикет закрыт" });
    await ctx.editMessageText(
      (ctx.callbackQuery.message?.text || "") + "\n\n🔒 **Тикет закрыт.**",
      { parse_mode: "Markdown" },
    );
  });

  // Обработка Telegram Reply на сообщение с тикетом от администратора
  bot.on("message:text", async (ctx, next) => {
    const replyTo = ctx.message.reply_to_message;
    if (!replyTo) return next();

    const db = getDb();
    const tgUser = ctx.from;
    const adminUser = db
      .select()
      .from(schema.users)
      .where(eq(schema.users.telegram_id, tgUser.id))
      .get();

    const isAdmin =
      tgUser.username?.toLowerCase() === "pr0_chatbot" ||
      tgUser.id === 5439779879 ||
      adminUser?.role === "admin";

    if (!isAdmin) return next();

    // Ищем тикет по идентификатору из текста цитируемого сообщения
    const match = replyTo.text?.match(/Тикет #([a-f0-9]{8})/i);
    if (match) {
      const shortId = match[1];
      const allMatching = db
        .select()
        .from(schema.supportTickets)
        .all();
      const ticket = allMatching.find((t) => t.id.startsWith(shortId));

      if (ticket) {
        const { replyToSupportTicket } = await import("@/lib/support/tickets");
        await replyToSupportTicket({
          ticketId: ticket.id,
          replyText: ctx.message.text,
          adminUserId: adminUser?.id,
        });

        await ctx.reply(`✅ **Ответ отправлен студенту!** (Тикет #${ticket.id.slice(0, 8)})`, {
          parse_mode: "Markdown",
        });
        return;
      }
    }

    return next();
  });

  _botInstance = bot;
  return bot;
}

