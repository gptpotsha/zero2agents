import { sqliteTable, text, integer, primaryKey, index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  // Нижний регистр, уникально.
  username: text("username").notNull().unique(),
  // Email пользователя для входа, синхронизации и техподдержки
  email: text("email").unique(),
  // Формат: scrypt$N$r$p$salt_b64$hash_b64 (nullable, если вход только через Telegram)
  pass_hash: text("pass_hash"),
  role: text("role").notNull().default("user"), // free-план сегодня; задел под entitlements
  /** Выбранный агентский трек (claude-code | codex | gemini | ...) — null до выбора. */
  track_id: text("track_id"),
  /** Роль для персонализации пути («My Plan»): developer | beginner | manager | designer | founder | ops */
  role_id: text("role_id"),

  // Поля Telegram
  telegram_id: integer("telegram_id").unique(),
  telegram_username: text("telegram_username"),
  first_name: text("first_name"),
  utm_source: text("utm_source"),
  is_subscribed_channels: integer("is_subscribed_channels").notNull().default(0), // 0 | 1
  onboarding_completed: integer("onboarding_completed").notNull().default(0), // 0 | 1
  timezone_offset: integer("timezone_offset").notNull().default(180), // минут от UTC (по умолчанию UTC+3)
  bot_blocked: integer("bot_blocked").notNull().default(0), // 0 | 1

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

export const accountLinkTokens = sqliteTable(
  "account_link_tokens",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    code: text("code").notNull(),
    purpose: text("purpose").notNull(), // tg_link | web_magic_login | email_merge
    expires_at: integer("expires_at").notNull(),
    used_at: integer("used_at"),
  },
  (t) => [index("alt_token").on(t.token), index("alt_code").on(t.code)],
);

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
    type: text("type").notNull(), // lesson_completed | exercise_passed | level_tested_out | srs_quiz_passed
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

/** Карточки системы интервального повторения (SRS). */
export const srsCards = sqliteTable(
  "srs_cards",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lesson_id: text("lesson_id").notNull(),
    question_id: text("question_id").notNull(),
    box: integer("box").notNull().default(1), // 1..5
    next_review_at: integer("next_review_at").notNull(),
    current_attempts: integer("current_attempts").notNull().default(0), // 0..3
    status: text("status").notNull().default("pending"), // pending | active_in_chat | mastered
    created_at: integer("created_at").notNull(),
    updated_at: integer("updated_at").notNull(),
  },
  (t) => [index("srs_user_review").on(t.user_id, t.next_review_at)],
);

/** Единый центр вопросов и тикетов техподдержки. */
export const supportTickets = sqliteTable(
  "support_tickets",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    source: text("source").notNull(), // bot | web_comment | mini_app
    lesson_id: text("lesson_id"),
    contact_email: text("contact_email"),
    question_text: text("question_text").notNull(),
    status: text("status").notNull().default("open"), // open | answered | closed
    admin_reply: text("admin_reply"),
    replied_via: text("replied_via"), // telegram | email | web_comment
    created_at: integer("created_at").notNull(),
    answered_at: integer("answered_at"),
  },
  (t) => [index("st_user").on(t.user_id), index("st_status").on(t.status)],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type AccountLinkToken = typeof accountLinkTokens.$inferSelect;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
export type LessonComment = typeof lessonComments.$inferSelect;
export type NewLessonComment = typeof lessonComments.$inferInsert;
export type SrsCard = typeof srsCards.$inferSelect;
export type NewSrsCard = typeof srsCards.$inferInsert;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type NewSupportTicket = typeof supportTickets.$inferInsert;
