import { v, ConvexError } from 'convex/values';
import { query, mutation, QueryCtx } from './_generated/server';
import { betterAuthComponent } from './auth';
import { Id } from './_generated/dataModel';

async function getUserBusiness(ctx: QueryCtx) {
  const userId = (await betterAuthComponent.getAuthUserId(ctx)) as Id<'users'>;
  if (!userId) throw new ConvexError({ message: 'Forbidden', code: 403 });
  const business = await ctx.db
    .query('businesses')
    .withIndex('by_userId', (q) => q.eq('userId', userId))
    .first();
  return business;
}

export const getRoles = query({
  args: {},
  handler: async (ctx) => {
    const business = await getUserBusiness(ctx);
    if (!business) return [];
    return await ctx.db
      .query('roles')
      .withIndex('by_business_id', (q) => q.eq('businessId', business._id))
      .collect();
  },
});

export const createRole = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const business = await getUserBusiness(ctx);
    if (!business)
      throw new ConvexError({
        message: 'Cannot create role because business does not exists',
        code: 400,
      });
    return await ctx.db.insert('roles', {
      name: args.name,
      businessId: business._id,
      updatedAt: new Date().toISOString(),
    });
  },
});
