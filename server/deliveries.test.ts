import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "test",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Deliveries API", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;
  const timestamp = Date.now();

  beforeAll(() => {
    ctx = createAuthContext();
    caller = appRouter.createCaller(ctx);
  });

  it("should create a new delivery", async () => {
    const result = await caller.deliveries.create({
      noteNumber: `TEST-${timestamp}-001`,
      clientCode: "C001",
      clientName: "Test Client",
      address: "Test Address 123",
      neighborhood: "Test Neighborhood",
      phone: "123456789",
      observations: "Test observation",
      entryDate: new Date(),
    });

      expect(result).toBeDefined();
      expect(result.noteNumber).toBe(`TEST-${timestamp}-001`);
    expect(result.clientName).toBe("Test Client");
    expect(result.status).toBe("pending");
  });

  it("should list deliveries", async () => {
    const result = await caller.deliveries.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("should not allow duplicate note + client code combination", async () => {
    const noteNumber = `TEST-${timestamp}-DUP`;
    const clientCode = "C002";
    await caller.deliveries.create({
      noteNumber,
      clientCode,
      clientName: "Test Client 2",
      address: "Test Address 456",
      neighborhood: "Test Neighborhood",
      phone: "987654321",
      entryDate: new Date(),
    });

    try {
      await caller.deliveries.create({
        noteNumber,
        clientCode,
        clientName: "Test Client 3",
        address: "Test Address 789",
        neighborhood: "Test Neighborhood",
        phone: "555555555",
        entryDate: new Date(),
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("já cadastrada");
    }
  });
});

describe("Drivers API", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;
  const timestamp = Date.now();

  beforeAll(() => {
    ctx = createAuthContext();
    caller = appRouter.createCaller(ctx);
  });

  it("should create a new driver", async () => {
    const result = await caller.drivers.create({
      name: `Test Driver ${timestamp}`,
      phone: "123456789",
      email: "driver@test.com",
    });

    expect(result).toBeDefined();
    expect(result.name).toBe(`Test Driver ${timestamp}`);
    expect(result.status).toBe("active");
  });

  it("should list drivers", async () => {
    const result = await caller.drivers.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter drivers by status", async () => {
    const result = await caller.drivers.list({ status: "active" });
    expect(Array.isArray(result)).toBe(true);
    result.forEach((driver) => {
      expect(driver.status).toBe("active");
    });
  });
});

describe("Dashboard API", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    ctx = createAuthContext();
    caller = appRouter.createCaller(ctx);
  });

  it("should get dashboard summary", async () => {
    const result = await caller.dashboard.summary();
    expect(result).toBeDefined();
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.pending).toBeGreaterThanOrEqual(0);
    expect(result.inTransit).toBeGreaterThanOrEqual(0);
    expect(result.delivered).toBeGreaterThanOrEqual(0);
    expect(result.returned).toBeGreaterThanOrEqual(0);
  });
});
