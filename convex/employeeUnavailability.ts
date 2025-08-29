import { ConvexError, v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { getAuthUser, getBusiness } from './_utils';

export const getEmployeeUnavailabilities = query({
  args: {
    employeeIds: v.optional(v.array(v.id('employees'))),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    if (args.employeeIds?.length) {
      const employees = await Promise.all(
        args.employeeIds.map((empId) => ctx.db.get(empId)),
      ).then((e) => e.filter((e) => e?.businessId === business._id));
      if (!employees.length)
        throw new ConvexError({ message: 'Employees not found', code: 404 });
      const { startDate, endDate } = args;
      if (startDate && endDate) {
        return await Promise.all(
          employees.map((employee) =>
            ctx.db
              .query('employeeUnavailabilities')
              .withIndex('by_employee_date_range', (q) =>
                q
                  .eq('employeeId', employee!._id)
                  .gte('startDate', args.startDate!)
                  .lte('startDate', args.endDate!),
              )
              .collect(),
          ),
        ).then((e) => e.flat());
      } else if (startDate && !endDate) {
        return await Promise.all(
          employees
            .filter((x) => x)
            .map((employee) =>
              ctx.db
                .query('employeeUnavailabilities')
                .withIndex('by_employee_date_range', (q) =>
                  q
                    .eq('employeeId', employee!._id)
                    .gte('startDate', args.startDate!),
                )
                .collect(),
            ),
        ).then((e) => e.flat());
      } else if (endDate && !startDate) {
        return await Promise.all(
          employees
            .filter((x) => x)
            .map((employee) =>
              ctx.db
                .query('employeeUnavailabilities')
                .withIndex('by_employee_end_date', (q) =>
                  q
                    .eq('employeeId', employee!._id)
                    .lte('endDate', args.endDate!),
                )
                .collect(),
            ),
        ).then((e) => e.flat());
      } else {
        return await Promise.all(
          employees
            .filter((x) => x)
            .map((employee) =>
              ctx.db
                .query('employeeUnavailabilities')
                .withIndex('by_employee_date_range', (q) =>
                  q.eq('employeeId', employee!._id),
                )
                .collect(),
            ),
        ).then((e) => e.flat());
      }
    }
    return await ctx.db
      .query('employeeUnavailabilities')
      .withIndex('by_business_id', (q) => q.eq('businessId', business._id))
      .collect();
  },
});

export const mutateEmployeeAvailability = mutation({
  args: {
    unavailablityId: v.optional(v.id('employeeUnavailabilities')),
    employeeId: v.id('employees'),
    startDate: v.string(),
    endDate: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    const employee = await ctx.db.get(args.employeeId);
    if (!employee)
      throw new ConvexError({ message: 'Employee not found', code: 404 });
    if (employee.businessId !== business._id)
      throw new ConvexError({ message: 'Invalid Employee Id', code: 403 });
    if (args.unavailablityId) {
      const unavailability = await ctx.db.get(args.unavailablityId);
      if (!unavailability)
        throw new ConvexError({
          message: 'Unavailability not found',
          code: 404,
        });
      if (unavailability.employeeId !== employee._id)
        throw new ConvexError({
          message: 'Invalid Unavailability Id',
          code: 403,
        });
      return await ctx.db
        .patch(unavailability._id, {
          startDate: args.startDate,
          endDate: args.endDate,
          reason: args.reason,
          updatedAt: new Date().toISOString(),
        })
        .then(() => unavailability._id);
    }

    return await ctx.db.insert('employeeUnavailabilities', {
      businessId: business._id,
      employeeId: employee._id,
      startDate: args.startDate,
      endDate: args.endDate,
      reason: args.reason,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const deleteUnavailability = mutation({
  args: {
    unavailabilityId: v.id('employeeUnavailabilities'),
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
    const unavailability = await ctx.db
      .query('employeeUnavailabilities')
      .withIndex('by_employee_id', (q) => q.eq('employeeId', employee._id))
      .filter((u) => u.eq(u.field('_id'), args.unavailabilityId))
      .unique();
    if (!unavailability)
      throw new ConvexError({ message: 'Unavailability not found', code: 404 });

    return await ctx.db.delete(unavailability._id);
  },
});
