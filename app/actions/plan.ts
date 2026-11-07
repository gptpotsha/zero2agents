"use server";

import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { getRole } from "@/lib/content/plan";
import { revalidatePath } from "next/cache";

export type RoleState = { ok?: string; error?: string };

/** Сохраняет выбранную роль пользователя для персонализации траектории обучения. */
export async function selectRoleAction(roleId: string): Promise<RoleState> {
  const user = await getSessionUser();
  if (!user) return { error: "Сессия истекла — войди заново." };

  const role = getRole(roleId);
  if (!role) return { error: "Неизвестная роль." };

  getDb()
    .update(schema.users)
    .set({ role_id: role.id })
    .where(eq(schema.users.id, user.id))
    .run();

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { ok: `План перестроен под роль: ${role.name}.` };
}
