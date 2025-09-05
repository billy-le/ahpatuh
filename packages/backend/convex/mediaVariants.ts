import { internalMutation, mutation } from './_generated/server';
import { ConvexError, v } from 'convex/values';

export const mutateMediaVariant = mutation({
  args: {
    fileName: v.string(),
    width: v.number(),
    height: v.number(),
    url: v.string(),
    mimeType: v.string(),
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('mediaVariants', args);
  },
});

export const deleteMediaVariant = internalMutation({
  args: {
    _id: v.id('mediaVariants'),
  },
  handler: async (ctx, args) => {
    const mediaVariant = await ctx.db.get(args._id);
    if (!mediaVariant)
      throw new ConvexError({ message: 'Media Variant not found', code: 404 });
    await ctx.storage.delete(mediaVariant.storageId);
    return await ctx.db.delete(args._id);
  },
});
