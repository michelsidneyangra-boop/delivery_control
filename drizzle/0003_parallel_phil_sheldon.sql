CREATE TABLE `whatsappConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeNumber` varchar(20) NOT NULL,
	`phoneNumber` varchar(20) NOT NULL,
	`isConnected` boolean NOT NULL DEFAULT false,
	`lastChecked` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `whatsappConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `whatsappConfig_storeNumber_unique` UNIQUE(`storeNumber`)
);
--> statement-breakpoint
CREATE TABLE `whatsappMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deliveryId` int NOT NULL,
	`phoneNumber` varchar(20) NOT NULL,
	`messageType` enum('pending','in_transit','delivered','returned','satisfaction') NOT NULL,
	`message` text NOT NULL,
	`status` enum('sent','failed','pending') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `whatsappMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whatsappTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`status` enum('pending','in_transit','delivered','returned','satisfaction') NOT NULL,
	`template` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `whatsappTemplates_id` PRIMARY KEY(`id`)
);
