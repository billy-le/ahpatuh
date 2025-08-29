import { v, ConvexError } from 'convex/values';
import { query, mutation } from './_generated/server';
import { getAuthUser, getBusiness } from './_utils';

export const getRoles = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    return await ctx.db
      .query('roles')
      .withIndex('by_business_id', (q) => q.eq('businessId', business._id))
      .collect();
  },
});

export const mutateRole = mutation({
  args: {
    _id: v.optional(v.id('roles')),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    if (args._id) {
      const role = await ctx.db
        .query('roles')
        .withIndex('by_business_id', (q) => q.eq('businessId', business._id))
        .unique();
      if (!role)
        throw new ConvexError({ message: 'Role not found', code: 404 });
      if (role.businessId !== business._id)
        throw new ConvexError({ message: 'Invalid Role Id', code: 403 });
      return await ctx.db.patch(role._id, {
        name: args.name,
        updatedAt: new Date().toISOString(),
      });
    }

    return await ctx.db.insert('roles', {
      name: args.name,
      businessId: business._id,
      updatedAt: new Date().toISOString(),
    });
  },
});
