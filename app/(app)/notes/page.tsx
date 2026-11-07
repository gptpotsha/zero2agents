import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth/session";
import { listUserNotes } from "@/app/actions/notes";
import { getLesson } from "@/lib/content/registry";

export const metadata = { title: "Мои заметки" };

export default async function NotesPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const notesList = await listUserNotes();

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Мои заметки</h1>
          <p className="mt-1 text-muted-foreground">
            {notesList.length === 0
              ? "У тебя пока нет сохранённых заметок."
              : `Всего заметок: ${notesList.length}`}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← К урокам
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {notesList.length === 0 ? (
          <Card className="border-dashed p-8 text-center">
            <span className="text-3xl" aria-hidden="true">
              📝
            </span>
            <h3 className="mt-2 font-semibold text-base">Заметок пока нет</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Во время прохождения любого урока ты можешь открыть блок «Моя заметка» и записать важную команду или мысль.
            </p>
            <div className="mt-4">
              <Link href="/dashboard" className={buttonVariants({ size: "sm" })}>
                Перейти к обучению
              </Link>
            </div>
          </Card>
        ) : (
          notesList.map((n) => {
            const [levelId, slug] = n.lessonId.split("/");
            const lesson = getLesson(levelId, slug);
            return (
              <Card key={n.id} className="transition-colors hover:border-primary/40">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm font-semibold">
                      {lesson ? lesson.meta.title : n.lessonId}
                    </CardTitle>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(n.updatedAt)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-foreground">
                    {n.content}
                  </pre>
                  <div className="flex justify-end">
                    <Link
                      href={`/learn/${n.lessonId}`}
                      className="text-xs text-primary underline-offset-4 hover:underline"
                    >
                      К уроку →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </main>
  );
}
