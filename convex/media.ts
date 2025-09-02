import { ConvexError, v } from 'convex/values';
import { mutation, query, internalQuery } from './_generated/server';
import { getAuthUser, getBusiness } from './_utils';

export const getMetadata = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    await getAuthUser(ctx);
    return await ctx.db.system.get(args.storageId);
  },
});

export const getFilesBySha256 = query({
  args: { sha256: v.string() },
  handler: async (ctx, args) => {
    await getAuthUser(ctx);
    return await ctx.db.system
      .query('_storage')
      .filter((q) => q.eq('sha256', args.sha256))
      .collect();
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await getAuthUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const deleteStorage = mutation({
  args: {
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    await getAuthUser(ctx);
    return await ctx.storage.delete(args.storageId);
  },
});

export const getMediaUrl = internalQuery({
  args: {
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const mutateMedia = mutation({
  args: {
    _id: v.optional(v.id('media')),
    storageId: v.optional(v.id('_storage')),
    fileName: v.string(),
    width: v.number(),
    height: v.number(),
    duration: v.optional(v.number()),
    altText: v.optional(v.string()),
    caption: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);

    if (args.storageId) {
      return await ctx.db.insert('media', {
        storageId: args.storageId,
        fileName: args.fileName,
        width: args.width,
        height: args.height,
        duration: args.duration,
        altText: args.altText,
        caption: args.caption,
        title: args.title,
        description: args.title,
        businessId: business._id,
        createdBy: user._id,
        updatedAt: new Date().toISOString(),
      });
    } else if (args._id) {
      const media = await ctx.db.get(args._id);
      if (!media)
        throw new ConvexError({ message: 'Media not found', code: 404 });
      if (media.businessId !== business._id)
        throw new ConvexError({ message: 'Invalid Media Id', code: 403 });
      const { storageId, ...params } = args;
      return await ctx.db.patch(media._id, {
        ...params,
        updatedAt: new Date().toISOString(),
      });
    }

    throw new ConvexError({
      message: 'Must pass storageId or media._id',
      code: 400,
    });
  },
});

export const deleteMedia = mutation({
  args: {
    _id: v.id('media'),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    const media = await ctx.db.get(args._id);
    if (!media)
      throw new ConvexError({ message: 'Media not found', code: 404 });
    if (media.businessId !== business._id)
      throw new ConvexError({ message: 'Invalid Media Id', code: 403 });
    return await ctx.db.delete(args._id).then(() => media._id);
  },
});
