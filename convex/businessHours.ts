import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { betterAuthComponent } from './auth';
import { Id } from './_generated/dataModel';

export const createBusinessHours = mutation({
  args: {
    businessHours: v.array(
      v.object({
        dayOfWeek: v.union(
          v.literal(0),
          v.literal(1),
          v.literal(2),
          v.literal(3),
          v.literal(4),
          v.literal(5),
          v.literal(6),
        ),
        timeOpen: v.optional(v.string()),
        timeClose: v.optional(v.string()),
        isClosed: v.boolean(),
      }),
    ),
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
        message: 'Cannot create business hours. Business does not exists',
        code: 400,
      });
    return Promise.all(
      args.businessHours.map((businessHour) =>
        ctx.db.insert('businessHours', {
          ...businessHour,
          businessId: business._id,
          updatedAt: new Date().toISOString(),
        }),
      ),
    );
  },
});

export const getBusinessHours = query({
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

    return ctx.db
      .query('businessHours')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .collect();
  },
});
