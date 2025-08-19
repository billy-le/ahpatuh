import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { betterAuthComponent } from "./auth";
import { omit } from "ramda";

export const createBusiness = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    domain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx);

    return await ctx.db.insert("businesses", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      domain: args.domain,
      userId,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const getBusinessDetails = query({
  args: {},
  handler: async (ctx) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx);
    const business = await ctx.db.query("businesses", { userId }).first();
    if (!business) return null;
    const address = await ctx.db
      .query("addresses", { businessId: business?._id })
      .first();
    const businessHours = await ctx.db
      .query("businessHours", { businessId: business?._id })
      .collect();
    const businessOmittedFields = omit(
      ["_creationTime", "updatedAt", "userId"],
      business,
    );
    return {
      ...businessOmittedFields,
      address: address ? omit(["_creationTime", "updatedAt"], address) : null,
      businessHours: businessHours.map((hours) =>
        omit(["_creationTime", "updatedAt"], hours),
      ),
    };
  },
});
