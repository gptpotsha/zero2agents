"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getExamForLevel } from "@/lib/content/test-out";
import { testOutLevelAction } from "@/app/actions/test-out";

export function TestOutButton({
  levelId,
  levelTitle,
  isCompleted,
}: {
  levelId: string;
  levelTitle: string;
  isCompleted: boolean;
}) {
  const exam = getExamForLevel(levelId);
  const [open, setOpen] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  if (!exam || isCompleted) return null;

  const currentQuestion = exam.questions[currentQ];
  const totalQuestions = exam.questions.length;

  const handleSelectOption = (optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQ]: optIdx }));
  };

  const calculateScore = () => {
    let correct = 0;
    exam.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) correct++;
    });
    return correct;
  };

  const score = calculateScore();
  const isPassed = score >= exam.passScore;

  const handleFinishExam = () => {
    startTransition(async () => {
      const res = await testOutLevelAction(levelId);
      if (res.ok) {
        setResultMsg(res.message ?? "Уровень зачтён!");
        setTimeout(() => {
          setOpen(false);
        }, 1200);
      }
    });
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setCurrentQ(0);
    setSubmitted(false);
    setResultMsg(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={(props) => (
          <Button
            {...props}
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
            title="Сдать уровень экстерном, если уже знаешь материал"
          >
            <span aria-hidden="true">⚡</span>
            <span>Сдать экстерном</span>
          </Button>
        )}
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <DialogTitle className="text-base">{exam.title}</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Знаешь материал? Ответь правильно на вопросы, чтобы сразу закрыть все уроки уровня.
          </DialogDescription>
        </DialogHeader>

        {!submitted ? (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Вопрос {currentQ + 1} из {totalQuestions}</span>
              <span>Нужно верно: {exam.passScore} из {totalQuestions}</span>
            </div>

            <div className="rounded-lg border bg-muted/20 p-4">
              <p className="font-medium text-sm leading-relaxed mb-3">
                {currentQuestion.question}
              </p>
              <div className="space-y-2">
                {currentQuestion.options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[currentQ] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full rounded-md border p-2.5 text-left text-xs transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/10 font-semibold text-primary"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentQ === 0}
                onClick={() => setCurrentQ((prev) => prev - 1)}
                className="text-xs"
              >
                ← Назад
              </Button>

              {currentQ < totalQuestions - 1 ? (
                <Button
                  size="sm"
                  disabled={selectedAnswers[currentQ] === undefined}
                  onClick={() => setCurrentQ((prev) => prev + 1)}
                  className="text-xs"
                >
                  Дальше →
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={Object.keys(selectedAnswers).length < totalQuestions}
                  onClick={() => setSubmitted(true)}
                  className="text-xs bg-green-600 hover:bg-green-700 text-white"
                >
                  Завершить тест
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-3 text-center">
            <div className="text-3xl" aria-hidden="true">
              {isPassed ? "🎉" : "📚"}
            </div>
            <div>
              <h4 className="font-semibold text-base">
                {isPassed ? "Экзамен успешно сдан!" : "Не хватило правильных ответов"}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Правильно {score} из {totalQuestions} (проходной балл: {exam.passScore}).
              </p>
            </div>

            {isPassed ? (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-muted-foreground">
                  Нажми кнопку ниже, чтобы автоматически зачесть все уроки уровня «{levelTitle}».
                </p>
                {resultMsg && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    ✓ {resultMsg}
                  </p>
                )}
                <Button
                  onClick={handleFinishExam}
                  disabled={isPending}
                  className="w-full text-xs"
                >
                  {isPending ? "Зачитываем уроки..." : "Зачесть весь уровень"}
                </Button>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-muted-foreground">
                  Рекомендуем пройти уроки уровня по порядку — в них много ценных практических нюансов!
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={handleReset} className="text-xs">
                    Попробовать снова
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="text-xs">
                    Закрыть
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
