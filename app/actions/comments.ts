"use server";

import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export type CommentItem = {
  id: string;
  authorName: string;
  content: string;
  createdAt: number;
  isOwner: boolean;
};

/** Получает список комментариев к уроку. */
export async function getLessonComments(lessonId: string): Promise<CommentItem[]> {
  const user = await getSessionUser();
  const db = getDb();

  const rows = db
    .select()
    .from(schema.lessonComments)
    .where(eq(schema.lessonComments.lesson_id, lessonId))
    .orderBy(desc(schema.lessonComments.created_at))
    .all();

  return rows.map((r) => ({
    id: r.id,
    authorName: r.author_name,
    content: r.content,
    createdAt: r.created_at,
    isOwner: user ? user.id === r.user_id : false,
  }));
}

/** Добавляет новый вопрос или комментарий к уроку. */
export async function addLessonCommentAction(
  lessonId: string,
  content: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Сессия истекла — войди заново." };

  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "Комментарий не может быть пустым." };
  if (trimmed.length > 2000) return { ok: false, error: "Слишком длинный комментарий." };

  const db = getDb();
  db.insert(schema.lessonComments)
    .values({
      id: crypto.randomUUID(),
      user_id: user.id,
      lesson_id: lessonId,
      author_name: user.username,
      content: trimmed,
      created_at: Date.now(),
    })
    .run();

  // Автоматически регистрируем тикет поддержки и шлем мгновенный пуш админам
  try {
    const { createSupportTicket } = await import("@/lib/support/tickets");
    await createSupportTicket({
      userId: user.id,
      source: "lesson_player",
      questionText: trimmed,
      lessonId,
    });
  } catch (ticketErr) {
    console.warn("[Comments Ticket Error]", ticketErr);
  }

  revalidatePath(`/learn/${lessonId}`);
  return { ok: true };
}
