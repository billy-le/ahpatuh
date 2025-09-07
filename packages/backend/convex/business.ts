import { query, mutation } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { omit } from 'ramda';
import { getAuthUser, getBusiness } from './_utils';

export const createBusiness = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    domain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    return await ctx.db.insert('businesses', {
      name: args.name,
      email: args.email,
      phone: args.phone,
      domain: args.domain,
      userId: user._id,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const getBusinessDetails = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    const address = await ctx.db
      .query('addresses')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .unique();
    const businessHours = await ctx.db
      .query('businessHours')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .collect();
    const businessOmittedFields = omit(
      ['_creationTime', 'updatedAt', 'userId'],
      business,
    );
    return {
      ...businessOmittedFields,
      address: address ? omit(['_creationTime', 'updatedAt'], address) : null,
      businessHours: businessHours.map((hours) =>
        omit(['_creationTime', 'updatedAt'], hours),
      ),
    };
  },
});

export const updateBusiness = mutation({
  args: {
    _id: v.id('businesses'),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    domain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    if (args._id !== business._id)
      throw new ConvexError({ message: 'Invalid Business Id', code: 403 });

    const { _id, ...params } = args;
    return await ctx.db
      .patch(business._id, {
        ...params,
        updatedAt: new Date().toISOString(),
      })
      .then(() => _id);
  },
});
