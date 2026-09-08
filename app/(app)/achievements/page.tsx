import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { computeAchievements } from "@/server/achievements";
import { getSessionUser } from "@/lib/auth/session";

export const metadata = { title: "Достижения" };

export default async function AchievementsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const achievements = computeAchievements(user.id);
  const earnedCount = achievements.filter((a) => a.earned).length;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Достижения</h1>
          <p className="mt-1 text-muted-foreground">
            Получено {earnedCount} из {achievements.length}
          </p>
        </div>
        <Link href="/dashboard" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
          ← К урокам
        </Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {achievements.map((a) => (
          <Card key={a.code} className={a.earned ? "border-primary/40" : ""}>
            <CardContent className="flex items-center gap-4 p-4">
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
                  a.earned ? "bg-primary/15" : "bg-muted opacity-50 grayscale"
                }`}
                aria-hidden="true"
              >
                {a.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-semibold">{a.title}</p>
                  {a.earned ? (
                    <Badge className="shrink-0 bg-green-600/15 text-green-700 dark:text-green-400">получено</Badge>
                  ) : (
                    <span className="shrink-0 text-xs text-muted-foreground">{Math.round(a.progress * 100)}%</span>
                  )}
                </div>
                <p className="truncate text-sm text-muted-foreground">{a.description}</p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${a.earned ? "bg-green-600" : "bg-primary"}`}
                    style={{ width: `${Math.round(a.progress * 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
