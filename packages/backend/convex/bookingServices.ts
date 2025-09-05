import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthUser, getBusiness } from './_utils';

export const getBookingServices = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    return await ctx.db
      .query('bookingServices')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .collect();
  },
});

export const mutateBookingService = mutation({
  args: {
    _id: v.optional(v.id('bookingServices')),
    employeeId: v.id('employees'),
    customerId: v.id('customers'),
    bookingId: v.id('bookings'),
    serviceId: v.id('services'),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    if (args._id) {
      const bookingService = await ctx.db.get(args._id);
      if (!bookingService)
        throw new ConvexError({
          message: 'Booking service not found',
          code: 404,
        });
      if (bookingService.businessId !== business._id)
        throw new ConvexError({
          message: 'Invalid Booking Service Id',
          code: 403,
        });
      const { _id, ...params } = args;
      return await ctx.db.patch(bookingService._id, {
        ...params,
        updatedAt: new Date().toISOString(),
      });
    }
    return await ctx.db.insert('bookingServices', {
      ...args,
      businessId: business._id,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const deleteBookingService = mutation({
  args: {
    _id: v.id('bookingServices'),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    const bookingService = await ctx.db.get(args._id);
    if (!bookingService)
      throw new ConvexError({
        message: 'Booking Service not found',
        code: 404,
      });
    if (bookingService.businessId !== business._id)
      throw new ConvexError({
        message: 'Invalid Booking Service Id',
        code: 403,
      });
    return await ctx.db.delete(bookingService._id);
  },
});
