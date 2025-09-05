import { ConvexError, v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { getAuthUser, getBusiness } from './_utils';
import { Doc } from './_generated/dataModel';
import { internal } from './_generated/api';

export const getServices = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    const services = await ctx.db
      .query('services')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .collect();

    const serviceWithCatAndMedia: (Doc<'services'> & {
      categories: Doc<'categories'>[];
      media: (Doc<'media'> & {
        variants: Doc<'mediaVariants'>[];
      })[];
    })[] = [];

    for (const service of services) {
      const serviceCategories = await ctx.db
        .query('serviceCategories')
        .withIndex('by_serviceId', (q) => q.eq('serviceId', service._id))
        .collect();
      const categories = await Promise.all(
        serviceCategories.map((sc) => ctx.db.get(sc.categoryId)),
      );

      const nonNullCategories = categories.filter((c): c is Doc<'categories'> =>
        Boolean(c),
      );
      const serviceMedia = await ctx.db
        .query('serviceMedia')
        .withIndex('by_serviceId', (q) => q.eq('serviceId', service._id))
        .collect();
      const media = await Promise.all(
        serviceMedia.map((sm) => ctx.db.get(sm.mediaId)),
      );
      const nonNullMedia = media.filter((m): m is Doc<'media'> => Boolean(m));

      const mediaWithVariants: (typeof serviceWithCatAndMedia)[number]['media'] =
        [];
      for (const m of nonNullMedia) {
        const withVariants: (typeof mediaWithVariants)[number] = {
          ...m,
          variants: [],
        };
        const storageMediaVariants = await ctx.db
          .query('mediaMediaVariants')
          .withIndex('by_mediaId', (q) => q.eq('mediaId', m._id))
          .collect();
        for (const smv of storageMediaVariants) {
          const variant = await ctx.db.get(smv.mediaVariantId);
          if (variant) {
            withVariants.variants.push(variant);
          }
        }
        mediaWithVariants.push(withVariants);
      }
      const combined = {
        ...service,
        categories: nonNullCategories,
        media: mediaWithVariants,
      };

      serviceWithCatAndMedia.push(combined);
    }

    return serviceWithCatAndMedia;
  },
});

export const mutateService = mutation({
  args: {
    _id: v.optional(v.id('services')),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    categoryIds: v.array(v.id('categories')),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    if (args._id) {
      const service = await ctx.db.get(args._id);
      if (!service)
        throw new ConvexError({ message: 'Service not found', code: 404 });
      if (service.businessId !== business._id)
        throw new ConvexError({ message: 'Invalid Service Id', code: 400 });
      const { _id, categoryIds, ...params } = args;
      await ctx.db.patch(service._id, {
        ...params,
        updatedAt: new Date().toISOString(),
      });
      const serviceCategories = await ctx.db
        .query('serviceCategories')
        .withIndex('by_serviceId', (q) => q.eq('serviceId', service._id))
        .collect();
      await Promise.all(
        serviceCategories.map((sc) =>
          ctx.runMutation(internal.serviceCategories.deleteServiceCategory, {
            _id: sc._id,
          }),
        ),
      );
      await Promise.all(
        categoryIds.map((cId) =>
          ctx.runMutation(internal.serviceCategories.createServiceCategory, {
            serviceId: service._id,
            categoryId: cId,
          }),
        ),
      );

      return service._id;
    }

    if (!args.name)
      throw new ConvexError({ message: 'Name is required', code: 400 });
    if (!args.price)
      throw new ConvexError({ message: 'Price is required', code: 400 });

    const serviceId = await ctx.db.insert('services', {
      name: args.name,
      price: args.price,
      description: args.description,
      businessId: business._id,
      updatedAt: new Date().toISOString(),
    });

    if (serviceId && args.categoryIds?.length) {
      await Promise.all(
        args.categoryIds.map((cId) =>
          ctx.runMutation(internal.serviceCategories.createServiceCategory, {
            serviceId: serviceId,
            categoryId: cId,
          }),
        ),
      );
    }
    return serviceId;
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
    await ctx.db.delete(args._id).then(() => args._id);
    // delete service -> categories relations
    const serviceCategories = await ctx.db
      .query('serviceCategories')
      .withIndex('by_serviceId', (q) => q.eq('serviceId', service._id))
      .collect();
    await Promise.all(serviceCategories.map((sc) => ctx.db.delete(sc._id)));
    return args._id;
  },
});
