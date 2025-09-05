import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { Doc } from './_generated/dataModel';
import { getAuthUser } from './_utils';

export const getUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    let language: Doc<'languages'> | null = null;
    if (user.langId) {
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
    const user = await getAuthUser(ctx);
    return await ctx.db.patch(user._id, args);
  },
});
