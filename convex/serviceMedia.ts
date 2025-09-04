import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthUser, getBusiness } from './_utils';

export const getServiceMedia = query({
  args: {
    serviceId: v.optional(v.id('services')),
    mediaId: v.optional(v.id('media')),
  },
  handler: async (ctx, args) => {
    if (!args.serviceId && !args.mediaId)
      throw new ConvexError({
        message: 'Service Id or Media Id missing',
        code: 400,
      });
    await getAuthUser(ctx);
    if (args.serviceId) {
      return await ctx.db
        .query('serviceMedia')
        .withIndex('by_serviceId', (q) => q.eq('serviceId', args.serviceId!))
        .collect();
    }
    return await ctx.db
      .query('serviceMedia')
      .withIndex('by_mediaId', (q) => q.eq('mediaId', args.mediaId!))
      .collect();
  },
});

export const mutateServiceMedia = mutation({
  args: {
    serviceId: v.id('services'),
    mediaId: v.id('media'),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    const service = await ctx.db.get(args.serviceId);
    if (!service)
      throw new ConvexError({ message: 'Service not found', code: 404 });
    if (service.businessId !== business._id)
      throw new ConvexError({ message: 'Invalid Service Id', code: 403 });
    const media = await ctx.db.get(args.mediaId);
    if (!media)
      throw new ConvexError({ message: 'Media not found', code: 4040 });
    if (media.businessId !== business._id)
      throw new ConvexError({ message: 'Invalid Media Id', code: 403 });
    return await ctx.db.insert('serviceMedia', args);
  },
});

export const deleteServiceMedia = mutation({
  args: {
    _id: v.id('serviceMedia'),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    const serviceMedia = await ctx.db.get(args._id);
    if (!serviceMedia)
      throw new ConvexError({ message: 'Service Media not found', code: 404 });

    const service = await ctx.db.get(serviceMedia.serviceId);
    const media = await ctx.db.get(serviceMedia.mediaId);
    if (!service || !media)
      throw new ConvexError({
        message: 'Internal Server Error',
        reason: 'Unknown Service Media',
        code: 500,
      });
    if (
      service.businessId !== business._id ||
      media.businessId !== business._id
    )
      throw new ConvexError({ message: 'Invalid Service Media Id', code: 403 });
    return await ctx.db.delete(args._id);
  },
});
