import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { ConvexError } from 'convex/values';
import { getAuthUser, getBusiness } from './_utils';

export const mutateAddress = mutation({
  args: {
    _id: v.optional(v.id('addresses')),
    street1: v.optional(v.string()),
    street2: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    postalCode: v.optional(v.string()),
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
      return await ctx.db
        .patch(_id, {
          ...params,
          updatedAt: new Date().toISOString(),
        })
        .then(() => address._id);
    }

    if (!args.street1)
      throw new ConvexError({ message: 'Street 1 missing', code: 400 });
    else if (!args.city)
      throw new ConvexError({ message: 'City missing', code: 400 });
    else if (!args.state)
      throw new ConvexError({ message: 'State missing', code: 400 });
    else if (!args.country)
      throw new ConvexError({ message: 'Country missing', code: 400 });
    else if (!args.postalCode)
      throw new ConvexError({ message: 'Postal Code missing', code: 400 });
    else
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
