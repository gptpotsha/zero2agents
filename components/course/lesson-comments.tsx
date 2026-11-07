"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { addLessonCommentAction, type CommentItem } from "@/app/actions/comments";

export function LessonComments({
  lessonId,
  initialComments,
}: {
  lessonId: string;
  initialComments: CommentItem[];
}) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [content, setContent] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
      const res = await addLessonCommentAction(lessonId, content);
      if (res.ok) {
        setComments((prev) => [
          {
            id: crypto.randomUUID(),
            authorName: "Ты",
            content: content.trim(),
            createdAt: Date.now(),
            isOwner: true,
          },
          ...prev,
        ]);
        setContent("");
        setError(null);
      } else {
        setError(res.error ?? "Ошибка отправки");
      }
    });
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <span>💬 Вопросы и обсуждение ({comments.length})</span>
          <span>{isOpen ? "▲" : "▼"}</span>
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4 pt-1 animate-in fade-in-50">
          <form onSubmit={handleSubmit} className="space-y-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Остался вопрос по уроку или нашёл крутой лайфхак? Напиши здесь..."
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs leading-relaxed placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={!content.trim() || isPending}
                className="text-xs h-7 px-3"
              >
                {isPending ? "Отправка..." : "Отправить"}
              </Button>
            </div>
          </form>

          <div className="divide-y divide-border/40">
            {comments.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2 italic">
                Пока никто не оставил вопросов. Будь первым!
              </p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="py-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">{c.authorName}</span>
                    <span>{formatDate(c.createdAt)}</span>
                  </div>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{c.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
