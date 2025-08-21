import { query, mutation } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { betterAuthComponent } from './auth';
import { omit } from 'ramda';
import { Id } from './_generated/dataModel';

export const createBusiness = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    domain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = (await betterAuthComponent.getAuthUserId(
      ctx,
    )) as Id<'users'>;
    if (!userId) throw new ConvexError({ message: 'Forbidden', code: 403 });
    return await ctx.db.insert('businesses', {
      name: args.name,
      email: args.email,
      phone: args.phone,
      domain: args.domain,
      userId,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const getBusinessDetails = query({
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
    if (!business) return null;
    const address = await ctx.db
      .query('addresses')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .first();
    const businessHours = await ctx.db
      .query('businessHours')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .collect();
    const businessOmittedFields = omit(
      ['_creationTime', 'updatedAt', 'userId'],
      business,
    );
    return {
      ...businessOmittedFields,
      address: address ? omit(['_creationTime', 'updatedAt'], address) : null,
      businessHours: businessHours.map((hours) =>
        omit(['_creationTime', 'updatedAt'], hours),
      ),
    };
  },
});
