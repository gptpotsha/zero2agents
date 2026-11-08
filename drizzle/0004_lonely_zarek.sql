CREATE TABLE `account_link_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`code` text NOT NULL,
	`purpose` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `account_link_tokens_token_unique` ON `account_link_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `alt_token` ON `account_link_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `alt_code` ON `account_link_tokens` (`code`);--> statement-breakpoint
CREATE TABLE `srs_cards` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`question_id` text NOT NULL,
	`box` integer DEFAULT 1 NOT NULL,
	`next_review_at` integer NOT NULL,
	`current_attempts` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `srs_user_review` ON `srs_cards` (`user_id`,`next_review_at`);--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`source` text NOT NULL,
	`lesson_id` text,
	`contact_email` text,
	`question_text` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`admin_reply` text,
	`replied_via` text,
	`created_at` integer NOT NULL,
	`answered_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `st_user` ON `support_tickets` (`user_id`);--> statement-breakpoint
CREATE INDEX `st_status` ON `support_tickets` (`status`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text,
	`pass_hash` text,
	`role` text DEFAULT 'user' NOT NULL,
	`track_id` text,
	`role_id` text,
	`telegram_id` integer,
	`telegram_username` text,
	`first_name` text,
	`utm_source` text,
	`is_subscribed_channels` integer DEFAULT 0 NOT NULL,
	`onboarding_completed` integer DEFAULT 0 NOT NULL,
	`timezone_offset` integer DEFAULT 180 NOT NULL,
	`bot_blocked` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "username", "email", "pass_hash", "role", "track_id", "role_id", "created_at") SELECT "id", "username", NULL, "pass_hash", "role", "track_id", "role_id", "created_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_telegram_id_unique` ON `users` (`telegram_id`);