import "server-only";
import { getSessionUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { desc, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminReplyForm } from "@/components/admin/admin-reply-form";

export const metadata = { title: "Админ-панель Zero2Agents" };

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const db = getDb();
  const dbUser = db.select().from(schema.users).where(eq(schema.users.id, user.id)).get();

  // Проверка прав администратора
  const isAuthorized =
    dbUser?.telegram_username?.toLowerCase() === "pr0_chatbot" ||
    dbUser?.username?.toLowerCase() === "pr0_chatbot" ||
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

  // Метрики
  const totalUsers = db.select({ count: sql<number>`count(*)` }).from(schema.users).get()?.count ?? 0;
  const tgUsers =
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(sql`${schema.users.telegram_id} IS NOT NULL`)
      .get()?.count ?? 0;
  const webOnlyUsers = totalUsers - tgUsers;

  // Источники трафика
  const utmStats = db
    .select({
      source: schema.users.utm_source,
      count: sql<number>`count(*)`,
    })
    .from(schema.users)
    .groupBy(schema.users.utm_source)
    .all();

  // Последние вопросы и тикеты
  const tickets = db
    .select({
      ticket: schema.supportTickets,
      user: schema.users,
    })
    .from(schema.supportTickets)
    .innerJoin(schema.users, eq(schema.supportTickets.user_id, schema.users.id))
    .orderBy(desc(schema.supportTickets.created_at))
    .limit(20)
    .all();

  // Пользователи
  const recentUsers = db
    .select()
    .from(schema.users)
    .orderBy(desc(schema.users.created_at))
    .limit(10)
    .all();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🛠 Админ-панель (@PR0_chatbot)</h1>
          <p className="text-muted-foreground">Управление пользователями, метриками и поддержкой</p>
        </div>
      </div>

      {/* KPI карточки */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Всего пользователей</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">В Telegram-боте</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tgUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Только на сайте</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{webOnlyUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Открытых тикетов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">
              {tickets.filter((t) => t.ticket.status === "open").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Источники переходов */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📍 Источники трафика (UTM / Referrals)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {utmStats.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b pb-2 text-sm">
                  <span className="font-medium">{item.source || "Прямой переход / Без UTM"}</span>
                  <span className="rounded bg-muted px-2 py-0.5 font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Последние зарегистрированные пользователи */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">👤 Новые пользователи</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-semibold">{u.username}</span>
                    {u.telegram_username && (
                      <span className="ml-2 text-xs text-muted-foreground">@{u.telegram_username}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString("ru-RU")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Очередь вопросов и поддержка */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💬 Вопросы пользователей (Сайт, Mini App и Бот)</CardTitle>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Вопросов пока нет. Они появятся здесь, когда пользователи оставят их в плеере уроков или в боте.
              </p>
            ) : (
              <div className="space-y-4">
                {tickets.map(({ ticket, user: ticketUser }) => (
                  <div key={ticket.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">
                        {ticketUser.username} {ticketUser.telegram_username && `(@${ticketUser.telegram_username})`}
                      </span>
                      <span className="rounded bg-muted px-2 py-0.5 text-xs">
                        Источник: {ticket.source}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">{ticket.question_text}</p>
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

