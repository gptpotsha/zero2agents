"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { quizExerciseSchema } from "@/lib/content/types";
import type { z } from "zod";

type QuizExercise = z.infer<typeof quizExerciseSchema>;

export function QuizExercise({
  exercise,
  onSolved,
}: {
  exercise: QuizExercise;
  onSolved: () => void;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState(false);
  const [solved, setSolved] = useState(false);

  const toggle = (index: number) => {
    if (solved) return;
    setWrong(false);
    const next = new Set(selected);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelected(next);
  };

  const check = () => {
    const expected = new Set(exercise.correct);
    const isExact = expected.size === selected.size && [...expected].every((i) => selected.has(i));
    if (!isExact || selected.size === 0) {
      setWrong(true);
      return;
    }
    setSolved(true);
    setTimeout(onSolved, 900);
  };

  const answerLabels = ["А", "Б", "В", "Г", "Д", "Е"];

  return (
    <div className="rounded-lg border p-4">
      <p className="mb-3 font-medium">{exercise.question}</p>
      <div className="mb-4 grid gap-2">
        {exercise.options.map((option, i) => {
          const isSelected = selected.has(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              disabled={solved}
              aria-pressed={isSelected}
              className={`flex items-start gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                isSelected ? "border-primary bg-primary/10" : "hover:bg-muted"
              } ${solved ? "cursor-default opacity-80" : "cursor-pointer"}`}
            >
              <span className="mt-0.5 shrink-0 font-mono text-xs text-muted-foreground">
                {answerLabels[i] ?? i + 1}
              </span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>
      {wrong && (
        <p className="mb-3 text-sm text-destructive">
          Пока не то. Подсказка: {exercise.explanation ?? "проверь, все ли верные варианты отмечены."}
        </p>
      )}
      {solved ? (
        <p className="text-sm font-medium text-green-600 dark:text-green-400">Верно!</p>
      ) : (
        <Button onClick={check} disabled={selected.size === 0}>
          Проверить
        </Button>
      )}
    </div>
  );
}
