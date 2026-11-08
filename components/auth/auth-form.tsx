"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, registerAction, loginWithMagicCodeAction, type AuthState } from "@/app/actions/auth";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, {});
  const [codeState, codeFormAction, codePending] = useActionState<AuthState, FormData>(loginWithMagicCodeAction, {});
  const [showCodeInput, setShowCodeInput] = useState(false);

  const isLogin = mode === "login";

  return (
    <div className="w-full max-w-sm">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 py-2 font-mono text-xs text-muted-foreground transition-colors pe-2 -my-2 hover:text-foreground"
      >
        ← На главную
      </Link>

      {/* Мобильная бренд-заглушка вместо левой панели */}
      <div className="mb-7 text-center lg:hidden">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 font-mono text-lg font-bold text-primary">
          &gt;_
        </div>
        <h1 className="font-mono text-2xl font-semibold">
          {isLogin ? "С возвращением" : "Начать учиться"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isLogin
            ? "Войди, чтобы продолжить с того же шага"
            : "Создай аккаунт или начни через Telegram-бота"}
        </p>
      </div>

      <div className="rounded-xl border p-6 bg-card text-card-foreground shadow-sm">
        <h2 className="hidden text-xl font-bold lg:block">
          {isLogin ? "Вход" : "Создать аккаунт"}
        </h2>
        <p className="mt-1 hidden text-sm text-muted-foreground lg:block">
          {isLogin
            ? "С возвращением! Продолжим с того места, где остановился."
            : "Пройди регистрацию по логину или через Telegram-бота."}
        </p>

        {/* Быстрый вход / регистрация через Telegram */}
        <div className="mt-5 space-y-3">
          <a
            href="https://t.me/ZeroToAgent_bot"
            target="_blank"
            rel="noreferrer"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#229ED9] px-4 text-sm font-semibold text-white shadow transition-all hover:bg-[#1E88E5]"
          >
            <span className="text-base">✈️</span>
            {isLogin ? "Войти через Telegram-бота" : "Регистрация через Telegram"}
          </a>

          {!showCodeInput ? (
            <button
              type="button"
              onClick={() => setShowCodeInput(true)}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Или войти по 6-значному коду из бота
            </button>
          ) : (
            <form action={codeFormAction} className="rounded-lg border p-3 bg-muted/30 space-y-2 mt-2">
              <Label htmlFor="code" className="text-xs font-semibold">6-значный код из бота (/web):</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  name="code"
                  placeholder="например, 123456"
                  required
                  maxLength={10}
                  className="h-9 text-sm font-mono tracking-widest text-center"
                />
                <Button type="submit" size="sm" disabled={codePending} className="h-9">
                  {codePending ? "..." : "Войти"}
                </Button>
              </div>
              {codeState.error && <p className="text-xs text-destructive">{codeState.error}</p>}
            </form>
          )}
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">или по логину</span>
          </div>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username">Имя пользователя (или Email)</Label>
            <Input
              id="username"
              name="username"
              autoComplete="username"
              required
              minLength={3}
              maxLength={50}
              placeholder="curious_dev или user@mail.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              minLength={8}
              placeholder="минимум 8 символов"
            />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Подожди…" : isLogin ? "Войти с паролем" : "Создать аккаунт"}
          </Button>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {isLogin ? (
          <>
            Нет аккаунта?{" "}
            <Link href="/register" className="underline underline-offset-4">
              Зарегистрируйся
            </Link>
          </>
        ) : (
          <>
            Уже есть аккаунт?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Войди
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
