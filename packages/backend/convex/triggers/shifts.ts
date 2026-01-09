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

      const _lunchStart = newDoc.lunchStart;
      const _lunchEnd = newDoc.lunchEnd;

      if (diff.dayOff) {
        const isAvailable = !diff.dayOff.new;

        if (!isAvailable) {
          // find all bookings for this date because employee is now unavailable
        } else {
          // need to update availability isAvailable to match their shift
        }
        return;
      } else if (Object.keys(diff).length) {
        // const { startTime, endTime, lunchStart, lunchEnd } = diff;
      }
    }
  });
}
