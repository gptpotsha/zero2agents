"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { resetProgressAction, type SettingsState } from "@/app/actions/settings";

/**
 * Кнопка сброса прогресса с подтверждением в два клика
 * (защита от случайного нажатия).
 */
export function ResetProgressButton() {
  const [armed, setArmed] = useState(false);
  const [result, setResult] = useState<SettingsState>({});
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleReset = () => {
    startTransition(async () => {
      const res = await resetProgressAction();
      setResult(res);
      setArmed(false);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {!armed ? (
          <Button
            variant="destructive"
            onClick={() => setArmed(true)}
            disabled={pending}
          >
            Сбросить прогресс
          </Button>
        ) : (
          <>
            <Button variant="destructive" onClick={handleReset} disabled={pending}>
              {pending ? "Сбрасываю…" : "Да, удалить весь прогресс"}
            </Button>
            <Button variant="outline" onClick={() => setArmed(false)} disabled={pending}>
              Отмена
            </Button>
          </>
        )}
      </div>
      {result.ok && <p className="text-sm text-green-600 dark:text-green-400">{result.ok}</p>}
      {result.error && <p className="text-sm text-destructive">{result.error}</p>}
      <p className="text-xs text-muted-foreground">
        Будут удалены отметки о прохождении всех уроков. Аккаунт, пароль и настройки останутся.
      </p>
    </div>
  );
}
