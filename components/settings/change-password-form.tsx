"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordAction, type SettingsState } from "@/app/actions/settings";

/** Форма смены пароля: текущий + новый + подтверждение. */
export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    changePasswordAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="current_password">Текущий пароль</Label>
        <Input
          id="current_password"
          name="current_password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="new_password">Новый пароль</Label>
        <Input
          id="new_password"
          name="new_password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="минимум 8 символов"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm_password">Повтори новый пароль</Label>
        <Input
          id="confirm_password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.ok && <p className="text-sm text-green-600 dark:text-green-400">{state.ok}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Сохраняю…" : "Сменить пароль"}
      </Button>
    </form>
  );
}
