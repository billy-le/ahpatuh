import { ConvexError, v } from 'convex/values';
import { mutation, internalQuery } from './_generated/server';
import { getAuthUser, getBusiness } from './_utils';

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
    fileName: v.string(),
    altText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    if (args._id) {
      const media = await ctx.db.get(args._id);
      if (!media)
        throw new ConvexError({ message: 'Media not found', code: 404 });
      if (media.businessId !== media.businessId)
        throw new ConvexError({ message: 'Invalid Media Id', code: 403 });
      const { _id, ...params } = args;
      return await ctx.db.patch(media._id, {
        ...params,
        updatedAt: new Date().toISOString(),
      });
    }

    return await ctx.db.insert('media', {
      ...args,
      status: 'PENDING',
      businessId: business._id,
      updatedAt: new Date().toISOString(),
      createdBy: user._id,
    });
  },
});

export const updateMediaStatus = mutation({
  args: {
    _id: v.id('media'),
    status: v.union(
      v.literal('PENDING'),
      v.literal('READY'),
      v.literal('FAILED'),
    ),
  },
  handler: async (ctx, args) => {
    await getAuthUser(ctx);
    return await ctx.db.patch(args._id, { status: args.status });
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
    const mediaMediaVariants = await ctx.db
      .query('mediaMediaVariants')
      .withIndex('by_mediaId', (q) => q.eq('mediaId', media._id))
      .collect();
    // delete media and media variants relations
    await Promise.all(mediaMediaVariants.map((m) => ctx.db.delete(m._id)));
    // delete all variants
    await Promise.all(
      mediaMediaVariants.map((m) => ctx.db.delete(m.mediaVariantId)),
    );
    return await ctx.db.delete(args._id);
  },
});
