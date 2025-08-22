import { ConvexError, v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { betterAuthComponent } from './auth';
import { Id, Doc } from './_generated/dataModel';

export const getEmployees = query({
  args: {},
  handler: async (ctx) => {
    const userId = (await betterAuthComponent.getAuthUserId(
      ctx,
    )) as Id<'users'>;
    if (!userId) throw new ConvexError({ message: 'Forbidden', code: 403 });
    const business = await ctx.db
      .query('businesses')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();
    if (!business) return [];
    const employees = await ctx.db
      .query('employees')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .collect();

    let employeesWithPosition: (Doc<'employees'> & {
      position: null | Doc<'roles'>;
    })[] = [];

    for (const employee of employees) {
      const position = employee.positionId
        ? await ctx.db.get(employee.positionId)
        : null;
      employeesWithPosition.push({
        ...employee,
        position: position,
      });
    }
    return employeesWithPosition;
  },
});

export const createEmployee = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    isActive: v.boolean(),
    isBookable: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = (await betterAuthComponent.getAuthUserId(
      ctx,
    )) as Id<'users'>;
    if (!userId) throw new ConvexError({ message: 'Forbidden', code: 403 });
    const business = await ctx.db
      .query('businesses')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();
    if (!business) throw new ConvexError({ message: 'Bad request', code: 400 });

    return await ctx.db.insert('employees', {
      ...args,
      businessId: business._id,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const updateEmployee = mutation({
  args: {
    employeeId: v.id('employees'),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    hiredDate: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    isBookable: v.optional(v.boolean()),
    positionId: v.optional(v.id('roles')),
  },
  handler: async (ctx, args) => {
    const userId = (await betterAuthComponent.getAuthUserId(
      ctx,
    )) as Id<'users'>;
    if (!userId) throw new ConvexError({ message: 'Forbidden', code: 403 });
    const business = await ctx.db
      .query('businesses')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();
    if (!business) throw new ConvexError({ message: 'Bad request', code: 400 });
    const employee = await ctx.db.get(args.employeeId);
    if (!employee) throw new ConvexError({ message: 'Bad request', code: 400 });
    if (employee.businessId !== business._id)
      throw new ConvexError({ message: 'Forbidden', code: 400 });
    const positions = await ctx.db
      .query('roles')
      .withIndex('by_business_id', (q) => q.eq('businessId', business._id))
      .collect();
    if (
      args.positionId &&
      !positions.find((position) => position._id === args.positionId)
    )
      throw new ConvexError({
        message: 'Bad Request. Position not found for this business',
        code: 400,
      });

    const { employeeId, ...updateValues } = args;

    return await ctx.db.patch(employee._id, {
      ...updateValues,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const deleteEmployee = mutation({
  args: {
    employeeId: v.id('employees'),
  },
  handler: async (ctx, args) => {
    const userId = (await betterAuthComponent.getAuthUserId(
      ctx,
    )) as Id<'users'>;
    if (!userId) throw new ConvexError({ message: 'Forbidden', code: 403 });
    const business = await ctx.db
      .query('businesses')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();
    if (!business) throw new ConvexError({ message: 'Bad request', code: 400 });
    const employee = await ctx.db.get(args.employeeId);
    if (!employee) throw new ConvexError({ message: 'Bad request', code: 400 });
    if (employee.businessId !== business._id)
      throw new ConvexError({ message: 'Forbidden', code: 400 });

    return await ctx.db.delete(employee._id);
  },
});
