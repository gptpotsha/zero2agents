import { redirect } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";
import { getSessionUser } from "@/lib/auth/session";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const isAdmin = user.role === "admin";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-6">
            <Link href="/dashboard" className="font-bold tracking-tight text-sm sm:text-base">
              Zero2Agents
            </Link>
            <nav className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm">
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "px-2 sm:px-3")}
              >
                Уроки
              </Link>
              <Link
                href="/achievements"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden md:inline-flex px-2 sm:px-3")}
              >
                🏆 Достижения
              </Link>
              <Link
                href="/notes"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex px-2 sm:px-3")}
              >
                📝 Заметки
              </Link>
              <Link
                href="/practice"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex px-2 sm:px-3")}
              >
                Песочница
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "bg-amber-600 hover:bg-amber-700 text-white px-2 sm:px-3 h-8 text-xs font-semibold"
                  )}
                >
                  🛠 Админка
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <Link
              href="/settings"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-8 px-2.5 sm:px-3 text-xs sm:text-sm font-medium flex items-center gap-1"
              )}
            >
              <span>👤</span>
              <span className="hidden sm:inline">Кабинет</span>
            </Link>
            <form action={logoutAction} className="hidden sm:block">
              <Button variant="ghost" size="sm" type="submit" className="h-8 px-2 text-xs text-muted-foreground">
                Выйти
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="flex-1 pb-16 sm:pb-0">{children}</div>

      {/* Нижняя мобильная панель для Mini App / смартфонов */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur sm:hidden">
        <div className="flex h-14 items-center justify-around px-2">
          <Link
            href="/dashboard"
            className="flex flex-col items-center justify-center text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <span className="text-base">📚</span>
            <span>Уроки</span>
          </Link>
          <Link
            href="/practice"
            className="flex flex-col items-center justify-center text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <span className="text-base">💻</span>
            <span>Консоль</span>
          </Link>
          <Link
            href="/achievements"
            className="flex flex-col items-center justify-center text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <span className="text-base">🏆</span>
            <span>Ачивки</span>
          </Link>
          <Link
            href="/notes"
            className="flex flex-col items-center justify-center text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <span className="text-base">📝</span>
            <span>Заметки</span>
          </Link>
          <Link
            href="/settings"
            className="flex flex-col items-center justify-center text-xs font-medium text-primary font-semibold"
          >
            <span className="text-base">👤</span>
            <span>Кабинет</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
