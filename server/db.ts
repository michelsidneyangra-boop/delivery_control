import { eq, and, or, like, gte, lte, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  drivers,
  deliveries,
  deliveryMovements,
  type Driver,
  type Delivery,
  type DeliveryMovement,
  type InsertDriver,
  type InsertDelivery,
  type InsertDeliveryMovement
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER OPERATIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ DRIVER OPERATIONS ============

export async function createDriver(driver: InsertDriver): Promise<Driver> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(drivers).values(driver);
  const driverId = Number(result[0].insertId);
  
  const created = await db.select().from(drivers).where(eq(drivers.id, driverId)).limit(1);
  return created[0];
}

export async function getDrivers(status?: string): Promise<Driver[]> {
  const db = await getDb();
  if (!db) return [];

  if (status) {
    return db.select().from(drivers).where(eq(drivers.status, status as any));
  }
  return db.select().from(drivers);
}

export async function getDriverById(id: number): Promise<Driver | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(drivers).where(eq(drivers.id, id)).limit(1);
  return result[0];
}

export async function updateDriver(id: number, data: Partial<InsertDriver>): Promise<Driver> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(drivers).set(data).where(eq(drivers.id, id));
  
  const updated = await db.select().from(drivers).where(eq(drivers.id, id)).limit(1);
  return updated[0];
}

export async function deleteDriver(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(drivers).where(eq(drivers.id, id));
}

// ============ DELIVERY OPERATIONS ============

export async function createDelivery(delivery: InsertDelivery): Promise<Delivery> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(deliveries).values(delivery);
  const deliveryId = Number(result[0].insertId);
  
  const created = await db.select().from(deliveries).where(eq(deliveries.id, deliveryId)).limit(1);
  return created[0];
}

export async function getDeliveries(filters?: {
  status?: string;
  driverId?: number;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  neighborhood?: string;
}): Promise<Delivery[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [];

  if (filters?.status) {
    conditions.push(eq(deliveries.status, filters.status as any));
  }

  if (filters?.search) {
    conditions.push(
      or(
        like(deliveries.noteNumber, `%${filters.search}%`),
        like(deliveries.clientCode, `%${filters.search}%`),
        like(deliveries.clientName, `%${filters.search}%`),
        like(deliveries.phone, `%${filters.search}%`)
      )
    );
  }

  if (filters?.neighborhood) {
    conditions.push(like(deliveries.neighborhood, `%${filters.neighborhood}%`));
  }

  if (filters?.startDate) {
    conditions.push(gte(deliveries.entryDate, filters.startDate));
  }

  if (filters?.endDate) {
    conditions.push(lte(deliveries.entryDate, filters.endDate));
  }

  if (conditions.length > 0) {
    return db.select().from(deliveries).where(and(...conditions)).orderBy(desc(deliveries.createdAt));
  }

  return db.select().from(deliveries).orderBy(desc(deliveries.createdAt));
}

export async function getDeliveryById(id: number): Promise<Delivery | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(deliveries).where(eq(deliveries.id, id)).limit(1);
  return result[0];
}

export async function getDeliveryByNoteNumber(noteNumber: string): Promise<Delivery | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(deliveries).where(eq(deliveries.noteNumber, noteNumber)).limit(1);
  return result[0];
}

export async function getDeliveryByNoteAndCode(noteNumber: string, clientCode: string): Promise<Delivery | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(deliveries)
    .where(
      and(
        eq(deliveries.noteNumber, noteNumber),
        eq(deliveries.clientCode, clientCode)
      )
    )
    .limit(1);
  return result[0];
}

export async function getClientByCode(clientCode: string): Promise<Delivery | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(deliveries)
    .where(eq(deliveries.clientCode, clientCode))
    .limit(1);
  return result[0];
}

export async function updateDelivery(id: number, data: Partial<InsertDelivery>): Promise<Delivery> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(deliveries).set(data).where(eq(deliveries.id, id));
  
  const updated = await db.select().from(deliveries).where(eq(deliveries.id, id)).limit(1);
  return updated[0];
}

export async function deleteDelivery(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(deliveries).where(eq(deliveries.id, id));
}

// ============ DELIVERY MOVEMENT OPERATIONS ============

export async function createDeliveryMovement(movement: InsertDeliveryMovement): Promise<DeliveryMovement> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(deliveryMovements).values(movement);
  const movementId = Number(result[0].insertId);
  
  const created = await db.select().from(deliveryMovements).where(eq(deliveryMovements.id, movementId)).limit(1);
  return created[0];
}

export async function getDeliveryMovements(deliveryId: number): Promise<DeliveryMovement[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(deliveryMovements)
    .where(eq(deliveryMovements.deliveryId, deliveryId))
    .orderBy(desc(deliveryMovements.movementDate));
}

export async function getLatestMovement(deliveryId: number): Promise<DeliveryMovement | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(deliveryMovements)
    .where(eq(deliveryMovements.deliveryId, deliveryId))
    .orderBy(desc(deliveryMovements.movementDate))
    .limit(1);
  
  return result[0];
}

export async function getClientInfo(clientCode: string): Promise<{ name: string; address: string; neighborhood: string | null; phone: string | null } | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select({
    name: deliveries.clientName,
    address: deliveries.address,
    neighborhood: deliveries.neighborhood,
    phone: deliveries.phone,
  })
    .from(deliveries)
    .where(eq(deliveries.clientCode, clientCode))
    .limit(1);
  
  return result[0];
}

export async function getDeliveriesByDriver(driverId: number): Promise<Delivery[]> {
  const db = await getDb();
  if (!db) return [];

  // Get all delivery movements for this driver with exit type
  const movements = await db.select({ deliveryId: deliveryMovements.deliveryId })
    .from(deliveryMovements)
    .where(
      and(
        eq(deliveryMovements.driverId, driverId),
        eq(deliveryMovements.movementType, "exit")
      )
    );

  if (movements.length === 0) return [];

  const deliveryIds = movements.map(m => m.deliveryId);
  if (deliveryIds.length === 0) return [];
  
  const conditions = deliveryIds.map(id => eq(deliveries.id, id));
  return db.select().from(deliveries).where(or(...conditions));
}
