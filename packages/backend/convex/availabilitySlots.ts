import { internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';
import { partial } from 'convex-helpers/validators';
import { availabilitySlot, businessHour } from './schema';
import { triggerInternalMutation } from './functions';
import { internal } from './_generated/api';
import { Doc } from './_generated/dataModel';
import {
  eachDayOfInterval,
  endOfMonth,
  startOfMonth,
  format as formatDate,
  isSameMonth,
} from 'date-fns';
import { ConvexError } from 'convex/values';
import { syncAvailabilityWithBusinessHours } from './_syncAvailability';

export const getAvailabilitySlots = internalQuery({
  args: {
    employeeId: v.id('employees'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('availabilitySlots')
      .withIndex('by_employeeId', (q) => q.eq('employeeId', args.employeeId))
      .collect();
  },
});

export const mutateAvailabilitySlot = triggerInternalMutation({
  args: {
    _id: v.optional(v.id('availabilitySlots')),
    ...partial(availabilitySlot),
  },
  handler: async (ctx, args) => {
    if (args._id) {
      const { _id, ...params } = args;
      return await ctx.db.patch(args._id, {
        ...params,
        updatedAt: new Date().toISOString(),
      });
    }

    await ctx.db.insert('availabilitySlots', {
      ...args,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const deleteAvailabilitySlot = triggerInternalMutation({
  args: {
    _id: v.id('availabilitySlots'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args._id);
  },
});

export const deleteEmployeesAvailabilitySlots = internalMutation({
  args: {
    employeeId: v.id('employees'),
  },
  handler: async (ctx, args) => {
    // might be 100s of rows so need to batch
    // TODO - use @convex/aggregate
    const availabilitySlots = await ctx.db
      .query('availabilitySlots')
      .withIndex('by_employeeId', (q) => q.eq('employeeId', args.employeeId))
      .collect();
    const count = availabilitySlots.length;

    await ctx.scheduler.runAfter(0, internal.availabilitySlots.batchDeleting, {
      cursor: null,
      numItems: count,
    });
  },
});

export const batchDeleting = internalMutation({
  args: {
    cursor: v.union(v.string(), v.null()),
    numItems: v.number(),
  },
  handler: async (ctx, args) => {
    const data = await ctx.db.query('availabilitySlots').paginate(args);
    const { isDone, continueCursor, page } = data;
    if (isDone) return;

    for (const doc of page) {
      await ctx.db.delete(doc._id);
    }

    await ctx.scheduler.runAfter(0, internal.availabilitySlots.batchDeleting, {
      cursor: continueCursor,
      numItems: args.numItems,
    });
  },
});

export const updateEmployeeAvailabilities = internalMutation({
  args: {
    businessId: v.id('businesses'),
    businessHourIds: v.array(v.id('businessHours')), // which business id got updated?
  },
  handler: async (ctx, args) => {
    const businessHours = await Promise.all(
      args.businessHourIds.map((id) =>
        ctx.db
          .query('businessHours')
          .withIndex('by_id', (q) => q.eq('_id', id))
          .unique(),
      ),
    );
    const nonNullBusinessHours = businessHours.filter(
      (bh): bh is Doc<'businessHours'> => Boolean(bh),
    );

    for (const bh of nonNullBusinessHours) {
      if (bh.isClosed) break; // businessHours should trigger deletion of all availabilities so we just add a break here

      const open = bh.timeOpen;
      const close = bh.timeClose;
      const dayOfWeek = bh.dayOfWeek;

      const count = await ctx.db
        .query('availabilitySlots')
        .withIndex('by_businessId', (q) =>
          q.eq('businessId', args.businessId).eq('dayOfWeek', dayOfWeek),
        )
        .collect()
        .then((res) => res.length);

      await ctx.scheduler.runAfter(
        0,
        internal.availabilitySlots.batchEmployeeAvailabilities,
        {
          businessId: args.businessId,
          dayOfWeek: dayOfWeek,
          timeOpen: open,
          timeClose: close,
          numItems: count,
          businessHours: nonNullBusinessHours,
          cursor: null,
        },
      );
    }
  },
});

export const batchEmployeeAvailabilities = internalMutation({
  args: {
    businessId: v.id('businesses'),
    dayOfWeek: v.union(
      v.literal(0),
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5),
      v.literal(6),
    ),
    timeOpen: v.union(v.number(), v.null()),
    timeClose: v.union(v.number(), v.null()),
    businessHours: v.array(v.object(businessHour)),
    cursor: v.union(v.string(), v.null()),
    numItems: v.number(),
  },
  handler: async (ctx, args) => {
    const data = await ctx.db
      .query('availabilitySlots')
      .withIndex('by_businessId', (q) =>
        q.eq('businessId', args.businessId).eq('dayOfWeek', args.dayOfWeek),
      )
      .paginate({ cursor: args.cursor, numItems: args.numItems });

    const { isDone, page, continueCursor } = data;

    if (isDone) return;

    const results = await syncAvailabilityWithBusinessHours(
      page,
      args.businessHours as Doc<'businessHours'>[],
      ctx,
    );

    for (const slot of results.slotsToUpdate) {
      await ctx.db.patch(slot.id, {
        isAvailable: slot.isAvailable,
      });
    }

    await ctx.scheduler.runAfter(
      0,
      internal.availabilitySlots.batchEmployeeAvailabilities,
      {
        ...args,
        cursor: continueCursor,
      },
    );
  },
});

// run in the bg only
export const generateMonthlySlots = triggerInternalMutation({
  args: {
    employeeId: v.id('employees'),
    businessId: v.id('businesses'),
    monthsAhead: v.number(),
    dayOfWeek: v.optional(
      v.union(
        v.literal(0), // Sunday
        v.literal(1),
        v.literal(2),
        v.literal(3),
        v.literal(4),
        v.literal(5),
        v.literal(6),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const business = await ctx.db.get(args.businessId);
    if (!business)
      throw new ConvexError({ message: 'Business not found', code: 404 });
    const employee = await ctx.db.get(args.employeeId);
    if (!employee)
      throw new ConvexError({ message: 'Employee not found', code: 404 });
    if (employee.businessId !== business._id)
      throw new ConvexError({
        message: 'Invalid Business Employee Id',
        code: 403,
      });

    const businessHours = await ctx.db
      .query('businessHours')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .filter((q) => {
        if (args.dayOfWeek) {
          return q.eq(q.field('dayOfWeek'), args.dayOfWeek);
        }
        return true;
      })
      .collect();

    const shifts = await ctx.db
      .query('shifts')
      .withIndex('by_employeeId', (q) => q.eq('employeeId', employee._id))
      .collect();

    const monthsAhead = Array(args.monthsAhead).fill(new Date());
    const currMonth = new Date().getMonth();
    const currYear = new Date().getFullYear();
    const dates: { month: number; year: number }[] = [];

    for (let i = 0; i < monthsAhead.length; i++) {
      const newMo = currMonth + i;
      dates.push({
        month: newMo,
        year: newMo < 11 ? currYear : currYear + 1,
      });
    }

    for (const { month, year } of dates) {
      const date = new Date(year, month);
      const daysInMonth = eachDayOfInterval({
        start: isSameMonth(date, new Date()) ? new Date() : startOfMonth(date),
        end: endOfMonth(date),
      });

      const filteredDays = daysInMonth.filter((day) => {
        if (args.dayOfWeek) {
          return day.getDay() === args.dayOfWeek;
        }
        return true;
      });

      for (const day of filteredDays) {
        const businessHour = businessHours.find(
          (bh) => bh.dayOfWeek === day.getDay(),
        );
        if (!businessHour)
          throw new ConvexError({
            message: 'Business Hour not found',
            code: 404,
          });

        const shift = shifts.find((shift) => shift.day === day.getDay());

        const isClosed = businessHour.isClosed;

        // don't generate any hours
        if (isClosed) {
          continue;
        }

        const businessOpen = businessHour.timeOpen;
        const businessClose = businessHour.timeClose;
        if (businessOpen == null) throw Error('Business opening hour not set');
        if (businessClose == null) throw Error('Business closing hour not set');

        const shiftStart = shift?.startTime;
        const shiftEnd = shift?.endTime;
        const lunchStart = shift?.lunchStart;
        const lunchEnd = shift?.lunchEnd;
        const dayOff = shift?.dayOff ?? false;

        for (let hour = businessOpen; hour < businessClose; hour += 100) {
          const isAvailable =
            employee.isActive &&
            employee.isBookable &&
            !dayOff &&
            (shiftStart != null && shiftEnd != null
              ? hour >= shiftStart && hour <= shiftEnd
              : true) &&
            (lunchStart != null && lunchEnd != null
              ? hour >= lunchStart && hour <= lunchEnd
              : true);

          await ctx.runMutation(
            internal.availabilitySlots.mutateAvailabilitySlot,
            {
              date: formatDate(day, 'yyyy-MM-dd'),
              timeStart: hour,
              timeEnd: hour + 100,
              isAvailable,
              businessId: args.businessId,
              employeeId: args.employeeId,
              dayOfWeek: day.getDay(),
            },
          );
        }
      }
    }
  },
});
