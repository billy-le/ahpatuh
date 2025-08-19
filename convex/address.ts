import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createAddress = mutation({
  args: {
    street1: v.string(),
    street2: v.optional(v.string()),
    city: v.string(),
    state: v.string(),
    country: v.string(),
    postalCode: v.string(),
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("addresses", {
      ...args,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const getAddress = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    return ctx.db.query("addresses", { businessId: args.businessId }).first();
  },
});
