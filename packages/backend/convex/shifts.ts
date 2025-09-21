import { query } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { omit } from 'ramda';
import { getAuthUser, getBusiness } from './_utils';
import { triggerMutation } from './functions';
import { Id } from './_generated/dataModel';

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

export const mutateShifts = triggerMutation({
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
        startTime: v.union(v.number(), v.null()),
        endTime: v.union(v.number(), v.null()),
        lunchStart: v.union(v.number(), v.null()),
        lunchEnd: v.union(v.number(), v.null()),
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
    const businessHours = await ctx.db
      .query('businessHours')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .collect();

    const ids: Id<'shifts'>[] = [];

    for (const shift of args.shifts) {
      const businessDayHours = businessHours.find(
        (bh) => bh.dayOfWeek === shift.day,
      );
      if (!businessDayHours) continue;
      if (
        shift.startTime != null &&
        businessDayHours.timeOpen != null &&
        shift.startTime < businessDayHours.timeOpen
      )
        throw new ConvexError({
          message: 'Shift start time is before business opening time',
          code: 400,
        });
      if (
        shift.endTime != null &&
        businessDayHours.timeClose != null &&
        shift.endTime > businessDayHours.timeClose
      )
        throw new ConvexError({
          message: 'Shift end time is after business closing time',
        });

      if (shift._id) {
        const storedShift = await ctx.db.get(shift._id);
        if (!storedShift) continue;
        if (storedShift.employeeId !== args.employeeId) continue;
        const { _id, ...params } = shift;
        const id = await ctx.db
          .patch(shift._id, {
            ...params,
            startTime: params.dayOff ? null : params.startTime,
            endTime: params.dayOff ? null : params.endTime,
            lunchStart: params.dayOff ? null : params.lunchStart,
            lunchEnd: params.dayOff ? null : params.lunchEnd,
            updatedAt: new Date().toISOString(),
          })
          .then(() => _id);
        ids.push(id);
        continue;
      }
      const id = await ctx.db.insert('shifts', {
        ...shift,
        businessId: business._id,
        employeeId: args.employeeId,
        updatedAt: new Date().toISOString(),
      });
      ids.push(id);
    }

    return ids;
  },
});
