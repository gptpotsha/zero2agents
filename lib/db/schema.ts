import { sqliteTable, text, integer, primaryKey, index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  // Нижний регистр, уникально. Без email.
  username: text("username").notNull().unique(),
  // Формат: scrypt$N$r$p$salt_b64$hash_b64
  pass_hash: text("pass_hash").notNull(),
  role: text("role").notNull().default("user"), // free-план сегодня; задел под entitlements
  /** Выбранный агентский трек (claude-code | codex | gemini | ...) — null до выбора. */
  track_id: text("track_id"),
  /** Роль для персонализации пути («My Plan»): developer | beginner | manager | designer | founder | ops */
  role_id: text("role_id"),
  created_at: integer("created_at").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // sha256 hex случайного токена (сам токен в cookie, в БД — только хэш)
  token_hash: text("token_hash").notNull().unique(),
  expires_at: integer("expires_at").notNull(),
  created_at: integer("created_at").notNull(),
});

export const lessonProgress = sqliteTable(
  "lesson_progress",
  {
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lesson_id: text("lesson_id").notNull(),
    level_id: text("level_id").notNull(),
    status: text("status").notNull().default("in_progress"), // in_progress | completed
    current_step_idx: integer("current_step_idx").notNull().default(0),
    completed_at: integer("completed_at"),
    updated_at: integer("updated_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.user_id, t.lesson_id] }), index("lp_user").on(t.user_id)],
);

/** Единственный источник ачивок/стриков/XP. */
export const activityEvents = sqliteTable(
  "activity_events",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // lesson_completed | exercise_passed | level_tested_out
    payload: text("payload").notNull().default("{}"), // JSON
    created_at: integer("created_at").notNull(),
    /** Локальный день пользователя (YYYY-MM-DD) для streak-подсчёта. */
    event_date: text("event_date").notNull(),
  },
  (t) => [index("ae_user_date").on(t.user_id, t.event_date)],
);

/** Личные заметки пользователя к урокам. */
export const notes = sqliteTable(
  "notes",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lesson_id: text("lesson_id").notNull(),
    content: text("content").notNull(),
    created_at: integer("created_at").notNull(),
    updated_at: integer("updated_at").notNull(),
  },
  (t) => [index("notes_user").on(t.user_id), index("notes_lesson").on(t.lesson_id)],
);

/** Комментарии и вопросы учеников к урокам. */
export const lessonComments = sqliteTable(
  "lesson_comments",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lesson_id: text("lesson_id").notNull(),
    author_name: text("author_name").notNull(),
    content: text("content").notNull(),
    created_at: integer("created_at").notNull(),
  },
  (t) => [index("lc_lesson").on(t.lesson_id)],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
export type LessonComment = typeof lessonComments.$inferSelect;
export type NewLessonComment = typeof lessonComments.$inferInsert;
