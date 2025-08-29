import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthUser, getBusiness } from './_utils';

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    return await ctx.db
      .query('categories')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .collect();
  },
});

export const mutateCategory = mutation({
  args: {
    _id: v.optional(v.id('categories')),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    if (args._id) {
      const category = await ctx.db
        .query('categories')
        .withIndex('by_id', (q) => q.eq('_id', args._id!))
        .unique();
      if (!category)
        throw new ConvexError({ message: 'Category not found', code: 404 });
      if (category.businessId !== business._id)
        throw new ConvexError({ message: 'Invalid Category Id', code: 403 });
      const { _id: _, ...params } = args;
      return await ctx.db.patch(category._id, {
        ...params,
        updatedAt: new Date().toISOString(),
      });
    }
    return await ctx.db.insert('categories', {
      ...args,
      businessId: business._id,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const deleteCategory = mutation({
  args: {
    _id: v.id('categories'),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    const category = await ctx.db
      .query('categories')
      .withIndex('by_id', (q) => q.eq('_id', args._id))
      .unique();
    if (!category)
      throw new ConvexError({ message: 'Category not found', code: 404 });
    if (category.businessId !== business._id)
      throw new ConvexError({ message: 'Invalid Category Id', code: 403 });
    return await ctx.db.delete(category._id);
  },
});
