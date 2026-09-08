import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { BlockViewer } from "@/components/course/block-viewer";
import { LessonPlayer } from "@/components/course/lesson-player";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { getLesson, listLevels } from "@/lib/content/registry";

type Params = { params: Promise<{ level: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { level, slug } = await params;
  const lesson = getLesson(level, slug);
  return { title: lesson ? lesson.meta.title : "Урок не найден" };
}

export default async function LessonPage({ params }: Params) {
  const user = await getSessionUser();
  if (!user) return null; // (app)/layout редиректит на /login

  const { level: levelId, slug } = await params;
  const lesson = getLesson(levelId, slug);
  if (!lesson) notFound();

  const db = getDb();
  const lessonId = `${levelId}/${slug}`;
  const row = db
    .select()
    .from(schema.lessonProgress)
    .where(
      and(
        eq(schema.lessonProgress.user_id, user.id),
        eq(schema.lessonProgress.lesson_id, lessonId),
      ),
    )
    .get();

  const isCompleted = row?.status === "completed";
  // last solved step index из БД; initialDone = число уже решённых шагов
  const initialDone = isCompleted ? lesson.steps.length : row ? row.current_step_idx + 1 : 0;

  const level = listLevels().find((l) => l.id === levelId);
  const idxInLevel = level ? level.lessons.findIndex((l) => l.meta.slug === slug) : -1;
  const nextLesson =
    level && idxInLevel !== -1 && idxInLevel + 1 < level.lessons.length
      ? level.lessons[idxInLevel + 1]
      : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          ← К урокам
        </Link>
        <span className="text-sm text-muted-foreground">
          Уровень {level?.order ?? "?"}: {level?.title ?? ""}
        </span>
      </div>

      <header className="mb-6">
        <p className="text-sm text-muted-foreground">
          Урок {idxInLevel !== -1 ? idxInLevel + 1 : "?"} · {lesson.meta.minutes} мин ·{" "}
          {lesson.meta.skills.join(", ")}
        </p>
        <h1 className="mt-1 text-3xl font-bold">{lesson.meta.title}</h1>
        <p className="mt-3 text-muted-foreground">Цель: {lesson.meta.goal}</p>
      </header>

      {lesson.content && lesson.content.length > 0 && (
        <div className="mb-8 rounded-xl border bg-muted/20 p-5">
          <BlockViewer blocks={lesson.content} />
        </div>
      )}

      <LessonPlayer
        levelId={levelId}
        slug={slug}
        title={lesson.meta.title}
        steps={lesson.steps}
        initialDone={initialDone}
        isCompleted={isCompleted}
        nextLesson={
          nextLesson
            ? { levelId: nextLesson.levelId, slug: nextLesson.meta.slug, title: nextLesson.meta.title }
            : null
        }
      />
    </main>
  );
}
