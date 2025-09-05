import { ConvexError, v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { getAuthUser, getBusiness } from './_utils';

export const getBookings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    return await ctx.db
      .query('bookings')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .collect();
  },
});

export const mutateBooking = mutation({
  args: {
    _id: v.optional(v.id('bookings')),
    customerId: v.id('customers'),
    bookingServiceIds: v.array(v.id('bookingServices')),
    date: v.string(),
    updatedAt: v.string(),
    status: v.union(
      v.literal('REQUESTED'),
      v.literal('CONFIRMED'),
      v.literal('PENDING'),
      v.literal('COMPLETED'),
      v.literal('CANCELED'),
      v.literal('NO SHOW'),
    ),
    reviewId: v.optional(v.id('reviews')),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    if (args._id) {
      const booking = await ctx.db.get(args._id);
      if (!booking)
        throw new ConvexError({ message: 'Booking not found', code: 404 });
      if (booking.businessId !== business._id)
        throw new ConvexError({ message: 'Invalid Booking Id', code: 403 });
      const { _id, ...params } = args;
      return await ctx.db.patch(booking._id, {
        ...params,
        updatedAt: new Date().toISOString(),
      });
    }
    return await ctx.db.insert('bookings', {
      ...args,
      businessId: business._id,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const deleteBooking = mutation({
  args: {
    _id: v.id('bookings'),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    const booking = await ctx.db.get(args._id);
    if (!booking)
      throw new ConvexError({ message: 'Booking not found', code: 404 });
    if (booking.businessId !== business._id)
      throw new ConvexError({ message: 'Invalid Booking Id', code: 403 });
    return await ctx.db.delete(booking._id);
  },
});
