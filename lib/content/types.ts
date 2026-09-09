import { z } from "zod";

// ===== Блоки повествования (сериализуемы, рендерятся и на сервере, и в плеере) =====

export const textBlock = z.object({ type: z.literal("p"), text: z.string() });
export const headingBlock = z.object({ type: z.literal("h"), text: z.string() });
export const codeBlock = z.object({ type: z.literal("code"), text: z.string() });
export const noteBlock = z.object({ type: z.literal("note"), text: z.string() });
export const listBlock = z.object({ type: z.literal("ul"), items: z.array(z.string()) });

export const blockSchema = z.discriminatedUnion("type", [
  textBlock,
  headingBlock,
  codeBlock,
  noteBlock,
  listBlock,
]);
export type Block = z.infer<typeof blockSchema>;

// ===== Проверки терминальных заданий (сериализуемые цели) =====

export const fsAssertSchema = z.object({
  path: z.string(),
  exists: z.boolean().optional(),
  isDir: z.boolean().optional(),
  contains: z.string().optional(),
});
export type FsAssert = z.infer<typeof fsAssertSchema>;

export const terminalGoalSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("run"), match: z.string() }),
  z.object({ kind: z.literal("fs"), assert: fsAssertSchema }),
  z.object({ kind: z.literal("output"), contains: z.string() }),
  z.object({
    kind: z.literal("git"),
    state: z.enum(["repo", "clean", "committed", "has-commits", "message"]),
    message: z.string().optional(),
  }),
]);
export type TerminalGoal = z.infer<typeof terminalGoalSchema>;

export const fixtureSchema = z.object({
  files: z.record(z.string(), z.string()).optional(),
  cwd: z.string().optional(),
});
export type Fixture = z.infer<typeof fixtureSchema>;

// ===== Упражнения =====

export const quizExerciseSchema = z.object({
  type: z.literal("quiz"),
  question: z.string(),
  options: z.array(z.string()).min(2),
  correct: z.array(z.number().int().nonnegative()),
  explanation: z.string().optional(),
});

export const fillBlankExerciseSchema = z.object({
  type: z.literal("fill-blank"),
  instruction: z.string().optional(),
  template: z.string(),
  blanks: z.array(z.object({ accept: z.array(z.string()).min(1) })).min(1),
  explanation: z.string().optional(),
});

export const terminalExerciseSchema = z.object({
  type: z.literal("terminal"),
  task: z.string(),
  hint: z.string().optional(),
  fixture: fixtureSchema.optional(),
  goals: z.array(terminalGoalSchema).min(1),
});

export const exerciseSchema = z.discriminatedUnion("type", [
  quizExerciseSchema,
  fillBlankExerciseSchema,
  terminalExerciseSchema,
]);
export type Exercise = z.infer<typeof exerciseSchema>;

// ===== Шаг урока =====

export const stepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  content: z.array(blockSchema).optional(),
  exercise: exerciseSchema.optional(),
});
export type Step = z.infer<typeof stepSchema>;

// ===== Мета и сам урок =====

export const lessonScopeSchema = z.union([
  z.literal("common"),
  z.literal("generic-agent"),
  z.literal("track:claude-code"),
  z.literal("track:codex"),
  z.literal("track:gemini"),
  z.literal("track:mimocode"),
  z.literal("track:aider"),
  z.literal("track:ide-agents"),
]);
export type LessonScope = z.infer<typeof lessonScopeSchema>;

export const lessonMetaSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  minutes: z.number().int().positive(),
  goal: z.string().min(1),
  scope: lessonScopeSchema,
  skills: z.array(z.string()).default([]),
});
export type LessonMeta = z.infer<typeof lessonMetaSchema>;

export const lessonContentSchema = z.object({
  meta: lessonMetaSchema,
  content: z.array(blockSchema).optional(),
  steps: z.array(stepSchema).min(1),
});
export type LessonContent = z.infer<typeof lessonContentSchema>;

export type RegisteredLesson = LessonContent & {
  levelId: string;
  order: number;
};

// ===== Манифест агента (трек) =====

export const trackManifestSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  binary: z.string().min(1),
  accent: z.string().min(1),
  tagline: z.string().min(1),
  capabilities: z.array(z.string()).default([]),
  promptExamples: z.array(z.string()).default([]),
});
export type TrackManifest = z.infer<typeof trackManifestSchema>;

// ===== Мета уровня =====

export const cheatSheetItemSchema = z.object({
  cmd: z.string().min(1),
  description: z.string().min(1),
});

export const levelMetaSchema = z.object({
  id: z.string().regex(/^l[0-9]+$/),
  order: z.number().int().positive(),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  scope: z.union([z.literal("foundation"), z.literal("agent")]).default("foundation"),
  /** Команды/короткие шпаргалки уровня (кнопка Cheat sheet на дашборде). */
  cheatSheet: z.array(cheatSheetItemSchema).optional(),
});
export type LevelMeta = z.infer<typeof levelMetaSchema>;
export type CheatSheetItem = z.infer<typeof cheatSheetItemSchema>;
