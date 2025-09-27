import { DataModel, Id } from '../_generated/dataModel';
import { internal } from '../_generated/api';
import type { Triggers } from 'convex-helpers/server/triggers';

const scheduledBusinessHours: Record<
  Id<'businessHours'>,
  Id<'_scheduled_functions'>
> = {};

export function registerBusinessHoursTriggers(triggers: Triggers<DataModel>) {
  triggers.register('businessHours', async (ctx, change) => {
    if (scheduledBusinessHours[change.id]) {
      await ctx.scheduler.cancel(scheduledBusinessHours[change.id]);
    }

    const { operation, oldDoc, newDoc } = change;
    if (operation === 'update') {
      // logic for when business is open/close on a given day
      if (oldDoc.isClosed !== newDoc.isClosed) {
        if (newDoc.isClosed) {
          // delete all availabilities
          const availabilities = await ctx.db
            .query('availabilitySlots')
            .withIndex('by_businessId', (q) =>
              q
                .eq('businessId', newDoc.businessId)
                .eq('dayOfWeek', newDoc.dayOfWeek),
            )
            .collect();
          for (const availability of availabilities) {
            await ctx.db.delete(availability._id);
          }
        } else {
          // start new availabilities because the business is now open on this day
          const employees = await ctx.db
            .query('employees')
            .withIndex('by_businessId', (q) =>
              q.eq('businessId', newDoc.businessId),
            )
            .collect();

          for (const employee of employees) {
            await ctx.runMutation(
              internal.availabilitySlots.generateMonthlySlots,
              {
                businessId: newDoc.businessId,
                employeeId: employee._id,
                monthsAhead: 2,
                dayOfWeek: newDoc.dayOfWeek,
              },
            );
          }
        }
      } else {
        // don't run if nothing has changed
        if (
          oldDoc.timeOpen === newDoc.timeOpen &&
          oldDoc.timeClose === newDoc.timeClose
        ) {
          return;
        }
        // business hours expanded or contracted
        // update availabilities
        await ctx.scheduler.runAfter(
          0,
          internal.availabilitySlots.updateEmployeeAvailabilities,
          {
            businessId: newDoc.businessId,
            businessHourIds: [newDoc._id],
          },
        );
      }
    }
  });
}
