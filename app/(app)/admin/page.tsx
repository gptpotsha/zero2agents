import "server-only";
import { getSessionUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { desc, eq, sql, gte, and, isNotNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminReplyForm } from "@/components/admin/admin-reply-form";

export const metadata = { title: "Админ-панель Zero2Agents" };

type PeriodKey = "today" | "week" | "month" | "all";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ period?: string; status?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const db = getDb();
  const dbUser = db.select().from(schema.users).where(eq(schema.users.id, user.id)).get();

  // Проверка прав администратора
  const isAuthorized =
    dbUser?.telegram_username?.toLowerCase() === "pr0_chatbot" ||
    dbUser?.username?.toLowerCase() === "pr0_chatbot" ||
    dbUser?.telegram_id === 5439779879 ||
    dbUser?.role === "admin";

  if (!isAuthorized) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-destructive">Доступ ограничен</h1>
        <p className="mt-2 text-muted-foreground">
          Этот раздел доступен только администратору (@PR0_chatbot).
        </p>
      </main>
    );
  }

  const params = searchParams ? await searchParams : {};
  const currentPeriod: PeriodKey =
    params.period === "today" || params.period === "week" || params.period === "month"
      ? params.period
      : "all";

  const now = Date.now();
  let periodStartTime = 0;
  if (currentPeriod === "today") periodStartTime = now - 24 * 60 * 60 * 1000;
  else if (currentPeriod === "week") periodStartTime = now - 7 * 24 * 60 * 60 * 1000;
  else if (currentPeriod === "month") periodStartTime = now - 30 * 24 * 60 * 60 * 1000;

  // 1. Метрики пользователей за выбранный период
  const totalUsersQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(schema.users)
    .where(gte(schema.users.created_at, periodStartTime))
    .get();
  const periodTotalUsers = totalUsersQuery?.count ?? 0;

  const tgUsersQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(schema.users)
    .where(
      and(
        isNotNull(schema.users.telegram_id),
        gte(schema.users.created_at, periodStartTime),
      ),
    )
    .get();
  const periodTgUsers = tgUsersQuery?.count ?? 0;
  const periodWebOnlyUsers = periodTotalUsers - periodTgUsers;

  // Завершенные уроки за период
  const completedLessonsQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(schema.lessonProgress)
    .where(
      and(
        eq(schema.lessonProgress.status, "completed"),
        gte(schema.lessonProgress.completed_at, periodStartTime),
      ),
    )
    .get();
  const periodCompletedLessons = completedLessonsQuery?.count ?? 0;

  // Онбординг завершен за период
  const onboardingQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(schema.users)
    .where(
      and(
        eq(schema.users.onboarding_completed, 1),
        gte(schema.users.created_at, periodStartTime),
      ),
    )
    .get();
  const periodOnboardingUsers = onboardingQuery?.count ?? 0;

  // Источники трафика (UTM) за период
  const utmStats = db
    .select({
      source: schema.users.utm_source,
      count: sql<number>`count(*)`,
    })
    .from(schema.users)
    .where(gte(schema.users.created_at, periodStartTime))
    .groupBy(schema.users.utm_source)
    .all();

  // 2. Список тикетов
  const ticketStatusFilter = params.status;
  let ticketsQuery = db
    .select({
      ticket: schema.supportTickets,
      user: schema.users,
    })
    .from(schema.supportTickets)
    .innerJoin(schema.users, eq(schema.supportTickets.user_id, schema.users.id))
    .orderBy(desc(schema.supportTickets.created_at));

  const allTickets = ticketsQuery.all();
  const openTicketsCount = allTickets.filter((t) => t.ticket.status === "open").length;

  const displayedTickets = ticketStatusFilter
    ? allTickets.filter((t) => t.ticket.status === ticketStatusFilter)
    : allTickets.slice(0, 30);

  // 3. Таблица пользователей CRM с подсчетом пройденных уроков
  const usersCRM = db
    .select({
      id: schema.users.id,
      username: schema.users.username,
      first_name: schema.users.first_name,
      telegram_username: schema.users.telegram_username,
      telegram_id: schema.users.telegram_id,
      email: schema.users.email,
      email_verified: schema.users.email_verified,
      role: schema.users.role,
      role_id: schema.users.role_id,
      track_id: schema.users.track_id,
      onboarding_completed: schema.users.onboarding_completed,
      is_subscribed_channels: schema.users.is_subscribed_channels,
      utm_source: schema.users.utm_source,
      created_at: schema.users.created_at,
      completed_lessons: sql<number>`(
        SELECT count(*) FROM lesson_progress
        WHERE lesson_progress.user_id = users.id AND lesson_progress.status = 'completed'
      )`,
    })
    .from(schema.users)
    .orderBy(desc(schema.users.created_at))
    .limit(50)
    .all();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      {/* Шапка и переключатель периодов */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold">🛠 Админ-панель (@PR0_chatbot)</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Аналитика по дням/неделям/месяцам, CRM студентов и служба поддержки
          </p>
        </div>

        {/* Фильтр по периодам */}
        <div className="inline-flex rounded-lg border bg-muted/30 p-1 text-xs">
          <Link
            href="/admin?period=today"
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              currentPeriod === "today" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Сегодня
          </Link>
          <Link
            href="/admin?period=week"
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              currentPeriod === "week" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            7 дней
          </Link>
          <Link
            href="/admin?period=month"
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              currentPeriod === "month" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            30 дней
          </Link>
          <Link
            href="/admin?period=all"
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              currentPeriod === "all" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Всё время
          </Link>
        </div>
      </div>

      {/* KPI карточки за выбранный период */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Новых пользователей</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{periodTotalUsers}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {currentPeriod === "all" ? "за весь период" : `за ${currentPeriod}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Через Telegram-бота</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-500">{periodTgUsers}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {periodTotalUsers > 0 ? `${Math.round((periodTgUsers / periodTotalUsers) * 100)}% от общего притока` : "0%"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Только на сайте</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{periodWebOnlyUsers}</div>
            <p className="text-[11px] text-muted-foreground mt-1">без привязки бота</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Пройдено уроков</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{periodCompletedLessons}</div>
            <p className="text-[11px] text-muted-foreground mt-1">завершено шагов</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Открытых тикетов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{openTicketsCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">ждут ответа</p>
          </CardContent>
        </Card>
      </div>

      {/* Источники переходов (UTM) */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">📍 Источники трафика (UTM / Referrals)</CardTitle>
          </CardHeader>
          <CardContent>
            {utmStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">Нет данных по переходам за выбранный период.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {utmStats.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm">
                    <span className="font-mono text-xs truncate max-w-[180px]">
                      {item.source || "Органический / Прямой"}
                    </span>
                    <span className="rounded bg-primary/10 px-2 py-0.5 font-bold text-primary">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CRM: Детальная таблица студентов */}
      <div className="mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">👥 Студенты платформы (CRM)</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Показаны последние 50 пользователей, их статус подписки, трек и прогресс
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="py-2.5 px-3 font-medium">Пользователь</th>
                    <th className="py-2.5 px-3 font-medium">Telegram</th>
                    <th className="py-2.5 px-3 font-medium">Email</th>
                    <th className="py-2.5 px-3 font-medium">Трек</th>
                    <th className="py-2.5 px-3 font-medium text-center">Каналы</th>
                    <th className="py-2.5 px-3 font-medium text-center">Уроков</th>
                    <th className="py-2.5 px-3 font-medium">Дата регистрации</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {usersCRM.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-3 font-medium">
                        <div className="flex items-center gap-1.5">
                          <span>{u.username}</span>
                          {u.role === "admin" && (
                            <span className="rounded bg-amber-500/10 px-1.5 py-0.2 text-[10px] font-bold text-amber-500">
                              admin
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        {u.telegram_username ? (
                          <a
                            href={`https://t.me/${u.telegram_username}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-500 hover:underline"
                          >
                            @{u.telegram_username}
                          </a>
                        ) : u.telegram_id ? (
                          <span className="font-mono text-muted-foreground">ID: {u.telegram_id}</span>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        {u.email ? (
                          <div className="flex items-center gap-1">
                            <span className="truncate max-w-[140px]">{u.email}</span>
                            {u.email_verified ? (
                              <span className="text-emerald-500" title="Подтверждён">✓</span>
                            ) : (
                              <span className="text-amber-500 text-[10px]" title="Не подтверждён">⚠️</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[11px]">
                          {u.track_id || "не выбран"}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {u.is_subscribed_channels ? (
                          <span className="inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                            Подписан
                          </span>
                        ) : (
                          <span className="inline-block rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                            Нет
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-center font-bold">
                        {u.completed_lessons} / 151
                      </td>

                      <td className="py-2.5 px-3 text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString("ru-RU", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Очередь вопросов и поддержка (Тикеты) */}
      <div className="mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">
                💬 Служба поддержки и вопросы студентов ({allTickets.length})
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Вопросы из плеера уроков, комментариев и Telegram-бота (/ask)
              </p>
            </div>

            {/* Фильтр тикетов */}
            <div className="flex gap-1.5 text-xs">
              <Link
                href="/admin"
                className={`rounded px-2.5 py-1 ${!ticketStatusFilter ? "bg-primary text-primary-foreground font-bold" : "border hover:bg-muted"}`}
              >
                Все
              </Link>
              <Link
                href="/admin?status=open"
                className={`rounded px-2.5 py-1 ${ticketStatusFilter === "open" ? "bg-amber-500 text-white font-bold" : "border hover:bg-muted"}`}
              >
                Открытые ({openTicketsCount})
              </Link>
              <Link
                href="/admin?status=answered"
                className={`rounded px-2.5 py-1 ${ticketStatusFilter === "answered" ? "bg-emerald-600 text-white font-bold" : "border hover:bg-muted"}`}
              >
                Отвеченные
              </Link>
            </div>
          </CardHeader>

          <CardContent>
            {displayedTickets.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Вопросов в этой категории нет.
              </p>
            ) : (
              <div className="space-y-4">
                {displayedTickets.map(({ ticket, user: ticketUser }) => (
                  <div key={ticket.id} className="rounded-lg border p-4 bg-card/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {ticketUser.username}
                        </span>
                        {ticketUser.telegram_username && (
                          <a
                            href={`https://t.me/${ticketUser.telegram_username}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-sky-500 hover:underline"
                          >
                            @{ticketUser.telegram_username}
                          </a>
                        )}
                        <span className="rounded bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                          {ticket.source === "lesson_player"
                            ? `Урок: ${ticket.lesson_id || "плеер"}`
                            : ticket.source === "bot_question"
                            ? "Telegram-бот"
                            : "Сайт"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(ticket.created_at).toLocaleString("ru-RU", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            ticket.status === "open"
                              ? "bg-amber-500/10 text-amber-500"
                              : ticket.status === "answered"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {ticket.status === "open" ? "Ожидает" : ticket.status === "answered" ? "Отвечен" : "Закрыт"}
                        </span>
                      </div>
                    </div>

                    <p className="mt-2.5 text-sm bg-muted/20 p-2.5 rounded border border-border/50">
                      {ticket.question_text}
                    </p>

                    <AdminReplyForm
                      ticketId={ticket.id}
                      status={ticket.status}
                      adminReply={ticket.admin_reply}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
