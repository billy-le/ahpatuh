import { Triggers } from 'convex-helpers/server/triggers';
import { DataModel, Id } from '../_generated/dataModel';
import { typedDiff } from '@ahpatuh/utils';

const scheduledShifts: Record<Id<'shifts'>, Id<'_scheduled_functions'>> = {};

export function registerShiftTriggers(triggers: Triggers<DataModel>) {
  triggers.register('shifts', async (ctx, change) => {
    if (scheduledShifts[change.id]) {
      await ctx.scheduler.cancel(scheduledShifts[change.id]);
    }
    if (change.operation === 'update') {
      const { oldDoc, newDoc } = change;
      const diff = typedDiff(oldDoc, newDoc, [
        'startTime',
        'endTime',
        'lunchStart',
        'lunchEnd',
        'dayOff',
      ]);

      const lunchStart = newDoc.lunchStart;
      const lunchEnd = newDoc.lunchEnd;

      if (diff.dayOff) {
        const isAvailable = !diff.dayOff.new;

        if (!isAvailable) {
          // find all time slots for this date because employee is now unavailable
          const availabilityTimeslots = await ctx.db
            .query('availabilitySlots')
            .withIndex('by_employee_dayOfWeek_timeSlots', (q) =>
              q.eq('employeeId', newDoc.employeeId).eq('dayOfWeek', newDoc.day),
            )
            .collect();
          for (const as of availabilityTimeslots) {
            await ctx.db.patch(as._id, {
              isAvailable,
              updatedAt: new Date().toISOString(),
            });
          }
        } else {
          // need to update availability isAvailable to match their shift
          const availabilityTimeSlots = await ctx.db
            .query('availabilitySlots')
            .withIndex('by_employee_dayOfWeek_timeSlots', (q) =>
              q.eq('employeeId', newDoc.employeeId).eq('dayOfWeek', newDoc.day),
            )
            .filter((q) =>
              q.and(
                q.gte(q.field('timeStart'), newDoc.startTime),
                q.lte(q.field('timeEnd'), newDoc.endTime),
              ),
            )
            .collect();

          for (const { _id, timeStart, timeEnd } of availabilityTimeSlots) {
            await ctx.db.patch(_id, {
              isAvailable:
                lunchStart != null && lunchEnd != null
                  ? lunchStart >= timeStart && lunchEnd <= timeEnd
                    ? false
                    : isAvailable
                  : isAvailable,
              updatedAt: new Date().toISOString(),
            });
          }
        }
        return;
      } else if (Object.keys(diff).length) {
        const { startTime, endTime, lunchStart, lunchEnd } = diff;
        const availabilityTimeSlots = await ctx.db
          .query('availabilitySlots')
          .withIndex('by_employee_dayOfWeek_timeSlots', (q) =>
            q.eq('employeeId', newDoc.employeeId).eq('dayOfWeek', newDoc.day),
          )
          .collect();

        for (const slot of availabilityTimeSlots) {
          const lStart = (lunchStart?.new as number) ?? newDoc.lunchStart;
          const lEnd = (lunchEnd?.new as number) ?? newDoc.lunchEnd;
          const start = (startTime?.new as number) ?? newDoc.startTime;
          const end = (endTime?.new as number) ?? newDoc.endTime;
          // slot 11, lstart 12 = false
          // slot 12, lstart 12 = true, endSlot 13, lEnd 13 = true
          await ctx.db.patch(slot._id, {
            isAvailable:
              lStart != null && lEnd != null
                ? !(lStart >= slot.timeStart && lEnd <= slot.timeEnd)
                : slot.timeStart >= start && slot.timeEnd <= end,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }
  });
}
