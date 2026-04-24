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

/**
 * Simple login users table for app authentication
 * No role-based access, just username and password
 */
export const loginUsers = mysqlTable("loginUsers", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LoginUser = typeof loginUsers.$inferSelect;
export type InsertLoginUser = typeof loginUsers.$inferInsert;

/**
 * WhatsApp configuration table for storing store number and connection status
 */
export const whatsappConfig = mysqlTable("whatsappConfig", {
  id: int("id").autoincrement().primaryKey(),
  storeNumber: varchar("storeNumber", { length: 20 }).notNull().unique(),
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(),
  isConnected: boolean("isConnected").default(false).notNull(),
  lastChecked: timestamp("lastChecked"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WhatsappConfig = typeof whatsappConfig.$inferSelect;
export type InsertWhatsappConfig = typeof whatsappConfig.$inferInsert;

/**
 * WhatsApp message templates for each delivery status
 */
export const whatsappTemplates = mysqlTable("whatsappTemplates", {
  id: int("id").autoincrement().primaryKey(),
  status: mysqlEnum("status", ["pending", "in_transit", "delivered", "returned", "satisfaction"]).notNull(),
  template: text("template").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WhatsappTemplate = typeof whatsappTemplates.$inferSelect;
export type InsertWhatsappTemplate = typeof whatsappTemplates.$inferInsert;

/**
 * WhatsApp message history for tracking sent messages
 */
export const whatsappMessages = mysqlTable("whatsappMessages", {
  id: int("id").autoincrement().primaryKey(),
  deliveryId: int("deliveryId").notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(),
  messageType: mysqlEnum("messageType", ["pending", "in_transit", "delivered", "returned", "satisfaction"]).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["sent", "failed", "pending"]).default("pending").notNull(),
  sentAt: timestamp("sentAt"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WhatsappMessage = typeof whatsappMessages.$inferSelect;
export type InsertWhatsappMessage = typeof whatsappMessages.$inferInsert;
