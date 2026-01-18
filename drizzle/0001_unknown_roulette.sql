CREATE TABLE `meal_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`meal_type` text NOT NULL,
	`items` text NOT NULL,
	`notes` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `meal_logs_user_id_idx` ON `meal_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `meal_logs_date_idx` ON `meal_logs` (`date`);--> statement-breakpoint
CREATE TABLE `nutrition_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`daily_calories` real NOT NULL,
	`protein_grams` real NOT NULL,
	`carbs_grams` real NOT NULL,
	`fats_grams` real NOT NULL,
	`custom_ratios` text,
	`start_date` text NOT NULL,
	`is_active` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `nutrition_plans_user_id_idx` ON `nutrition_plans` (`user_id`);--> statement-breakpoint
CREATE INDEX `nutrition_plans_active_idx` ON `nutrition_plans` (`is_active`);--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`servings` real NOT NULL,
	`ingredients` text NOT NULL,
	`instructions` text,
	`tags` text,
	`nutrition_per_serving` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `recipes_user_id_idx` ON `recipes` (`user_id`);--> statement-breakpoint
CREATE INDEX `recipes_name_idx` ON `recipes` (`name`);--> statement-breakpoint
CREATE INDEX `diary_user_id_idx` ON `diary` (`user_id`);--> statement-breakpoint
CREATE INDEX `diary_date_idx` ON `diary` (`date`);--> statement-breakpoint
CREATE INDEX `foods_name_idx` ON `foods` (`name`);--> statement-breakpoint
CREATE INDEX `foods_barcode_idx` ON `foods` (`barcode`);