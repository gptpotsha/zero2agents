"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { fillBlankExerciseSchema } from "@/lib/content/types";
import type { z } from "zod";

type FillBlankExercise = z.infer<typeof fillBlankExerciseSchema>;

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/ё/g, "е")
    .trim()
    .replace(/\s+/g, " ");

export function FillBlankExercise({
  exercise,
  onSolved,
}: {
  exercise: FillBlankExercise;
  onSolved: () => void;
}) {
  const parts = exercise.template.split("____");
  const [values, setValues] = useState<string[]>(() => exercise.blanks.map(() => ""));
  const [wrongBlank, setWrongBlank] = useState<number | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [solved, setSolved] = useState(false);

  if (parts.length !== exercise.blanks.length + 1) {
    return (
      <p className="text-sm text-destructive">
        Ошибка контента: число пропусков не совпадает с ответами.
      </p>
    );
  }

  const check = () => {
    const emptyIdx = values.findIndex((v) => v.trim() === "");
    if (emptyIdx !== -1) {
      setWrongBlank(emptyIdx);
      setAttempted(true);
      return;
    }
    const firstWrong = exercise.blanks.findIndex(
      (blank, i) => !blank.accept.some((answer) => normalize(answer) === normalize(values[i] ?? "")),
    );
    if (firstWrong !== -1) {
      setWrongBlank(firstWrong);
      setAttempted(true);
      return;
    }
    setWrongBlank(null);
    setSolved(true);
    setTimeout(onSolved, 900);
  };

  return (
    <div className="rounded-lg border p-4">
      {exercise.instruction && (
        <p className="mb-3 text-sm text-muted-foreground">{exercise.instruction}</p>
      )}
      <p className="mb-4 text-lg leading-9">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < exercise.blanks.length && (
              <input
                value={values[i] ?? ""}
                onChange={(e) => {
                  if (wrongBlank === i) setWrongBlank(null);
                  const next = [...values];
                  next[i] = e.target.value;
                  setValues(next);
                }}
                disabled={solved}
                aria-label={`Пропуск ${i + 1}`}
                className={`mx-1 inline-block w-48 rounded border bg-background px-2 py-0.5 text-sm outline-none focus:border-primary disabled:opacity-70 ${
                  wrongBlank === i ? "border-destructive ring-2 ring-destructive/20" : ""
                }`}
              />
            )}
          </span>
        ))}
      </p>
      {wrongBlank !== null && attempted && (
        <p className="mb-3 text-sm text-destructive">
          {values[wrongBlank]?.trim() === ""
            ? `Пропуск ${wrongBlank + 1} пустой — заполни все пропуски.`
            : `Не совпадает пропуск ${wrongBlank + 1}. Подумай: какое слово здесь точнее? (регистр и форма «ё/е» не важны)`}
        </p>
      )}
      {solved ? (
        <p className="text-sm font-medium text-green-600 dark:text-green-400">Верно!</p>
      ) : (
        <Button onClick={check} disabled={values.some((v) => v.trim() === "")}>
          Проверить
        </Button>
      )}
      {solved && exercise.explanation && (
        <p className="mt-3 text-sm text-muted-foreground">{exercise.explanation}</p>
      )}
    </div>
  );
}
