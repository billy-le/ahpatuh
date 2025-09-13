import type { api } from '@ahpatuh/convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { cx } from '@ahpatuh/utils';

interface WeeklyCalendarProps {
  business: FunctionReturnType<typeof api.widget.getBusiness>;
  date: Date;
  selectedDate: Date | null;
  lang: string;
  onDateChange: (date: Date) => void;
}

export function WeeklyCalendar({
  business,
  date,
  selectedDate,
  lang,
  onDateChange,
}: WeeklyCalendarProps) {
  const start = startOfWeek(date);
  const end = endOfWeek(date);
  const name = `${Intl.DateTimeFormat(lang, { month: 'long', day: 'numeric' }).format(start)} - ${Intl.DateTimeFormat(lang, { month: 'long', day: 'numeric' }).format(end)}`;
  const weekInterval = eachDayOfInterval({ start, end });

  return (
    <div className='space-y-2'>
      <h2 className='text-center'>{name}</h2>
      <div className='grid grid-cols-7'>
        {weekInterval.map((day, index) => {
          const businessHours = business?.businessHours[index];
          const isClosed = businessHours?.isClosed ?? false;
          return (
            <div key={day.getDate()} data-day={day.getDate()}>
              <h2 className='h-10 border grid place-items-center'>
                {Intl.DateTimeFormat(lang, { weekday: 'short' }).format(day)}
              </h2>
              <div className='grid place-items-center'>
                <button
                  className={cx(
                    'bg-pink-200 size-20 rounded-full hover:bg-blue-400',
                    {
                      'bg-gray-300 hover:bg-gray-300':
                        !isSameMonth(date, day) || isClosed,
                      'bg-pink-400':
                        selectedDate && isSameDay(selectedDate, day),
                    },
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    if (isClosed) return;

                    onDateChange(day);
                  }}
                  disabled={isClosed}
                >
                  {Intl.DateTimeFormat(lang, { day: 'numeric' }).format(day)}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
