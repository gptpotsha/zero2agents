import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { replyToSupportTicket } from "@/lib/support/tickets";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const dbUser = db.select().from(schema.users).where(eq(schema.users.id, user.id)).get();

    const isAuthorized =
      dbUser?.telegram_username?.toLowerCase() === "pr0_chatbot" ||
      dbUser?.username?.toLowerCase() === "pr0_chatbot" ||
      dbUser?.role === "admin";

    if (!isAuthorized) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const { ticketId, replyText } = await req.json();
    if (!ticketId || !replyText) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    await replyToSupportTicket({
      ticketId,
      replyText,
      adminUserId: user.id,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

