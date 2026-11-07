import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetProgressButton } from "@/components/settings/reset-progress-button";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { TrackPicker } from "@/components/settings/track-picker";
import { RolePicker } from "@/components/dashboard/role-picker";
import { getSessionUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { listTracks } from "@/lib/content/compiler";

export const metadata = { title: "Настройки аккаунта" };

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) return null; // (app)/layout редиректит на /login

  const row = getDb()
    .select({ track_id: schema.users.track_id, role_id: schema.users.role_id })
    .from(schema.users)
    .where(eq(schema.users.id, user.id))
    .get();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Настройки аккаунта</h1>
      <p className="mt-1 text-muted-foreground">
        Аккаунт: <span className="font-medium text-foreground">{user.username}</span>
      </p>

      <div className="mt-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Твоя цель и роль (AI-план)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              План обучения подсвечивает уровни в зависимости от твоей текущей роли и целей.
            </p>
            <RolePicker currentRoleId={row?.role_id ?? null} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Твой AI-агент</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Агентские уровни (8+) показывают команды и примеры для выбранного агента.
              Поменять можно в любой момент.
            </p>
            <TrackPicker tracks={listTracks()} currentTrackId={row?.track_id ?? null} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Смена пароля</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Учебный прогресс</CardTitle>
          </CardHeader>
          <CardContent>
            <ResetProgressButton />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
