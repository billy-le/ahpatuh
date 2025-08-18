import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createBusiness = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    domain: v.optional(v.string()),
    address: v.object({
      street1: v.string(),
      street2: v.optional(v.string()),
      city: v.string(),
      state: v.string(),
      country: v.string(),
      postalCode: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("businesses", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      domain: args.domain,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const getBusiness = query({
  args: {
    id: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id);
  },
});
