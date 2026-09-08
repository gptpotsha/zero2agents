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

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-bold tracking-tight">
              С нуля до AI-агентов
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Уроки
              </Link>
              <Link
                href="/achievements"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                🏆 Достижения
              </Link>
              <Link
                href="/practice"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Песочница
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/settings"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Настройки
            </Link>
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.username}</span>
            <form action={logoutAction}>
              <Button variant="outline" size="sm" type="submit">
                Выйти
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
