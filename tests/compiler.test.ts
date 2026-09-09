import { describe, expect, it } from "vitest";
import { compileLesson, getTrack, TRACKS } from "@/lib/content/compiler";
import { getBaseRegistry, getLessonForTrack } from "@/lib/content/registry";
import { resolvePlaceholders } from "@/content/agents/claude-code/manifest";

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
});
