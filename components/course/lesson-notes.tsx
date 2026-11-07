"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { saveLessonNoteAction } from "@/app/actions/notes";

export function LessonNotes({
  lessonId,
  initialNote,
}: {
  lessonId: string;
  initialNote?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState(initialNote ?? "");
  const [savedText, setSavedText] = useState(initialNote ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const res = await saveLessonNoteAction(lessonId, text);
      if (res.ok) {
        setSavedText(text);
        setStatus("Сохранено ✓");
        setTimeout(() => setStatus(null), 2000);
      }
    });
  };

  const isDirty = text !== savedText;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <span>📝 Моя заметка к уроку</span>
          {savedText && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
          <span>{isOpen ? "▲" : "▼"}</span>
        </button>
        {status && (
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
            {status}
          </span>
        )}
      </div>

      {isOpen && (
        <div className="space-y-2 pt-1 animate-in fade-in-50">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Запиши важное для себя: команду, аналогию или идею..."
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs leading-relaxed placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {isDirty ? "Есть несохранённые изменения" : "Заметка сохранена на сервере"}
            </span>
            <Button
              size="sm"
              disabled={!isDirty || isPending}
              onClick={handleSave}
              className="text-xs h-7 px-3"
            >
              {isPending ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
