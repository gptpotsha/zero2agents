"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, registerAction, type AuthState } from "@/app/actions/auth";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, {});
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
            : "Имя пользователя и пароль — без email и карты. Бесплатно."}
        </p>
      </div>
      <div className="rounded-xl border p-6">
        <h2 className="hidden text-xl font-bold lg:block">
          {isLogin ? "Вход" : "Создать аккаунт"}
        </h2>
        <p className="mt-1 hidden text-sm text-muted-foreground lg:block">
          {isLogin
            ? "С возвращением! Продолжим с того места, где остановился."
            : "Имя пользователя и пароль — без email и карты. Бесплатно."}
        </p>
        <form action={formAction} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username">Имя пользователя</Label>
            <Input
              id="username"
              name="username"
              autoComplete="username"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-z0-9_]+"
              placeholder="например, curious_dev"
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
            {pending ? "Подожди…" : isLogin ? "Войти" : "Создать аккаунт"}
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
