"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

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
        };
      };
    };
  }
}

export function TelegramAppBridge({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isTMA, setIsTMA] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    // Ждем инициализации Telegram WebApp
    const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
    if (tg && tg.initData) {
      setIsTMA(true);
      tg.ready();
      tg.expand();

      // Проверяем, есть ли уже сессия в cookies
      const hasSessionCookie = document.cookie.includes("z2a_session=");

      if (!hasSessionCookie || pathname === "/login" || pathname === "/register") {
        setIsAuthenticating(true);
        fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData: tg.initData }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.ok) {
              // Если находились на странице логина или регистрации - редиректим на дашборд
              if (pathname === "/login" || pathname === "/register" || pathname === "/") {
                window.location.href = "/dashboard";
              } else {
                router.refresh();
              }
            }
          })
          .catch((err) => {
            console.error("[TMA Auth Error]", err);
          })
          .finally(() => {
            setIsAuthenticating(false);
          });
      }
    }
  }, [router, pathname]);

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
