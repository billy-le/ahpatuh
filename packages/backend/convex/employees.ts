import { ConvexError, v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { Doc } from './_generated/dataModel';
import { getAuthUser, getBusiness } from './_utils';
import { triggerMutation } from './functions';
import { internal } from './_generated/api';

export const getEmployees = query({
  args: {
    _id: v.optional(v.id('employees')),
  },
  handler: async (ctx, args) => {
    const employeesWithPosition: (Doc<'employees'> & {
      position: null | Doc<'roles'>;
    })[] = [];

    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    if (args._id) {
      const employee = await ctx.db.get(args._id);
      if (!employee)
        throw new ConvexError({ message: 'Employee not found', code: 404 });
      if (employee.businessId !== business._id)
        throw new ConvexError({ message: 'Invalid Employee Id', code: 403 });
      const position = employee.positionId
        ? await ctx.db.get(employee.positionId)
        : null;
      employeesWithPosition.push({ ...employee, position });
      return employeesWithPosition;
    }

    const employees = await ctx.db
      .query('employees')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .collect();

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

export const createEmployee = triggerMutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    isActive: v.boolean(),
    isBookable: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    const employeeId = await ctx.db.insert('employees', {
      ...args,
      businessId: business._id,
      updatedAt: new Date().toISOString(),
    });

    // shift should match business hours initially
    const businessHours = await ctx.db
      .query('businessHours')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .collect();

    for (const bh of businessHours) {
      await ctx.db.insert('shifts', {
        employeeId: employeeId,
        businessId: business._id,
        startTime: bh.timeOpen,
        endTime: bh.timeClose,
        lunchStart: null,
        lunchEnd: null,
        dayOff: bh.isClosed,
        day: bh.dayOfWeek,
        updatedAt: new Date().toISOString(),
      });
    }

    await ctx.scheduler.runAfter(
      0,
      internal.availabilitySlots.generateMonthlySlots,
      {
        employeeId: employeeId,
        businessId: business._id,
        monthsAhead: 2,
      },
    );

    return employeeId;
  },
});

export const updateEmployee = mutation({
  args: {
    _id: v.id('employees'),
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
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    const employee = await ctx.db.get(args._id);
    if (!employee)
      throw new ConvexError({ message: 'Employee not found', code: 404 });
    if (employee.businessId !== business._id)
      throw new ConvexError({ message: 'Invalid Employee Id', code: 403 });
    if (args.positionId) {
      const position = await ctx.db
        .query('roles')
        .withIndex('by_id', (q) => q.eq('_id', args.positionId!))
        .unique();
      if (!position)
        throw new ConvexError({ message: 'Position not found', code: 404 });
      if (position.businessId !== business._id)
        throw new ConvexError({ message: 'Invalid Position Id', code: 403 });
    }

    const { _id, ...params } = args;

    return await ctx.db.patch(employee._id, {
      ...params,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const deleteEmployee = triggerMutation({
  args: {
    employeeId: v.id('employees'),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    const employee = await ctx.db.get(args.employeeId);
    if (!employee)
      throw new ConvexError({ message: 'Employee not found', code: 404 });
    if (employee.businessId !== business._id)
      throw new ConvexError({ message: 'Invalid Employee Id', code: 403 });
    await ctx.db.delete(employee._id);
    const shifts = await ctx.db
      .query('shifts')
      .withIndex('by_employeeId', (q) => q.eq('employeeId', employee._id))
      .collect();
    for (const shift of shifts) {
      await ctx.db.delete(shift._id);
    }
    await ctx.scheduler.runAfter(
      0,
      internal.availabilitySlots.deleteEmployeesAvailabilitySlots,
      {
        employeeId: employee._id,
      },
    );

    return employee._id;
  },
});
