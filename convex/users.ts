import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user;
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    langId: v.optional(v.id("languages")),
    image: v.optional(v.string()),
    timeZone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...userData } = args;
    return await ctx.db.patch(userId, userData);
  },
});
