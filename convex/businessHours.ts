import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthUser, getBusiness } from './_utils';

export const getBusinessHours = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    return await ctx.db
      .query('businessHours')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .collect();
  },
});

export const mutateBusinessHours = mutation({
  args: {
    businessHours: v.array(
      v.object({
        _id: v.optional(v.id('businessHours')),
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
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    // all or none
    if (args.businessHours.every((businessHour) => businessHour._id!)) {
      const businessHours = await Promise.all(
        args.businessHours.map((hour) => ctx.db.get(hour._id!)),
      );
      if (
        businessHours.some(
          (businessHour) => businessHour?.businessId !== business._id,
        )
      )
        throw new ConvexError({ message: 'Invalid BusinessHour Id' });

      return await Promise.all(
        businessHours
          .map((businessHour) => {
            const foundBh = args.businessHours.find(
              (bh) => bh._id === businessHour!._id,
            );
            if (!foundBh) return null;
            const { _id, ...params } = foundBh;
            return ctx.db.patch(businessHour!._id, {
              ...params,
              updatedAt: new Date().toISOString(),
            });
          })
          .filter((x) => x),
      );
    }
    return await Promise.all(
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
