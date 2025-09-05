import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { ConvexError } from 'convex/values';
import { getAuthUser, getBusiness } from './_utils';

export const mutateAddress = mutation({
  args: {
    _id: v.optional(v.id('addresses')),
    street1: v.string(),
    street2: v.optional(v.string()),
    city: v.string(),
    state: v.string(),
    country: v.string(),
    postalCode: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    if (args._id) {
      const address = await ctx.db.get(args._id);
      if (!address)
        throw new ConvexError({ message: 'Address not found', code: 404 });
      if (address.businessId !== business._id)
        throw new ConvexError({ message: 'Invalid Address Id', code: 403 });
      const { _id, ...params } = args;
      return await ctx.db.patch(_id, {
        ...params,
        updatedAt: new Date().toISOString(),
      });
    }

    return ctx.db.insert('addresses', {
      ...args,
      businessId: business._id,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const getAddress = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);

    return ctx.db
      .query('addresses')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .unique();
  },
});
