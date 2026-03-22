CREATE TABLE `loginUsers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(100) NOT NULL,
	`password` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loginUsers_id` PRIMARY KEY(`id`),
	CONSTRAINT `loginUsers_username_unique` UNIQUE(`username`)
);
