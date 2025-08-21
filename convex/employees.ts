import { ConvexError, v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { betterAuthComponent } from './auth';
import { Id } from './_generated/dataModel';

export const getEmployees = query({
  args: {},
  handler: async (ctx) => {
    const userId = (await betterAuthComponent.getAuthUserId(
      ctx,
    )) as Id<'users'>;
    if (!userId) throw new ConvexError({ message: 'Forbidden', code: 403 });
    const business = await ctx.db
      .query('businesses')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();
    if (!business) return [];
    return await ctx.db
      .query('employees')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .collect();
  },
});

export const createEmployee = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    hiredDate: v.optional(v.string()),
    isActive: v.boolean(),
    positionId: v.id('roles'),
  },
  handler: async (ctx, args) => {
    const userId = (await betterAuthComponent.getAuthUserId(
      ctx,
    )) as Id<'users'>;
    if (!userId) throw new ConvexError({ message: 'Forbidden', code: 403 });
    const business = await ctx.db
      .query('businesses')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();
    if (!business) throw new ConvexError({ message: 'Bad request', code: 400 });
    const positions = await ctx.db
      .query('roles')
      .withIndex('by_business_id', (q) => q.eq('businessId', business._id))
      .collect();
    if (!positions.find((position) => position._id === args.positionId))
      throw new ConvexError({
        message: 'Bad Request. Position not found for this business',
        code: 400,
      });

    return await ctx.db.insert('employees', {
      ...args,
      businessId: business._id,
      updatedAt: new Date().toISOString(),
    });
  },
});
