import { ConvexError, v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { getAuthUser, getBusiness } from './_utils';
import { Doc } from './_generated/dataModel';

export const getServices = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    const services = await ctx.db
      .query('services')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .collect();

    const serviceWithCategories: (Doc<'services'> & {
      categories: Doc<'categories'>[];
      media: (Doc<'media'> & { url: string })[];
    })[] = [];

    for (const { categoryIds = [], mediaIds = [], ...service } of services) {
      const categories = await Promise.all(
        categoryIds.map((catId) => ctx.db.get(catId)),
      );
      const nonNullCategories = categories.filter((c): c is Doc<'categories'> =>
        Boolean(c),
      );
      const media = await Promise.all(
        mediaIds.map((media) => ctx.db.get(media)),
      );
      const nonNullMedia = media.filter((m): m is Doc<'media'> => Boolean(m));
      const ms: (typeof serviceWithCategories)[number]['media'] = [];
      for (const media of nonNullMedia) {
        const mediaUrl = await ctx.storage.getUrl(media.storageId);
        if (mediaUrl) {
          ms.push({
            ...media,
            url: mediaUrl,
          });
        }
      }
      const serviceWithCat = {
        ...service,
        categoryIds,
        categories: nonNullCategories,
        media: ms,
      };

      serviceWithCategories.push(serviceWithCat);
    }

    return serviceWithCategories;
  },
});

export const mutateService = mutation({
  args: {
    _id: v.optional(v.id('services')),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    categoryIds: v.optional(v.array(v.id('categories'))),
    mediaIds: v.optional(v.array(v.id('media'))),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    if (args._id) {
      const service = await ctx.db
        .query('services')
        .withIndex('by_id', (q) => q.eq('_id', args._id!))
        .unique();
      if (!service)
        throw new ConvexError({ message: 'Service not found', code: 404 });
      if (service.businessId !== business._id)
        throw new ConvexError({ message: 'Invalid Service Id', code: 400 });
      const { _id, ...params } = args;
      return await ctx.db.patch(service._id, {
        ...params,
        updatedAt: new Date().toISOString(),
      });
    }

    return await ctx.db.insert('services', {
      ...args,
      businessId: business._id,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const deleteService = mutation({
  args: {
    _id: v.id('services'),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    const service = await ctx.db
      .query('services')
      .withIndex('by_id', (q) => q.eq('_id', args._id!))
      .unique();
    if (!service)
      throw new ConvexError({ message: 'Service not found', code: 404 });
    if (service.businessId !== business._id)
      throw new ConvexError({ message: 'Invalid Service Id', code: 400 });
    return await ctx.db.delete(args._id);
  },
});
