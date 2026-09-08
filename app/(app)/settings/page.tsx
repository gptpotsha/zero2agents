import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetProgressButton } from "@/components/settings/reset-progress-button";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { getSessionUser } from "@/lib/auth/session";

export const metadata = { title: "Настройки аккаунта" };

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) return null; // (app)/layout редиректит на /login

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Настройки аккаунта</h1>
      <p className="mt-1 text-muted-foreground">
        Аккаунт: <span className="font-medium text-foreground">{user.username}</span>
      </p>

      <div className="mt-8 space-y-6">
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">План</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Все уроки курса бесплатны — навсегда. Новые настройки появляются по мере
              развития платформы.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
