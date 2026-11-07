import { describe, expect, it } from "vitest";
import { listRoles, getRole, getLevelImportance } from "@/lib/content/plan";
import { getExamForLevel, LEVEL_EXAMS } from "@/lib/content/test-out";

describe("AI-план и роли (My Plan)", () => {
  it("возвращает список всех 6 доступных ролей", () => {
    const roles = listRoles();
    expect(roles.length).toBe(6);
    const ids = roles.map((r) => r.id);
    expect(ids).toContain("developer");
    expect(ids).toContain("beginner");
    expect(ids).toContain("manager");
    expect(ids).toContain("designer");
    expect(ids).toContain("founder");
    expect(ids).toContain("ops");
  });

  it("находит роль по id", () => {
    const dev = getRole("developer");
    expect(dev).toBeDefined();
    expect(dev?.name).toBe("Разработчик");
    expect(dev?.priorities.skip).toContain("l1");
  });

  it("корректно определяет важность уровня (priority, useful, skip)", () => {
    expect(getLevelImportance("developer", "l1")).toBe("skip");
    expect(getLevelImportance("developer", "l3")).toBe("useful");
    expect(getLevelImportance("developer", "l8")).toBe("priority");

    expect(getLevelImportance("beginner", "l1")).toBe("priority");
    expect(getLevelImportance("manager", "l14")).toBe("skip");
    expect(getLevelImportance(null, "l1")).toBe("priority");
  });
});

describe("Сдача экстерном (Test Out)", () => {
  it("экзамены содержат вопросы с валидными вариантами и ответами", () => {
    const exams = Object.values(LEVEL_EXAMS);
    expect(exams.length).toBeGreaterThanOrEqual(5);

    for (const exam of exams) {
      expect(exam.questions.length).toBeGreaterThanOrEqual(3);
      expect(exam.passScore).toBeGreaterThanOrEqual(2);
      expect(exam.passScore).toBeLessThanOrEqual(exam.questions.length);

      for (const q of exam.questions) {
        expect(q.options.length).toBeGreaterThanOrEqual(3);
        expect(q.correct).toBeGreaterThanOrEqual(0);
        expect(q.correct).toBeLessThan(q.options.length);
        expect(q.explanation.length).toBeGreaterThan(0);
      }
    }
  });

  it("находит экзамен по levelId", () => {
    expect(getExamForLevel("l1")).toBeDefined();
    expect(getExamForLevel("l4")).toBeDefined();
    expect(getExamForLevel("unknown_level")).toBeNull();
  });
});
