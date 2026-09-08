import { describe, expect, it } from "vitest";
import { localDate, computeStreakFromDates } from "@/lib/streaks-core";

describe("localDate", () => {
  it("форматирует YYYY-MM-DD", () => {
    const ts = new Date(2026, 8, 8, 14, 30).getTime(); // 8 сент 2026
    expect(localDate(ts)).toBe("2026-09-08");
  });

  it("ведущие нули", () => {
    const ts = new Date(2026, 0, 5).getTime();
    expect(localDate(ts)).toBe("2026-01-05");
  });
});

describe("computeStreakFromDates", () => {
  it("пустые даты — стрик 0", () => {
    expect(computeStreakFromDates([], "2026-09-08")).toEqual({ current: 0, longest: 0 });
  });

  it("сегодня — стрик 1", () => {
    expect(computeStreakFromDates(["2026-09-08"], "2026-09-08")).toEqual({ current: 1, longest: 1 });
  });

  it("вчера без сегодня — стрик ещё жив", () => {
    expect(computeStreakFromDates(["2026-09-07"], "2026-09-08")).toEqual({ current: 1, longest: 1 });
  });

  it("позавчера без вчера/сегодня — стрик сломан", () => {
    expect(computeStreakFromDates(["2026-09-06"], "2026-09-08")).toEqual({ current: 0, longest: 1 });
  });

  it("5 дней подряд — current 5, longest 5", () => {
    const dates = ["2026-09-04", "2026-09-05", "2026-09-06", "2026-09-07", "2026-09-08"];
    expect(computeStreakFromDates(dates, "2026-09-08")).toEqual({ current: 5, longest: 5 });
  });

  it("длинный прошлый стрик + свежий 2 дня", () => {
    const dates = [
      "2026-08-01", "2026-08-02", "2026-08-03", "2026-08-04", "2026-08-05", "2026-08-06", "2026-08-07",
      "2026-09-07", "2026-09-08",
    ];
    expect(computeStreakFromDates(dates, "2026-09-08")).toEqual({ current: 2, longest: 7 });
  });

  it("дубликаты дат не ломают подсчёт", () => {
    expect(computeStreakFromDates(["2026-09-07", "2026-09-07", "2026-09-08"], "2026-09-08")).toEqual({
      current: 2,
      longest: 2,
    });
  });
});
