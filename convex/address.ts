import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { betterAuthComponent } from './auth';
import { ConvexError } from 'convex/values';
import { Id } from './_generated/dataModel';

export const createAddress = mutation({
  args: {
    street1: v.string(),
    street2: v.optional(v.string()),
    city: v.string(),
    state: v.string(),
    country: v.string(),
    postalCode: v.string(),
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
    if (!business)
      throw new ConvexError({
        message: 'Cannot create address. Business does not exists',
        code: 400,
      });

    return ctx.db.insert('addresses', {
      ...args,
      businessId: business._id,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const getAddress = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = (await betterAuthComponent.getAuthUserId(
      ctx,
    )) as Id<'users'>;
    if (!userId) throw new ConvexError({ message: 'Forbidden', code: 403 });
    const business = await ctx.db
      .query('businesses')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();
    if (!business) return null;
    return ctx.db
      .query('addresses')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .first();
  },
});
