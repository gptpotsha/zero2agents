import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSessionUser } from "@/lib/auth/session";
import { AdSlot } from "@/components/monetization/AdSlot";
import { DonateButton } from "@/components/monetization/DonateButton";
import { ThemeToggle } from "@/components/theme-toggle";

const foundationPlan = [
  "Терминал: первые команды и навигация",
  "Файлы, папки, git и GitHub",
  "Как устроен софт: клиенты, серверы, API",
  "Node.js и сборка настоящего проекта",
];

const agentTracks = [
  { name: "Claude Code", note: "от Anthropic" },
  { name: "OpenAI Codex CLI", note: "от OpenAI" },
  { name: "Gemini CLI", note: "от Google" },
  { name: "Aider", note: "open source" },
  { name: "MiMoCode и локальные", note: "свои модели" },
  { name: "IDE-агенты", note: "Cursor, Cline и др." },
];

export default async function HomePage() {
  const user = await getSessionUser();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            С нуля до AI-агентов
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/practice"
              className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:inline-flex")}
            >
              Песочница
            </Link>
            <ThemeToggle />
            {user ? (
              <Link href="/dashboard" className={buttonVariants({ variant: "default" })}>
                К урокам
              </Link>
            ) : (
              <>
                <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }))}>
                  Войти
                </Link>
                <Link href="/register" className={buttonVariants({ variant: "default" })}>
                  Начать бесплатно
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4">
        <section className="py-16 text-center sm:py-24">
          <p className="mx-auto inline-block rounded-full border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            Интерактивный курс · 100% бесплатно · в браузере
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Научись терминалу — и строй проекты с AI-агентами
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Курс с нуля: сначала поймёшь, как устроен компьютер и командная строка, а потом
            освоишь AI-кодинг-агентов — Claude Code, Codex, Gemini CLI, Aider и других.
            Команды выполняешь прямо на сайте, ничего устанавливать не нужно.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ size: "lg" }))}
              >
                Продолжить обучение
              </Link>
            ) : (
              <Link
                href="/register"
                className={cn(buttonVariants({ size: "lg" }))}
              >
                Создать аккаунт и начать
              </Link>
            )}
            {!user && (
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                У меня уже есть аккаунт
              </Link>
            )}
          </div>
        </section>

        <section className="grid gap-6 pb-16 sm:grid-cols-3">
          {[
            {
              title: "Тренажёр терминала",
              text: "Встроенный виртуальный терминал: команды работают по-настоящему, а файлы — виртуальные. Ошибаться можно сколько угодно.",
            },
            {
              title: "Не про один инструмент",
              text: "Фундамент общий для всех агентов. Дальше выбираешь своего: Claude Code, Codex, Gemini CLI, Aider или IDE-агенты.",
            },
            {
              title: "Маленькие шаги",
              text: "Уроки на 3–7 минут с проверкой: терминальные задания, викторины, заполнение пропусков. Прогресс сохраняется.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border p-5">
              <h2 className="font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </section>

        <section className="pb-16">
          <h2 className="text-2xl font-bold">Как устроен курс</h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Этап 1 · Фундамент (для всех)
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {foundationPlan.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-primary">›</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                Первые уроки уже доступны: уровень 1 открыт для всех.
              </p>
            </div>
            <div className="rounded-xl border p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Этап 2 · Твой AI-агент
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {agentTracks.map((track) => (
                  <span key={track.name} className="rounded-full border px-3 py-1 text-xs">
                    {track.name}
                    <span className="text-muted-foreground"> · {track.note}</span>
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Уроки адаптируются под выбранный инструмент: команды, файлы настроек, MCP и
                продвинутые приёмы.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <p>С нуля до AI-агентов — бесплатный интерактивный курс.</p>
          <div className="flex items-center gap-4">
            <DonateButton />
          </div>
        </div>
        <AdSlot placement="landing-footer" />
      </footer>
    </div>
  );
}
