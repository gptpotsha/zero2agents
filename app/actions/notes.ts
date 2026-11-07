"use server";

import { and, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export type NoteItem = {
  id: string;
  lessonId: string;
  content: string;
  createdAt: number;
  updatedAt: number;
};

/** Получает заметку текущего пользователя к конкретному уроку. */
export async function getLessonNote(lessonId: string): Promise<NoteItem | null> {
  const user = await getSessionUser();
  if (!user) return null;

  const row = getDb()
    .select()
    .from(schema.notes)
    .where(and(eq(schema.notes.user_id, user.id), eq(schema.notes.lesson_id, lessonId)))
    .get();

  if (!row) return null;
  return {
    id: row.id,
    lessonId: row.lesson_id,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Сохраняет или обновляет заметку к уроку. */
export async function saveLessonNoteAction(
  lessonId: string,
  content: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Сессия истекла — войди заново." };

  const trimmed = content.trim();
  const db = getDb();
  const now = Date.now();

  const existing = db
    .select({ id: schema.notes.id })
    .from(schema.notes)
    .where(and(eq(schema.notes.user_id, user.id), eq(schema.notes.lesson_id, lessonId)))
    .get();

  if (!trimmed) {
    if (existing) {
      db.delete(schema.notes).where(eq(schema.notes.id, existing.id)).run();
    }
    revalidatePath("/notes");
    return { ok: true };
  }

  if (existing) {
    db.update(schema.notes)
      .set({ content: trimmed, updated_at: now })
      .where(eq(schema.notes.id, existing.id))
      .run();
  } else {
    db.insert(schema.notes)
      .values({
        id: crypto.randomUUID(),
        user_id: user.id,
        lesson_id: lessonId,
        content: trimmed,
        created_at: now,
        updated_at: now,
      })
      .run();
  }

  revalidatePath("/notes");
  return { ok: true };
}

/** Возвращает все заметки текущего пользователя. */
export async function listUserNotes(): Promise<NoteItem[]> {
  const user = await getSessionUser();
  if (!user) return [];

  const rows = getDb()
    .select()
    .from(schema.notes)
    .where(eq(schema.notes.user_id, user.id))
    .orderBy(desc(schema.notes.updated_at))
    .all();

  return rows.map((r) => ({
    id: r.id,
    lessonId: r.lesson_id,
    content: r.content,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}
