import { v } from 'convex/values';
import { internalMutation, mutation } from './_generated/server';
import { getAuthUser } from './_utils';

export const createMediaMediaVariant = mutation({
  args: {
    mediaId: v.id('media'),
    mediaVariantId: v.id('mediaVariants'),
  },
  handler: async (ctx, args) => {
    await getAuthUser(ctx);
    return await ctx.db.insert('mediaMediaVariants', args);
  },
});

export const deleteMediaMediaVariant = internalMutation({
  args: {
    _id: v.id('mediaMediaVariants'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args._id);
  },
});
