import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdSlot } from "@/components/monetization/AdSlot";
import { CheatSheetButton } from "@/components/course/cheat-sheet-button";
import { TestOutButton } from "@/components/course/test-out-button";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { OnboardingCard } from "@/components/dashboard/onboarding-card";
import { computeStreak } from "@/server/streaks";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { listLevels } from "@/lib/content/registry";
import { getLevelImportance } from "@/lib/content/plan";

export const metadata = { title: "Мои уроки" };

type ProgressMap = Map<
  string,
  { status: string; currentStepIdx: number; completedAt: number | null }
>;

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) return null; // layout редиректит

  const db = getDb();
  const rows = db
    .select()
    .from(schema.lessonProgress)
    .where(eq(schema.lessonProgress.user_id, user.id))
    .all();
  const progress: ProgressMap = new Map(
    rows.map((r) => [r.lesson_id, { status: r.status, currentStepIdx: r.current_step_idx, completedAt: r.completed_at }]),
  );

  const userRow = db
    .select({ role_id: schema.users.role_id })
    .from(schema.users)
    .where(eq(schema.users.id, user.id))
    .get();
  const roleId = userRow?.role_id ?? null;

  const levels = listLevels();
  const totalLessons = levels.reduce((acc, l) => acc + l.lessons.length, 0);
  const completedCount = levels.reduce(
    (acc, l) =>
      acc +
      l.lessons.filter((lesson) => progress.get(`${lesson.levelId}/${lesson.meta.slug}`)?.status === "completed").length,
    0,
  );

  // Считаем прогресс по приоритетным урокам для роли
  let completedPriority = 0;
  let totalPriority = 0;
  for (const level of levels) {
    const importance = getLevelImportance(roleId, level.id);
    if (importance === "priority") {
      totalPriority += level.lessons.length;
      for (const lesson of level.lessons) {
        if (progress.get(`${lesson.levelId}/${lesson.meta.slug}`)?.status === "completed") {
          completedPriority++;
        }
      }
    }
  }

  // Карточка «Продолжить обучение»: первый урок, который не пройден до конца.
  const flat = levels.flatMap((level) =>
    level.lessons.map((lesson) => ({ level, lesson })),
  );
  const nextUp = flat.find(({ lesson }) => progress.get(`${lesson.levelId}/${lesson.meta.slug}`)?.status !== "completed");
  const allDone = !nextUp;
  const nextProgress = nextUp ? progress.get(`${nextUp.lesson.levelId}/${nextUp.lesson.meta.slug}`) : undefined;
  const isResuming = nextProgress?.status === "in_progress";
  const nextLevelLessonIdx = nextUp ? nextUp.level.lessons.findIndex((l) => l.meta.slug === nextUp.lesson.meta.slug) + 1 : 0;

  // Стрики и heatmap — серверно из activity_events
  const streak = computeStreak(user.id);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Привет, {user.username}!</h1>
      <p className="mt-1 text-muted-foreground">Продолжай учиться — по одному шагу за раз.</p>

      {/* AI-онбординг и персонализация маршрута («My Plan») */}
      <div className="mt-6">
        <OnboardingCard
          currentRoleId={roleId}
          completedPriorityLessons={completedPriority}
          totalPriorityLessons={totalPriority}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Пройдено уроков</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {completedCount} / {totalLessons}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">В процессе</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {levels.reduce(
              (acc, l) =>
                acc +
                l.lessons.filter((lesson) => {
                  const p = progress.get(`${lesson.levelId}/${lesson.meta.slug}`);
                  return p && p.status === "in_progress";
                }).length,
              0,
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Уровней доступно</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{levels.length}</CardContent>
        </Card>
      </div>

      {/* Стрик + активность */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[240px_1fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">🔥 Стрик</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {streak.current} {streak.current === 1 ? "день" : streak.current < 5 ? "дня" : "дней"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">рекорд: {streak.longest}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Активность за 13 недель
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityHeatmap activeDates={streak.activeDates} />
          </CardContent>
        </Card>
      </div>

      {/* Карточка «Продолжить обучение» — как Continue learning у оригинала */}
      {allDone ? (
        <div className="mt-8 rounded-xl border border-green-600/30 bg-green-500/5 p-6 text-center">
          <p className="text-3xl" aria-hidden="true">🎉</p>
          <h2 className="mt-2 text-xl font-semibold">Весь доступный курс пройден!</h2>
          <p className="mt-1 text-muted-foreground">
            Ты прошёл все {totalLessons} уроков. Следующие уровни уже в работе — заходи в{" "}
            <Link href="/practice" className="underline underline-offset-4">
              песочницу
            </Link>
            , чтобы практиковаться.
          </p>
        </div>
      ) : (
        nextUp && (
          <div className="mt-8 flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {isResuming ? "Продолжить обучение" : "Начать обучение"}
              </p>
              <h2 className="mt-1 text-xl font-bold">
                {nextUp.lesson.meta.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Уровень {nextUp.level.order}: {nextUp.level.title} · Урок {nextLevelLessonIdx} из{" "}
                {nextUp.level.lessons.length} · ~{nextUp.lesson.meta.minutes} мин
              </p>
              <div className="mt-3 max-w-xs">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${Math.round(((nextProgress?.currentStepIdx ?? -1) + 1) / nextUp.lesson.steps.length * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <Link
              href={`/learn/${nextUp.lesson.levelId}/${nextUp.lesson.meta.slug}`}
              className={buttonVariants({ size: "lg" })}
            >
              {isResuming ? "Продолжить →" : "Начать →"}
            </Link>
          </div>
        )
      )}

      <div className="mt-10 space-y-10">
        {levels.map((level) => {
          const importance = getLevelImportance(roleId, level.id);
          const isLevelCompleted = level.lessons.every(
            (l) => progress.get(`${l.levelId}/${l.meta.slug}`)?.status === "completed",
          );

          return (
            <section key={level.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">Уровень {level.order}. {level.title}</h2>
                    {importance === "priority" ? (
                      <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border-emerald-600/20 text-xs">
                        Обязательно
                      </Badge>
                    ) : importance === "useful" ? (
                      <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-600/30 text-xs">
                        Полезно
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground border-dashed text-xs">
                        Можно пропустить
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{level.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <TestOutButton
                    levelId={level.id}
                    levelTitle={level.title}
                    isCompleted={isLevelCompleted}
                  />
                  {level.cheatSheet && level.cheatSheet.length > 0 && (
                    <CheatSheetButton levelTitle={level.title} items={level.cheatSheet} />
                  )}
                  <Badge variant="secondary">
                    {level.scope === "agent" ? "🤖 агент" : "💻 фундамент"}
                  </Badge>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {level.lessons.map((lesson) => {
                  const lessonId = `${lesson.levelId}/${lesson.meta.slug}`;
                  const p = progress.get(lessonId);
                  const isCompleted = p?.status === "completed";
                  const isStarted = !!p && !isCompleted;
                  return (
                    <Card key={lessonId} className="flex flex-col">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground">Урок {lesson.order}</span>
                          {isCompleted ? (
                            <Badge className="bg-green-600/15 text-green-700 dark:text-green-400">пройден</Badge>
                          ) : isStarted ? (
                            <Badge variant="secondary">в процессе</Badge>
                          ) : null}
                        </div>
                        <CardTitle className="text-base leading-snug">{lesson.meta.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col gap-3 pt-0">
                        <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">{lesson.meta.goal}</p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground">~{lesson.meta.minutes} мин</span>
                          <Link
                            href={`/learn/${lesson.levelId}/${lesson.meta.slug}`}
                            className={buttonVariants({
                              size: "sm",
                              variant: isCompleted ? "outline" : isStarted ? "default" : "secondary",
                            })}
                          >
                            {isCompleted ? "Повторить" : isStarted ? "Продолжить" : "Начать"}
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <AdSlot placement="dashboard-sidebar" />
    </main>
  );
}
