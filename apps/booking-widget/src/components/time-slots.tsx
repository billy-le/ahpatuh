import {
  eachMinuteOfInterval,
  startOfDay,
  endOfDay,
  isWithinInterval,
  isSameMinute,
  parse as dateParse,
} from 'date-fns';
import { cx } from '@ahpatuh/utils';
import type { FunctionReturnType } from 'convex/server';
import type { api } from '@ahpatuh/convex/_generated/api';

interface TimeSlotsProps {
  business: FunctionReturnType<typeof api.widget.getBusiness>;
  selectedDate: Date;
  selectedTime: Date | null;
  onTimeChange: (time: Date) => void;
  lang: string;
}
export function TimeSlots({
  business,
  selectedDate,
  selectedTime,
  onTimeChange,
  lang,
}: TimeSlotsProps) {
  const selectedDateName = selectedDate
    ? Intl.DateTimeFormat(lang, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }).format(selectedDate)
    : '';
  const businessHours = business?.businessHours?.[selectedDate?.getDay() ?? 0];

  const closedHoursRange = businessHours
    ? {
        start: businessHours.timeOpen
          ? dateParse(businessHours.timeOpen, 'HH:mm', selectedDate)
          : null,
        end: businessHours.timeClose
          ? dateParse(businessHours.timeClose, 'HH:mm', selectedDate)
          : null,
      }
    : null;

  const hourInterval = selectedDate
    ? eachMinuteOfInterval(
        { start: startOfDay(selectedDate), end: endOfDay(selectedDate) },
        { step: 30 },
      ).filter((hour) => {
        if (
          closedHoursRange &&
          closedHoursRange.start &&
          closedHoursRange.end
        ) {
          return isWithinInterval(hour, closedHoursRange!);
        }
        return true;
      })
    : [];

  return (
    <div className='max-h-80 overflow-y-auto space-y-5 w-72 py-4 px-6 flex flex-col'>
      <h2 className='text-center font-bold text-gray-600'>
        {selectedDateName}
      </h2>
      <div
        data-view='day'
        className='overflow-y-scroll pl-1 py-1 pr-4 space-y-4'
      >
        {hourInterval.map((hour) => {
          return (
            <button
              className={cx(
                'h-12 border border-blue-600 text-blue-600 mx-auto w-full rounded grid place-items-center hover:ring-2 hover:ring-blue-600 focus:ring-blue-600',
                {
                  'bg-blue-600 text-white':
                    selectedTime && isSameMinute(selectedTime, hour),
                },
              )}
              key={hour.getTime()}
              onClick={(e) => {
                e.preventDefault();
                onTimeChange(hour);
              }}
            >
              <span>
                {Intl.DateTimeFormat(lang, {
                  hour: 'numeric',
                  minute: '2-digit',
                }).format(hour)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
