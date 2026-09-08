import Link from "next/link";
import { getRegistry } from "@/lib/content/registry";

/**
 * Левая «ценностная» панель страниц входа/регистрации.
 * Адаптация AuthValuePanel из zero2claude.dev: бренд, заголовок,
 * зелёный коллаут «бесплатно», фичи-буллеты. Без фейковой статистики —
 * показываем реальное число уроков из реестра контента.
 */
export function AuthValuePanel({ variant }: { variant: "login" | "register" }) {
  const lessonsCount = getRegistry().lessons.length;

  const headline =
    variant === "login" ? (
      <>
        Освой терминал.
        <br />
        Строй с AI-агентами.
      </>
    ) : (
      <>
        Начни учиться
        <br />
        бесплатно. Сегодня.
      </>
    );

  const tagline =
    variant === "login"
      ? "Интерактивный курс: от нулевого опыта в командной строке до реальных проектов вместе с AI-агентом."
      : "Без карты и триала. Сразу к интерактивным урокам — терминал и AI-агенты с нуля.";

  const freeDetail =
    variant === "login"
      ? "Все уроки. Без карты. Без триала. Навсегда."
      : "Все уровни, все уроки. Никаких платных стен и допродаж. Навсегда.";

  const features = [
    {
      icon: "📚",
      text:
        variant === "login"
          ? "Практические уроки с проверкой — от первых команд до AI-агентов"
          : "Старт за 30 секунд — ничего не устанавливай, учись в браузере",
    },
    {
      icon: "🤖",
      text:
        variant === "login"
          ? "Не один агент, а все: [CC], Codex, Gemini CLI, Aider и другие"
          : "Тренажёр терминала встроен в курс — команды работают по-настоящему",
    },
    {
      icon: "🚀",
      text:
        variant === "login"
          ? "Прогресс сохраняется — продолжай с того же шага в любой день"
          : "Фундамент общий, агент выберешь под себя в начале пути",
    },
  ];

  return (
    <aside
      className="relative hidden w-[420px] shrink-0 flex-col justify-center overflow-hidden border-r bg-card lg:flex"
      style={{ padding: "clamp(32px, 4vw, 48px)" }}
      aria-label="О курсе"
    >
      {/* Декоративное размытие в углу (как в оригинале) */}
      <div
        className="pointer-events-none absolute -top-24 -end-24 h-72 w-72 rounded-full"
        style={{ background: "color-mix(in srgb, var(--primary) 6%, transparent)", filter: "blur(80px)" }}
      />

      {/* Бренд */}
      <div className="relative z-10 mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 font-mono text-sm font-bold text-primary">
          &gt;_
        </div>
        <span className="font-mono text-sm font-semibold">С нуля до AI-агентов</span>
      </div>

      <h2 className="relative z-10 mb-3 font-mono text-2xl font-bold leading-tight">{headline}</h2>
      <p className="relative z-10 mb-6 text-sm leading-relaxed text-muted-foreground">{tagline}</p>

      {/* Зелёный коллаут «бесплатно» */}
      <div
        className="relative z-10 mb-6 flex items-center gap-3 rounded-xl border p-4"
        style={{
          background: "color-mix(in srgb, #22C55E 6%, transparent)",
          borderColor: "color-mix(in srgb, #22C55E 18%, transparent)",
        }}
      >
        <span className="shrink-0 text-xl" aria-hidden="true">
          🎉
        </span>
        <div>
          <div
            className="font-mono text-sm font-bold"
            style={{ color: "#22C55E" }}
          >
            100% бесплатно — без подвоха
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">{freeDetail}</div>
        </div>
      </div>

      {/* Фичи-буллеты */}
      <ul className="relative z-10 mb-8 space-y-3">
        {features.map((f) => (
          <li key={f.text} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm"
              style={{ background: "color-mix(in srgb, var(--primary) 10%, transparent)" }}
              aria-hidden="true"
            >
              {f.icon}
            </span>
            <span>{f.text}</span>
          </li>
        ))}
      </ul>

      {/* Нижняя строка: честная статистика — реальные уроки курса */}
      <div className="relative z-10 space-y-2.5 border-t pt-5">
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: "#22C55E" }}
          />
          <span>
            <strong className="font-mono text-foreground">{lessonsCount}</strong> уроков уже в
            курсе — и это только начало
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Курс развивается открыто,{" "}
          <Link href="/" className="underline underline-offset-2 hover:text-foreground">
            узнай больше
          </Link>
        </p>
      </div>
    </aside>
  );
}
