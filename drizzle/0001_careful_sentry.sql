CREATE TABLE `deliveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`noteNumber` varchar(50) NOT NULL,
	`clientCode` varchar(50) NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`address` text NOT NULL,
	`neighborhood` varchar(100),
	`phone` varchar(20),
	`observations` text,
	`entryDate` timestamp NOT NULL,
	`status` enum('pending','in_transit','delivered','returned') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deliveries_id` PRIMARY KEY(`id`),
	CONSTRAINT `deliveries_noteNumber_unique` UNIQUE(`noteNumber`)
);
--> statement-breakpoint
CREATE TABLE `deliveryMovements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deliveryId` int NOT NULL,
	`movementType` enum('entry','exit','return') NOT NULL,
	`driverId` int,
	`conferentId` int,
	`conferentName` varchar(255),
	`deliveryStatus` enum('delivered','returned'),
	`movementDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deliveryMovements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `drivers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(20),
	`email` varchar(320),
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `drivers_id` PRIMARY KEY(`id`)
);
