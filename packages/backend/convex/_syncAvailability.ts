import type { GenericMutationCtx } from 'convex/server';
import type { Doc, DataModel, Id } from './_generated/dataModel';
import { parse as parseDate } from 'date-fns';

type Reason =
  | 'day_off'
  | 'business_closed'
  | 'outside_business_hours'
  | 'outside_shift_hours'
  | 'conflicts_with_lunch_break'
  | 'within_working_hours';

export async function syncAvailabilityWithBusinessHours(
  availabilities: Doc<'availabilitySlots'>[],
  businessHours: Doc<'businessHours'>[],
  ctx: GenericMutationCtx<DataModel>,
) {
  const slotsToUpdate: {
    id: Id<'availabilitySlots'>;
    isAvailable: boolean;
    reason: Reason;
    employeeId: Id<'employees'>;
    date: string;
    timeStart: number;
    timeEnd: number;
  }[] = [];

  // Create business hours lookup by day of week
  const businessHoursByDay = new Map<number, Doc<'businessHours'>>();
  for (const bh of businessHours) {
    businessHoursByDay.set(bh.dayOfWeek, bh);
  }

  // Cache shifts by employeeId and day to avoid duplicate DB calls
  const shiftCache = new Map<string, Doc<'shifts'> | null>();

  async function getEmployeeShift(
    employeeId: Id<'employees'>,
    dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6,
  ) {
    const cacheKey = `${employeeId}-${dayOfWeek}`;
    if (shiftCache.has(cacheKey)) {
      return shiftCache.get(cacheKey)!;
    }

    const shift = await ctx.db
      .query('shifts')
      .withIndex('by_employeeId', (q) =>
        q.eq('employeeId', employeeId).eq('day', dayOfWeek),
      )
      .unique();

    shiftCache.set(cacheKey, shift);
    return shift;
  }

  // Determine effective working hours (shift takes precedence over business hours)
  function getEffectiveWorkingHours(
    shift: Doc<'shifts'> | null,
    businessHour: Doc<'businessHours'> | null,
    dayOfWeek: number,
  ): {
    startTime: number | null;
    endTime: number | null;
    lunchStart: number | null;
    lunchEnd: number | null;
    source: 'shift' | 'dayoff' | 'business' | 'closed';
  } {
    // If business is closed this day
    if (!businessHour || businessHour.isClosed) {
      return {
        startTime: null,
        endTime: null,
        lunchStart: null,
        lunchEnd: null,
        source: 'closed',
      };
    }

    // If employee has day off
    if (shift?.dayOff) {
      return {
        startTime: null,
        endTime: null,
        lunchStart: null,
        lunchEnd: null,
        source: 'dayoff',
      };
    }

    // If no shift exists for this day, use business hours
    if (!shift || shift.day !== dayOfWeek) {
      return {
        startTime: businessHour.timeOpen,
        endTime: businessHour.timeClose,
        lunchStart: null,
        lunchEnd: null,
        source: 'business',
      };
    }

    // Use shift times, but constrain to business hours
    const shiftStartTime = shift.startTime;
    const shiftEndTime = shift.endTime;
    const lunchStartTime = shift.lunchStart ?? null;
    const lunchEndTime = shift.lunchEnd ?? null;

    // Constrain shift to business hours (shift cannot exceed business hours)
    const effectiveStart = Math.max(shiftStartTime, businessHour.timeOpen);
    const effectiveEnd = Math.min(shiftEndTime, businessHour.timeClose);

    return {
      startTime: effectiveStart,
      endTime: effectiveEnd,
      lunchStart: lunchStartTime,
      lunchEnd: lunchEndTime,
      source: 'shift',
    };
  }

  // Check if two time ranges overlap
  function isTimeRangeOverlapping(
    start1: number,
    end1: number,
    start2: number,
    end2: number,
  ): boolean {
    return start1 < end2 && end1 > start2;
  }

  // Process each availability slot
  for (const availability of availabilities) {
    const dateStr = availability.date;
    const employeeId = availability.employeeId;

    // Get day of week (0 = Sunday, 6 = Saturday)
    const date = parseDate(dateStr, 'yyyy-MM-dd', new Date());
    const dayOfWeek = date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;

    // Get shift for this employee on this day
    const shift = await getEmployeeShift(employeeId, dayOfWeek);

    // Get business hours for this day
    const businessHour = businessHoursByDay.get(dayOfWeek) || null;

    // Get effective working hours for this day
    const workingHours = getEffectiveWorkingHours(
      shift,
      businessHour,
      dayOfWeek,
    );

    let shouldBeAvailable = true;
    let reason: Reason = 'within_working_hours';

    // Handle case where business is closed or employee is off
    if (workingHours.source === 'dayoff') {
      shouldBeAvailable = false;
      reason = 'day_off';
    } else if (workingHours.source === 'closed') {
      shouldBeAvailable = false;
      reason = 'business_closed';
    } else if (workingHours.startTime == null || workingHours.endTime == null) {
      shouldBeAvailable = false;
      reason = 'business_closed';
    } else {
      const startTime = availability.timeStart;
      const endTime = availability.timeEnd;

      // Check if completely outside working hours
      if (
        startTime >= workingHours.endTime ||
        endTime <= workingHours.startTime
      ) {
        shouldBeAvailable = false;
        reason =
          workingHours.source === 'shift'
            ? 'outside_shift_hours'
            : 'outside_business_hours';
      }
      // Check if partially outside working hours
      else if (
        startTime < workingHours.startTime ||
        endTime > workingHours.endTime
      ) {
        shouldBeAvailable = false;
        reason =
          workingHours.source === 'shift'
            ? 'outside_shift_hours'
            : 'outside_business_hours';
      }
      // Check for lunch conflicts
      else if (
        workingHours.lunchStart !== null &&
        workingHours.lunchEnd !== null &&
        isTimeRangeOverlapping(
          startTime,
          endTime,
          workingHours.lunchStart,
          workingHours.lunchEnd,
        )
      ) {
        shouldBeAvailable = false;
        reason = 'conflicts_with_lunch_break';
      }
    }

    // If availability status needs to change, add to update list
    if (availability.isAvailable !== shouldBeAvailable) {
      slotsToUpdate.push({
        id: availability._id,
        isAvailable: shouldBeAvailable,
        reason: reason,
        employeeId: employeeId,
        date: dateStr,
        timeStart: availability.timeStart,
        timeEnd: availability.timeEnd,
      });
    }
  }

  // Generate summary
  const updateReasons: Record<Reason, number> = {};
  const availableToUnavailable: Record<Reason, number> = {};
  const unavailableToAvailable: Record<Reason, number> = {};

  for (const slot of slotsToUpdate) {
    updateReasons[slot.reason] = (updateReasons[slot.reason] || 0) + 1;

    if (slot.isAvailable) {
      unavailableToAvailable[slot.reason] =
        (unavailableToAvailable[slot.reason] || 0) + 1;
    } else {
      availableToUnavailable[slot.reason] =
        (availableToUnavailable[slot.reason] || 0) + 1;
    }
  }

  return {
    slotsToUpdate,
    summary: {
      updates: slotsToUpdate.length,
      reasons: {
        all: updateReasons,
        madeAvailable: unavailableToAvailable,
        madeUnavailable: availableToUnavailable,
      },
    },
  };
}
