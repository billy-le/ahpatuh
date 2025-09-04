import { ConvexError, v } from 'convex/values';
import { internalQuery, internalMutation } from './_generated/server';
import { getAuthUser, getBusiness } from './_utils';

export const getServiceCategories = internalQuery({
  args: {
    serviceId: v.id('services'),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);

    const serviceCategories = await ctx.db
      .query('serviceCategories')
      .withIndex('by_serviceId', (q) => q.eq('serviceId', args.serviceId))
      .collect();
    const categories = await Promise.all(
      serviceCategories.map((sc) => ctx.db.get(sc.categoryId)),
    );
    const filteredCategories = categories.filter((category) => {
      return category && category.businessId === business._id;
    });
    return filteredCategories;
  },
});

export const createServiceCategory = internalMutation({
  args: {
    serviceId: v.id('services'),
    categoryId: v.id('categories'),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    const service = await ctx.db.get(args.serviceId);
    if (!service)
      throw new ConvexError({ message: 'Service not found', code: 404 });
    if (service.businessId !== business._id)
      throw new ConvexError({ message: 'Invalid Service Id', code: 403 });
    const category = await ctx.db.get(args.categoryId);
    if (!category)
      throw new ConvexError({ message: 'Category not found', code: 404 });
    if (category.businessId !== business._id)
      throw new ConvexError({ message: 'Invalid Category Id', code: 403 });
    return await ctx.db.insert('serviceCategories', args);
  },
});

export const deleteServiceCategory = internalMutation({
  args: {
    _id: v.id('serviceCategories'),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    const serviceCategory = await ctx.db.get(args._id);
    if (!serviceCategory)
      throw new ConvexError({
        message: 'Service Category not found',
        code: 404,
      });
    const service = await ctx.db.get(serviceCategory.serviceId);
    const category = await ctx.db.get(serviceCategory.categoryId);
    if (
      service?.businessId !== business._id ||
      category?.businessId !== business._id
    )
      throw new ConvexError({
        message: 'Invalid Service Category Id',
        code: 403,
      });
    return await ctx.db.delete(args._id);
  },
});
