import { NextRequest, NextResponse } from "next/server";
import { validateTelegramInitData, getOrCreateTelegramUser } from "@/lib/auth/telegram";
import { createSession } from "@/lib/auth/session";
import { checkUserSubscriptions, REQUIRED_CHANNELS } from "@/server/telegram/bot";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { initData, utmSource } = await req.json();
    if (!initData) {
      return NextResponse.json({ ok: false, error: "Missing initData" }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json(
        { ok: false, error: "TELEGRAM_BOT_TOKEN not configured" },
        { status: 500 },
      );
    }

    const validation = validateTelegramInitData(initData, botToken);
    if (!validation.valid || !validation.user) {
      return NextResponse.json({ ok: false, error: "Invalid Telegram signature" }, { status: 401 });
    }

    const tgUser = validation.user;
    const user = await getOrCreateTelegramUser({
      id: tgUser.id,
      username: tgUser.username,
      first_name: tgUser.first_name,
      utm_source: utmSource,
    });

    // Обязательная проверка подписки на каналы перед выдачей сессии
    let isSubscribed = user.is_subscribed_channels === 1;
    let missingChannels: string[] = [];

    if (!isSubscribed) {
      const subCheck = await checkUserSubscriptions(tgUser.id);
      if (subCheck.isSubscribed) {
        isSubscribed = true;
        getDb()
          .update(schema.users)
          .set({ is_subscribed_channels: 1 })
          .where(eq(schema.users.id, user.id))
          .run();
      } else {
        missingChannels = subCheck.missing;
      }
    }

    if (!isSubscribed) {
      return NextResponse.json(
        {
          ok: false,
          error: "subscription_required",
          missing: missingChannels,
          channels: REQUIRED_CHANNELS,
        },
        { status: 403 },
      );
    }

    const token = await createSession(user.id);

    const res = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        roleId: user.role_id,
        trackId: user.track_id,
        onboardingCompleted: Boolean(user.onboarding_completed),
      },
    });

    // Устанавливаем cookie сессии
    res.cookies.set("z2a_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 дней
    });

    return res;
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}

