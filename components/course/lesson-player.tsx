"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { BlockViewer } from "@/components/course/block-viewer";
import { QuizExercise } from "@/components/exercises/quiz-exercise";
import { FillBlankExercise } from "@/components/exercises/fill-blank-exercise";
import { TerminalExercise } from "@/components/exercises/terminal-exercise";
import { ExploreExercise } from "@/components/exercises/explore-exercise";
import { completeLesson, saveLessonStep } from "@/app/actions/progress";
import type { Step, Exercise } from "@/lib/content/types";

export interface NextLesson {
  levelId: string;
  slug: string;
  title: string;
}

interface LessonPlayerProps {
  levelId: string;
  slug: string;
  title: string;
  steps: Step[];
  /** Сколько шагов уже решено (для resume). */
  initialDone: number;
  isCompleted: boolean;
  nextLesson: NextLesson | null;
}

function ExerciseView({ exercise, onSolved }: { exercise: Exercise; onSolved: () => void }) {
  switch (exercise.type) {
    case "quiz":
      return <QuizExercise exercise={exercise} onSolved={onSolved} />;
    case "fill-blank":
      return <FillBlankExercise exercise={exercise} onSolved={onSolved} />;
    case "terminal":
      return <TerminalExercise exercise={exercise} onSolved={onSolved} />;
    case "explore":
      return <ExploreExercise exercise={exercise} onSolved={onSolved} />;
    default:
      return <p className="text-sm text-destructive">Неизвестный тип упражнения.</p>;
  }
}

export function LessonPlayer({
  levelId,
  slug,
  title,
  steps,
  initialDone,
  isCompleted,
  nextLesson,
}: LessonPlayerProps) {
  const startDone = isCompleted ? steps.length : Math.max(0, Math.min(initialDone, steps.length - 1));
  const [doneCount, setDoneCount] = useState(startDone);
  const [finale, setFinale] = useState(isCompleted);
  // Время прохождения: от монтирования до финального шага (для завершённого заранее — не показываем).
  const startedAtRef = useRef<number>(0);
  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);
  const [elapsedSec, setElapsedSec] = useState<number | null>(null);

  const activeIdx = useMemo(() => Math.min(doneCount, steps.length), [doneCount, steps.length]);
  const persist = useCallback(
    async (idx: number, last: boolean) => {
      try {
        await saveLessonStep(levelId, slug, idx);
        if (last) await completeLesson(levelId, slug);
      } catch {
        // Офлайн/сессия протухла — прогресс сохранится при следующем действии.
      }
    },
    [levelId, slug],
  );

  const advance = useCallback(
    (idx: number) => {
    const isLast = idx === steps.length - 1;
    if (isLast) {
      setDoneCount(steps.length);
        const started = startedAtRef.current || Date.now();
        setElapsedSec(Math.max(1, Math.round((Date.now() - started) / 1000)));
      setFinale(true);
    } else {
      setDoneCount(idx + 1);
      requestAnimationFrame(() => {
        document.getElementById(`step-${idx + 1}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    void persist(idx, isLast);
    },
    [steps.length, persist],
  );

  const completePercentage = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <div>
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>Прогресс урока</span>
          <span>
            Шаг {Math.min(doneCount + 1, steps.length)} из {steps.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${completePercentage}%` }}
          />
        </div>
      </div>

      {finale ? (
        <div className="rounded-xl border p-6 text-center">
          <p className="text-3xl" aria-hidden="true">✅</p>
          <h2 className="mt-2 text-xl font-semibold">Урок пройден</h2>
          <p className="mt-2 text-muted-foreground">
            Ты разобрался с темой «{title}». Прогресс сохранён.
          </p>
          {elapsedSec !== null && (
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              Время: {Math.floor(elapsedSec / 60)}м {elapsedSec % 60}с
            </p>
          )}

          {/* Up next — как у оригинала: следующий урок крупным блоком */}
          {nextLesson && (
            <Link
              href={`/learn/${nextLesson.levelId}/${nextLesson.slug}`}
              className="mt-6 block rounded-lg border bg-muted/40 p-4 text-left transition-colors hover:bg-muted/70"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Дальше
              </p>
              <p className="mt-1 font-semibold">{nextLesson.title}</p>
              <p className="mt-0.5 text-sm text-primary">Следующий урок →</p>
            </Link>
          )}

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard"
              className={buttonVariants({ variant: "outline" })}
            >
              К списку уроков
            </Link>
          </div>
        </div>
      ) : (
        steps.map((step, idx) => {
          const isDone = idx < activeIdx;
          const isActive = idx === activeIdx;
          if (isActive) {
            return (
              <section key={step.id} id={`step-${idx}`} className="rounded-lg border p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Шаг {idx + 1} из {steps.length}
                </p>
                <h2 className="mb-3 mt-1 text-xl font-semibold">{step.title}</h2>
                {step.content && step.content.length > 0 && <BlockViewer blocks={step.content} />}
                {step.exercise ? (
                  <div className="mt-4">
                    <ExerciseView exercise={step.exercise} onSolved={() => advance(idx)} />
                  </div>
                ) : (
                  <div className="mt-4">
                    <Button onClick={() => advance(idx)}>Далее</Button>
                  </div>
                )}
              </section>
            );
          }
          if (isDone) {
            return (
              <section key={step.id} className="rounded-lg border border-green-600/20 bg-muted/30 p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-medium">{step.title}</h2>
                  <span className="text-sm text-green-600 dark:text-green-400">✓ пройден</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Шаг {idx + 1} из {steps.length}</p>
              </section>
            );
          }
          return (
            <section key={step.id} className="rounded-lg border border-dashed p-5 opacity-60">
              <h2 className="font-medium">{step.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Заблокирован — сначала пройди предыдущие шаги.
              </p>
            </section>
          );
        })
      )}
    </div>
  );
}
