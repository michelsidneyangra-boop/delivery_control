import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  boolean
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Drivers table for managing delivery drivers
 */
export const drivers = mysqlTable("drivers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = typeof drivers.$inferInsert;

/**
 * Deliveries table for managing delivery orders
 */
export const deliveries = mysqlTable("deliveries", {
  id: int("id").autoincrement().primaryKey(),
  noteNumber: varchar("noteNumber", { length: 50 }).notNull().unique(),
  clientCode: varchar("clientCode", { length: 50 }).notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  address: text("address").notNull(),
  neighborhood: varchar("neighborhood", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  observations: text("observations"),
  entryDate: timestamp("entryDate").notNull(),
  status: mysqlEnum("status", ["pending", "in_transit", "delivered", "returned"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Delivery = typeof deliveries.$inferSelect;
export type InsertDelivery = typeof deliveries.$inferInsert;

/**
 * Delivery movements table for tracking delivery lifecycle
 * Tracks: entry, exit (assignment to driver), and return (delivery confirmation)
 */
export const deliveryMovements = mysqlTable("deliveryMovements", {
  id: int("id").autoincrement().primaryKey(),
  deliveryId: int("deliveryId").notNull(),
  movementType: mysqlEnum("movementType", ["entry", "exit", "return"]).notNull(),
  driverId: int("driverId"),
  conferentId: int("conferentId"), // Person who confirmed delivery
  conferentName: varchar("conferentName", { length: 255 }),
  deliveryStatus: mysqlEnum("deliveryStatus", ["delivered", "returned"]), // For return movements
  movementDate: timestamp("movementDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DeliveryMovement = typeof deliveryMovements.$inferSelect;
export type InsertDeliveryMovement = typeof deliveryMovements.$inferInsert;
