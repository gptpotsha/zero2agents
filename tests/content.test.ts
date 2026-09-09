import { describe, expect, it } from "vitest";
import { getRegistry } from "@/lib/content/registry";

describe("реестр контента", () => {
  it("валидирует все уроки и собирает уровни", () => {
    const registry = getRegistry();
    expect(registry.lessons.length).toBeGreaterThanOrEqual(3);
    const lessons = registry.lessons;
    for (const lesson of lessons) {
      expect(lesson.steps.length).toBeGreaterThan(0);
      expect(lesson.meta.title.length).toBeGreaterThan(0);
    }
  });

  it("ищет урок по level/slug", () => {
    expect(getRegistry().byKey.get("l1/first-commands")).toBeDefined();
  });
});

describe("консистентность контента", () => {
  it("число пропусков ____ совпадает с числом ответов в fill-blank", () => {
    const { lessons } = getRegistry();
    for (const lesson of lessons) {
      for (const step of lesson.steps) {
        if (step.exercise?.type === "fill-blank") {
          const holes = step.exercise.template.split("____").length - 1;
          expect(holes, `${lesson.meta.slug}/${step.id}: число пропусков`).toBe(step.exercise.blanks.length);
        }
      }
    }
  });

  it("quiz: ответы не пустые, correct в диапазоне", () => {
    const { lessons } = getRegistry();
    for (const lesson of lessons) {
      for (const step of lesson.steps) {
        if (step.exercise?.type === "quiz") {
          expect(step.exercise.options.length).toBeGreaterThanOrEqual(2);
          for (const c of step.exercise.correct) {
            expect(c).toBeGreaterThanOrEqual(0);
            expect(c).toBeLessThan(step.exercise.options.length);
          }
        }
      }
    }
  });

  it("terminal: у каждого задания есть task и хотя бы одна цель", () => {
    const { lessons } = getRegistry();
    for (const lesson of lessons) {
      for (const step of lesson.steps) {
        if (step.exercise?.type === "terminal") {
          expect(step.exercise.task.length).toBeGreaterThan(0);
          expect(step.exercise.goals.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
