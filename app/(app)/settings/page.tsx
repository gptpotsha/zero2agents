import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetProgressButton } from "@/components/settings/reset-progress-button";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { TrackPicker } from "@/components/settings/track-picker";
import { RolePicker } from "@/components/dashboard/role-picker";
import { AccountSyncPanel } from "@/components/settings/account-sync-panel";
import { getSessionUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { listTracks } from "@/lib/content/compiler";

export const metadata = { title: "Личный кабинет и настройки" };

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) return null; // (app)/layout редиректит на /login

  const row = getDb()
    .select({
      track_id: schema.users.track_id,
      role_id: schema.users.role_id,
      email: schema.users.email,
      email_verified: schema.users.email_verified,
      telegram_id: schema.users.telegram_id,
      telegram_username: schema.users.telegram_username,
      role: schema.users.role,
    })
    .from(schema.users)
    .where(eq(schema.users.id, user.id))
    .get();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Личный кабинет</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Пользователь: <span className="font-semibold text-foreground">{user.username}</span>
            {row?.role === "admin" && (
              <span className="ml-2 rounded bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-500">
                Администратор
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {/* Связанные аккаунты: Email и Telegram */}
        <Card className="border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span>🔗</span> Связанные аккаунты (Email и Telegram)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Управляй связкой профиля с почтой и Telegram для синхронизации прогресса между устройствами.
            </p>
            <AccountSyncPanel
              currentEmail={row?.email ?? null}
              isEmailVerified={Boolean(row?.email_verified)}
              telegramUsername={row?.telegram_username ?? null}
              telegramId={row?.telegram_id ?? null}
            />
          </CardContent>
        </Card>

        {/* AI-план и роль */}
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

        {/* Выбор AI-агента */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Твой фокусный AI-агент</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Агентские уровни (8+) показывают команды и примеры для выбранного агента.
              Поменять можно в любой момент.
            </p>
            <TrackPicker tracks={listTracks()} currentTrackId={row?.track_id ?? null} />
          </CardContent>
        </Card>

        {/* Смена пароля */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Пароль для входа с ПК</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>

        {/* Сброс прогресса */}
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
