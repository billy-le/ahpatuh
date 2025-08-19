import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createBusinessHours = mutation({
  args: {
    businessHours: v.array(
      v.object({
        dayOfWeek: v.union(
          v.literal(0),
          v.literal(1),
          v.literal(2),
          v.literal(3),
          v.literal(4),
          v.literal(5),
          v.literal(6),
        ),
        timeOpen: v.optional(v.string()),
        timeClose: v.optional(v.string()),
        isClosed: v.boolean(),
      }),
    ),
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    return Promise.all(
      args.businessHours.map((businessHour) =>
        ctx.db.insert("businessHours", {
          ...businessHour,
          businessId: args.businessId,
          updatedAt: new Date().toISOString(),
        }),
      ),
    );
  },
});

export const getBusinessHours = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("businessHours", { businessId: args.businessId })
      .collect();
  },
});
