import { ConvexError, v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { getAuthUser, getBusiness } from './_utils';

export const getServiceFeedback = query({
  args: {
    reviewId: v.optional(v.id('reviews')),
    serviceId: v.optional(v.id('services')),
    employeeId: v.optional(v.id('employees')),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    if (args.reviewId) {
      const review = await ctx.db.get(args.reviewId);
      if (!review)
        throw new ConvexError({ message: 'Review not found', code: 404 });
      if (review.businessId !== business._id)
        throw new ConvexError({ message: 'Invalid Review Id', code: 403 });
      return await ctx.db
        .query('serviceFeedbacks')
        .withIndex('by_reviewId', (q) => q.eq('reviewId', review._id))
        .collect();
    } else if (args.serviceId) {
      const service = await ctx.db.get(args.serviceId);
      if (!service)
        throw new ConvexError({ message: 'Service not found', code: 404 });
      if (service.businessId !== business._id)
        throw new ConvexError({ message: 'Invalid Service Id', code: 403 });
      return await ctx.db
        .query('serviceFeedbacks')
        .withIndex('by_serviceId', (q) => q.eq('serviceId', service._id))
        .collect();
    } else if (args.employeeId) {
      const employee = await ctx.db.get(args.employeeId);
      if (!employee)
        throw new ConvexError({ message: 'Employee not found', code: 404 });
      if (employee.businessId !== business._id)
        throw new ConvexError({ message: 'Invalid Employee Id', code: 403 });
      return await ctx.db
        .query('serviceFeedbacks')
        .withIndex('by_employeeId', (q) => q.eq('employeeId', employee._id))
        .collect();
    } else {
      return await ctx.db
        .query('serviceFeedbacks')
        .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
        .collect();
    }
  },
});

export const mutateServiceFeedback = mutation({
  args: {
    _id: v.optional(v.id('serviceFeedbacks')),
    employeeId: v.id('employees'),
    serviceId: v.id('services'),
    reviewId: v.id('reviews'),
    rating: v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5),
    ),
    review: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    if (args._id) {
      const serviceFeedback = await ctx.db.get(args._id);
      if (!serviceFeedback)
        throw new ConvexError({
          message: 'Service Feedback not found',
          code: 404,
        });
      if (serviceFeedback.businessId !== business._id)
        throw new ConvexError({
          message: 'Invalid Service Feedback Id',
          code: 403,
        });
      const { _id, ...params } = args;
      return await ctx.db.patch(serviceFeedback._id, {
        ...params,
        updatedAt: new Date().toISOString(),
      });
    }
    return await ctx.db.insert('serviceFeedbacks', {
      ...args,
      businessId: business._id,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const deleteServiceFeedback = mutation({
  args: {
    _id: v.id('serviceFeedbacks'),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    const serviceFeedback = await ctx.db.get(args._id);
    if (!serviceFeedback)
      throw new ConvexError({
        message: 'Service Feedback not found',
        code: 404,
      });
    if (serviceFeedback.businessId !== business._id)
      throw new ConvexError({
        message: 'Invalid Service Feedback Id',
        code: 403,
      });
    return await ctx.db.delete(serviceFeedback._id);
  },
});
