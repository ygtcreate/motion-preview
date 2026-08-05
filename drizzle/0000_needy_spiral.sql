CREATE TABLE IF NOT EXISTS `motions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`duration` real NOT NULL,
	`fps` integer NOT NULL,
	`file_size` integer NOT NULL,
	`updated_at` text NOT NULL,
	`r2_key` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `motions_r2_key_unique` ON `motions` (`r2_key`);
--> statement-breakpoint
INSERT OR IGNORE INTO `motions` (`id`, `name`, `category`, `duration`, `fps`, `file_size`, `updated_at`, `r2_key`, `sort_order`) VALUES
	('idle-01', 'Idle', 'Idle', 8.33, 30, 788464, '2026.07.22', 'Motions/Idle.fbx', 1),
	('walk-01', 'Walking', 'Walk', 1.03, 30, 366208, '2026.07.22', 'Motions/Walking.fbx', 2),
	('jump-01', 'Jump', 'Action', 2.60, 30, 557248, '2026.07.22', 'Motions/Jump.fbx', 3);
--> statement-breakpoint
PRAGMA optimize;
