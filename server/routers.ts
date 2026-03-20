import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ DRIVERS ROUTER ============
  drivers: router({
    list: protectedProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.getDrivers(input?.status);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        phone: z.string().optional(),
        email: z.string().email().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createDriver({
          name: input.name,
          phone: input.phone,
          email: input.email,
          status: "active",
        });
      }),

    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const driver = await db.getDriverById(input);
        if (!driver) throw new TRPCError({ code: "NOT_FOUND" });
        return driver;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        status: z.enum(["active", "inactive"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateDriver(id, data);
      }),

    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        await db.deleteDriver(input);
        return { success: true };
      }),
  }),

  // ============ DELIVERIES ROUTER ============
  deliveries: router({
    list: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        search: z.string().optional(),
        neighborhood: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getDeliveries(input);
      }),

    create: protectedProcedure
      .input(z.object({
        noteNumber: z.string().min(1),
        clientCode: z.string().min(1),
        clientName: z.string().min(1),
        address: z.string().min(1),
        neighborhood: z.string().optional(),
        phone: z.string().optional(),
        observations: z.string().optional(),
        entryDate: z.date(),
      }))
      .mutation(async ({ input }) => {
        // Check if note already exists
        const existing = await db.getDeliveryByNoteNumber(input.noteNumber);
        if (existing) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Nota fiscal já cadastrada",
          });
        }

        const delivery = await db.createDelivery({
          ...input,
          status: "pending",
        });

        // Create entry movement
        await db.createDeliveryMovement({
          deliveryId: delivery.id,
          movementType: "entry",
          movementDate: new Date(),
        });

        return delivery;
      }),

    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const delivery = await db.getDeliveryById(input);
        if (!delivery) throw new TRPCError({ code: "NOT_FOUND" });
        return delivery;
      }),

    getByNoteNumber: protectedProcedure
      .input(z.string())
      .query(async ({ input }) => {
        const delivery = await db.getDeliveryByNoteNumber(input);
        if (!delivery) throw new TRPCError({ code: "NOT_FOUND" });
        return delivery;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        clientName: z.string().optional(),
        address: z.string().optional(),
        neighborhood: z.string().optional(),
        phone: z.string().optional(),
        observations: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateDelivery(id, data);
      }),

    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        await db.deleteDelivery(input);
        return { success: true };
      }),
  }),

  // ============ DELIVERY MOVEMENTS ROUTER ============
  movements: router({
    getByDelivery: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getDeliveryMovements(input);
      }),

    // Register exit (assign driver)
    registerExit: protectedProcedure
      .input(z.object({
        deliveryId: z.number(),
        driverId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const delivery = await db.getDeliveryById(input.deliveryId);
        if (!delivery) throw new TRPCError({ code: "NOT_FOUND" });

        const driver = await db.getDriverById(input.driverId);
        if (!driver) throw new TRPCError({ code: "NOT_FOUND" });

        // Create exit movement
        const movement = await db.createDeliveryMovement({
          deliveryId: input.deliveryId,
          movementType: "exit",
          driverId: input.driverId,
          movementDate: new Date(),
        });

        // Update delivery status to in_transit
        await db.updateDelivery(input.deliveryId, { status: "in_transit" });

        return movement;
      }),

    // Register return (confirm delivery or return)
    registerReturn: protectedProcedure
      .input(z.object({
        deliveryId: z.number(),
        deliveryStatus: z.enum(["delivered", "returned"]),
        conferentName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const delivery = await db.getDeliveryById(input.deliveryId);
        if (!delivery) throw new TRPCError({ code: "NOT_FOUND" });

        // Create return movement
        const movement = await db.createDeliveryMovement({
          deliveryId: input.deliveryId,
          movementType: "return",
          deliveryStatus: input.deliveryStatus,
          conferentName: input.conferentName,
          movementDate: new Date(),
        });

        // Update delivery status
        const newStatus = input.deliveryStatus === "delivered" ? "delivered" : "returned";
        await db.updateDelivery(input.deliveryId, { status: newStatus });

        return movement;
      }),
  }),

  // ============ DASHBOARD ROUTER ============
  dashboard: router({
    summary: protectedProcedure
      .query(async () => {
        const allDeliveries = await db.getDeliveries();
        
        const pending = allDeliveries.filter(d => d.status === "pending").length;
        const inTransit = allDeliveries.filter(d => d.status === "in_transit").length;
        const delivered = allDeliveries.filter(d => d.status === "delivered").length;
        const returned = allDeliveries.filter(d => d.status === "returned").length;

        return {
          total: allDeliveries.length,
          pending,
          inTransit,
          delivered,
          returned,
        };
      }),

    recentDeliveries: protectedProcedure
      .input(z.number().optional())
      .query(async ({ input }) => {
        const limit = input || 10;
        const allDeliveries = await db.getDeliveries();
        return allDeliveries.slice(0, limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
