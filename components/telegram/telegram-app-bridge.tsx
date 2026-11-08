"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: any;
        ready: () => void;
        expand: () => void;
        close: () => void;
        HapticFeedback: {
          impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
          notificationOccurred: (type: "error" | "success" | "warning") => void;
        };
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
      };
    };
  }
}

interface ChannelItem {
  username: string;
  url: string;
  title: string;
}

export function TelegramAppBridge({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [missingChannels, setMissingChannels] = useState<ChannelItem[] | null>(null);

  const authenticateInTMA = useCallback(async (initData: string) => {
    setIsAuthenticating(true);
    setMissingChannels(null);

    try {
      const res = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
      });
      const data = await res.json();

      if (data.ok) {
        sessionStorage.setItem("z2a_tma_authed", "1");
        setMissingChannels(null);
        if (pathname === "/login" || pathname === "/register" || pathname === "/") {
          window.location.href = "/dashboard";
        } else {
          router.refresh();
        }
      } else if (data.error === "subscription_required") {
        setMissingChannels(data.channels || []);
      }
    } catch (err) {
      console.error("[TMA Auth Error]", err);
    } finally {
      setIsAuthenticating(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let attempts = 0;
    const maxAttempts = 10;

    const checkTg = () => {
      const tg = window.Telegram?.WebApp;
      if (tg && tg.initData) {
        tg.ready();
        tg.expand();

        // Подключаем нативный BackButton Telegram
        try {
          if (pathname === "/" || pathname === "/dashboard") {
            tg.BackButton.hide();
          } else {
            tg.BackButton.show();
            const handleBack = () => {
              router.back();
            };
            tg.BackButton.onClick(handleBack);
            return () => {
              tg.BackButton.offClick(handleBack);
            };
          }
        } catch {
          // Игнорируем ошибки неподдерживаемых версий Telegram клиента
        }

        const isAlreadyAuthed = sessionStorage.getItem("z2a_tma_authed") === "1";
        const isAuthPage = pathname === "/login" || pathname === "/register";

        if (!isAlreadyAuthed || isAuthPage) {
          authenticateInTMA(tg.initData);
        }
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(checkTg, 150);
      }
    };

    const cleanup = checkTg();
    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, [pathname, router, authenticateInTMA]);

  // Экран проверки подписки на каналы в Mini App
  if (missingChannels && missingChannels.length > 0) {
    const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-2xl">
          📢
        </div>
        <h2 className="text-xl font-bold">Подпишись на наши каналы</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Чтобы получить доступ к платформе <strong>Zero2Agents</strong>, необходимо быть подписанным на каналы:
        </p>

        <div className="mt-5 w-full max-w-xs space-y-2.5">
          {missingChannels.map((ch) => (
            <a
              key={ch.username}
              href={ch.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm font-semibold hover:bg-accent transition-colors"
            >
              <span>@{ch.username}</span>
              <span className="text-xs text-primary font-mono">Подписаться →</span>
            </a>
          ))}
        </div>

        <Button
          onClick={() => {
            if (tg?.initData) authenticateInTMA(tg.initData);
          }}
          disabled={isAuthenticating}
          className="mt-6 w-full max-w-xs"
        >
          {isAuthenticating ? "Проверяем..." : "✅ Я подписался — Проверить"}
        </Button>
      </div>
    );
  }

  // Экран загрузки при первичной авторизации в Mini App
  if (isAuthenticating && (pathname === "/login" || pathname === "/register")) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background px-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
        <h2 className="text-lg font-bold">Входим через Telegram...</h2>
        <p className="text-sm text-muted-foreground mt-1">Авторизуем профиль без пароля</p>
      </div>
    );
  }

  return <>{children}</>;
}
