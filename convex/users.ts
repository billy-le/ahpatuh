import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { betterAuthComponent } from './auth';
import { Id, Doc } from './_generated/dataModel';

export const getUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = (await betterAuthComponent.getAuthUserId(
      ctx,
    )) as Id<'users'>;
    if (!userId) throw new ConvexError({ message: 'Forbidden', code: 403 });
    const user = await ctx.db.get(userId);
    let language: Doc<'languages'> | null = null;
    if (user?.langId) {
      language = await ctx.db.get(user.langId!);
    }
    return {
      ...user,
      language,
    };
  },
});

export const updateUser = mutation({
  args: {
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    langId: v.optional(v.id('languages')),
    image: v.optional(v.string()),
    timeZone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = (await betterAuthComponent.getAuthUserId(
      ctx,
    )) as Id<'users'>;
    if (!userId) throw new ConvexError({ message: 'Forbidden', code: 403 });
    return await ctx.db.patch(userId, args);
  },
});
