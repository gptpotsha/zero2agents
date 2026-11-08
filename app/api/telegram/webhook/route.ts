import { NextRequest, NextResponse } from "next/server";
import { getTelegramBot } from "@/server/telegram/bot";

export async function POST(req: NextRequest) {
  try {
    const bot = getTelegramBot();
    const update = await req.json();
    await bot.handleUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Telegram Webhook Error]", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

