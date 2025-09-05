import { v, ConvexError } from 'convex/values';
import { query, mutation } from './_generated/server';
import { getAuthUser, getBusiness } from './_utils';
import { api } from './_generated/api';

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
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    if (args._id) {
      const role = await ctx.db.get(args._id);
      if (!role)
        throw new ConvexError({ message: 'Role not found', code: 404 });
      if (role.businessId !== business._id)
        throw new ConvexError({ message: 'Invalid Role Id', code: 403 });
      const { _id, ...params } = args;
      return await ctx.db.patch(role._id, {
        ...params,
        updatedAt: new Date().toISOString(),
      });
    }

    return await ctx.db.insert('roles', {
      ...args,
      businessId: business._id,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const deleteRole = mutation({
  args: {
    _id: v.id('roles'),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    const role = await ctx.db.get(args._id);
    if (!role)
      throw new ConvexError({ message: 'Position not found', code: 404 });
    if (role.businessId !== business._id)
      throw new ConvexError({ message: 'Invalid Position Id', code: 403 });
    const employeesWithRole = await ctx.db
      .query('employees')
      .withIndex('by_positionId', (q) => q.eq('positionId', role._id))
      .collect();
    for (const employee of employeesWithRole) {
      await ctx.runMutation(api.employees.updateEmployee, {
        _id: employee._id,
        positionId: undefined,
      });
    }
    return await ctx.db.delete(role._id);
  },
});
