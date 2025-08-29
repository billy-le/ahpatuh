import { query, mutation } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { omit } from 'ramda';
import { getAuthUser, getBusiness } from './_utils';

export const getShifts = query({
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
    const shifts = await ctx.db
      .query('shifts')
      .withIndex('by_employeeId', (q) => q.eq('employeeId', employee._id))
      .collect();
    return shifts.map((shift) =>
      omit(['_creationTime', 'businessId', 'employeeId', 'updatedAt'], shift),
    );
  },
});

export const mutateShifts = mutation({
  args: {
    employeeId: v.id('employees'),
    shifts: v.array(
      v.object({
        _id: v.optional(v.id('shifts')),
        day: v.union(
          v.literal(0), // Sunday
          v.literal(1),
          v.literal(2),
          v.literal(3),
          v.literal(4),
          v.literal(5),
          v.literal(6),
        ),
        startTime: v.optional(v.string()),
        endTime: v.optional(v.string()),
        durationInMinutes: v.optional(v.number()),
        numOfBreaks: v.optional(v.number()),
        breakDurationInMinutes: v.optional(v.number()),
        dayOff: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    const employee = await ctx.db.get(args.employeeId);
    if (!employee)
      throw new ConvexError({ message: 'Employee not found', code: 404 });
    if (employee.businessId !== business._id)
      throw new ConvexError({ message: 'Invalid Employee Id', code: 403 });
    const shifts = await ctx.db
      .query('shifts')
      .withIndex('by_employeeId', (q) => q.eq('employeeId', employee._id))
      .collect();

    if (shifts.length) {
      return await Promise.all(
        args.shifts
          .map((shift) => {
            const foundShift = shifts.find((s) => s._id === shift._id);
            if (!foundShift) return null;
            const { _id, ...params } = shift;
            return ctx.db
              .patch(foundShift._id, {
                ...params,
                updatedAt: new Date().toISOString(),
              })
              .then(() => foundShift._id);
          })
          .filter((x) => x),
      );
    } else {
      return await Promise.all(
        args.shifts.map((shift) =>
          ctx.db.insert('shifts', {
            ...shift,
            employeeId: employee._id,
            businessId: business._id,
            updatedAt: new Date().toISOString(),
          }),
        ),
      );
    }
  },
});
