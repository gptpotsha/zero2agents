"use server";

import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { TRACKS } from "@/lib/content/compiler";

export type TrackState = { ok?: string; error?: string };

/** Сохраняет выбранный агентский трек пользователя. */
export async function selectTrackAction(trackId: string): Promise<TrackState> {
  const user = await getSessionUser();
  if (!user) return { error: "Сессия истекла — войди заново." };
  const track = TRACKS.find((t) => t.id === trackId);
  if (!track) return { error: "Неизвестный трек." };

  getDb()
    .update(schema.users)
    .set({ track_id: track.id })
    .where(eq(schema.users.id, user.id))
    .run();
  return { ok: `Твой агент: ${track.name}. Agent-уровни теперь показывают команды для него.` };
}
