"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateEmailAction,
  generateTgLinkAction,
  sendEmailVerificationRequestAction,
} from "@/app/actions/account-sync";

interface AccountSyncPanelProps {
  currentEmail: string | null;
  isEmailVerified: boolean;
  telegramUsername: string | null;
  telegramId: number | null;
}

export function AccountSyncPanel({
  currentEmail,
  isEmailVerified,
  telegramUsername,
  telegramId,
}: AccountSyncPanelProps) {
  const [emailState, emailFormAction, isEmailPending] = useActionState(
    updateEmailAction,
    {},
  );

  const [isEditingEmail, setIsEditingEmail] = useState(!currentEmail);
  const [tgLinkData, setTgLinkData] = useState<{ link?: string; code?: string } | null>(null);
  const [isGeneratingTg, setIsGeneratingTg] = useState(false);
  const [isSendingVerify, setIsSendingVerify] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);

  const handleGenerateTgLink = async () => {
    setIsGeneratingTg(true);
    try {
      const res = await generateTgLinkAction();
      if (res.ok) {
        setTgLinkData({ link: res.link, code: res.code });
      }
    } finally {
      setIsGeneratingTg(false);
    }
  };

  const handleSendVerifyToTelegram = async () => {
    setIsSendingVerify(true);
    setVerifyMessage(null);
    try {
      const res = await sendEmailVerificationRequestAction();
      if (res.ok) {
        setVerifyMessage("Кнопка подтверждения отправлена в твой Telegram-бот!");
      } else {
        setVerifyMessage(res.error || "Ошибка отправки.");
      }
    } finally {
      setIsSendingVerify(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Секция Email */}
      <div className="rounded-lg border p-4 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📧</span>
            <div>
              <p className="font-semibold text-sm">Электронная почта</p>
              <p className="text-xs text-muted-foreground">
                Нужна для восстановления доступа, входа с ПК и получения ответов
              </p>
            </div>
          </div>
          {currentEmail && !isEditingEmail && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingEmail(true)}
              className="text-xs"
            >
              Изменить
            </Button>
          )}
        </div>

        {currentEmail && !isEditingEmail ? (
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {isEmailVerified ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Подтверждён: <strong className="text-foreground">{currentEmail}</strong>
                </span>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Не подтверждён: <strong className="text-foreground">{currentEmail}</strong>
                  </span>
                  {telegramId ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSendVerifyToTelegram}
                      disabled={isSendingVerify}
                      className="h-7 text-xs"
                    >
                      {isSendingVerify ? "Отправка..." : "✈️ Подтвердить через Telegram"}
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      (привяжи Telegram ниже для подтверждения)
                    </span>
                  )}
                </>
              )}
            </div>

            {verifyMessage && (
              <p className="text-xs font-medium text-primary mt-1">{verifyMessage}</p>
            )}
          </div>
        ) : (
          <form action={emailFormAction} className="mt-4 space-y-3">
            <div className="flex gap-2">
              <Input
                name="email"
                type="email"
                placeholder="name@example.com"
                defaultValue={currentEmail ?? ""}
                required
                className="text-sm h-9"
              />
              <Button type="submit" size="sm" disabled={isEmailPending} className="h-9">
                {isEmailPending ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
            {emailState.error && (
              <p className="text-xs text-destructive">{emailState.error}</p>
            )}
            {emailState.ok && (
              <p className="text-xs text-emerald-500">{emailState.ok}</p>
            )}
          </form>
        )}
      </div>

      {/* Секция Telegram */}
      <div className="rounded-lg border p-4 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">✈️</span>
            <div>
              <p className="font-semibold text-sm">Telegram аккаунт</p>
              <p className="text-xs text-muted-foreground">
                Для ежедневных контрольных вопросов, утренних напоминаний и Mini App
              </p>
            </div>
          </div>
        </div>

        {telegramId ? (
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-500">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              Привязан:{" "}
              <strong className="text-foreground">
                {telegramUsername ? `@${telegramUsername}` : `ID: ${telegramId}`}
              </strong>
            </span>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Telegram еще не подключен. Привяжи бота, чтобы не терять свой стрик и проходить квизы прямо в мессенджере.
            </p>

            {tgLinkData ? (
              <div className="space-y-2 rounded-md bg-background p-3 border">
                <p className="text-xs font-medium">Способ 1: Открой прямую ссылку в боте:</p>
                <a
                  href={tgLinkData.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  🚀 Привязать в @ZeroToAgent_bot
                </a>
                <p className="pt-1 text-xs text-muted-foreground">
                  Способ 2: Отправь код боту вручную:{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono font-bold text-foreground">
                    {tgLinkData.code}
                  </code>
                </p>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateTgLink}
                disabled={isGeneratingTg}
                className="text-xs"
              >
                {isGeneratingTg ? "Генерация..." : "🔗 Привязать Telegram-аккаунт"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
