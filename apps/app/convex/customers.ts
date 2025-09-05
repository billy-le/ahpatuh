import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthUser, getBusiness } from './_utils';

export const getCustomers = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    return await ctx.db
      .query('customers')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .collect();
  },
});

export const mutateCustomers = mutation({
  args: {
    _id: v.optional(v.id('customers')),
    name: v.string(),
    phone: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    if (args._id) {
      const customer = await ctx.db.get(args._id!);
      if (!customer)
        throw new ConvexError({ message: 'Customer not found', code: 404 });
      if (customer.businessId !== business._id)
        throw new ConvexError({ message: 'Invalid Customer Id', code: 403 });
      const { _id, ...params } = args;
      return await ctx.db.patch(customer._id, {
        ...params,
        updatedAt: new Date().toISOString(),
      });
    }
    return await ctx.db.insert('customers', {
      ...args,
      businessId: business._id,
      updatedAt: new Date().toISOString(),
    });
  },
});
