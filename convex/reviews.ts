import { ConvexError, v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { getAuthUser, getBusiness } from './_utils';

export const getReviews = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    return await ctx.db
      .query('reviews')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .collect();
  },
});

export const mutateReview = mutation({
  args: {
    _id: v.optional(v.id('reviews')),
    bookingId: v.id('bookings'),
    customerId: v.id('customers'),
    rating: v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5),
    ),
    review: v.optional(v.string()),
    serviceFeedbackIds: v.optional(v.array(v.id('serviceFeedbacks'))),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    if (args._id) {
      const review = await ctx.db.get(args._id);
      if (!review)
        throw new ConvexError({ message: 'Review not found', code: 404 });
      if (review.businessId !== business._id)
        throw new ConvexError({ message: 'Invalid Review Id', code: 403 });
      const { _id, bookingId: _b, customerId: _c, ...params } = args;
      return await ctx.db.patch(review._id, {
        ...params,
        updatedAt: new Date().toISOString(),
      });
    }
    return await ctx.db.insert('reviews', {
      ...args,
      businessId: business._id,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const deleteReview = mutation({
  args: {
    _id: v.id('reviews'),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    const review = await ctx.db.get(args._id);
    if (!review)
      throw new ConvexError({ message: 'Review not found', code: 404 });
    if (review.businessId !== business._id)
      throw new ConvexError({ message: 'Invalid Review Id', code: 403 });
    return await ctx.db.delete(review._id);
  },
});
