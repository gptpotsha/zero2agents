import { describe, expect, it } from "vitest";
import { compileLesson, getTrack, TRACKS, resolvePlaceholders } from "@/lib/content/compiler";
import { getBaseRegistry, getLessonForTrack } from "@/lib/content/registry";

describe("компилятор треков", () => {
  it("трек claude-code зарегистрирован", () => {
    expect(TRACKS.length).toBeGreaterThanOrEqual(1);
    expect(getTrack("claude-code")?.binary).toBe("claude");
    expect(getTrack("nope")).toBeNull();
  });

  it("resolvePlaceholders резолвит все известные переменные", () => {
    const track = getTrack("claude-code")!;
    const out = resolvePlaceholders("{{agent.name}} зовётся {{agent.binary}}", track);
    expect(out).toBe("[CC] зовётся claude");
    expect(out).not.toContain("{{");
  });

  it("неизвестный плейсхолдер роняет компиляцию", () => {
    const track = getTrack("claude-code")!;
    expect(() => resolvePlaceholders("{{agent.unknown}}", track)).toThrow(/Неизвестные плейсхолдеры/);
  });

  it("compileLesson резолвит generic-урок под трек", () => {
    const track = getTrack("claude-code")!;
    const base = getBaseRegistry()
      .lessons.find((l) => l.meta.scope === "generic-agent");
    expect(base).toBeDefined();
    const compiled = compileLesson(base!, track);
    expect(JSON.stringify(compiled)).not.toContain("{{agent.");
    // название подставилось в title или в контент
    const serialized = JSON.stringify(compiled);
    expect(serialized).toContain(track.name);
    expect(serialized).toContain(track.binary);
  });
});

describe("getLessonForTrack", () => {
  it("common-урок не компилируется и не меняется", () => {
    const base = getBaseRegistry().lessons.find((l) => l.meta.scope === "common")!;
    const result = getLessonForTrack(base.levelId, base.meta.slug, "claude-code");
    expect(result).toBe(base); // тот же объект — компиляции не было
  });

  it("generic-agent урок компилируется под трек", () => {
    const base = getBaseRegistry().lessons.find((l) => l.meta.scope === "generic-agent")!;
    const result = getLessonForTrack(base.levelId, base.meta.slug, "claude-code");
    expect(result).toBeDefined();
    expect(JSON.stringify(result)).not.toContain("{{agent.");
  });

  it("каждый generic-урок компилируется под КАЖДЫЙ трек без неразрешённых плейсхолдеров", () => {
    const generics = getBaseRegistry().lessons.filter((l) => l.meta.scope === "generic-agent");
    expect(generics.length).toBeGreaterThanOrEqual(1);
    for (const track of TRACKS) {
      for (const lesson of generics) {
        const compiled = compileLesson(lesson, track);
        const serialized = JSON.stringify(compiled);
        expect(serialized, `${lesson.meta.slug} → ${track.id}`).not.toContain("{{agent.");
        expect(serialized, `${lesson.meta.slug} → ${track.id}`).toContain(track.binary);
      }
    }
  });

  it("все 4 трека уникальны по id и binary", () => {
    const ids = new Set(TRACKS.map((t) => t.id));
    const binaries = new Set(TRACKS.map((t) => t.binary));
    expect(ids.size).toBe(TRACKS.length);
    expect(binaries.size).toBe(TRACKS.length);
    expect(TRACKS.map((t) => t.id)).toEqual(
      expect.arrayContaining(["claude-code", "codex", "gemini", "aider"]),
    );
  });
});
