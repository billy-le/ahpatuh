import type { api } from '@ahpatuh/convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { cx } from '@ahpatuh/utils';
import { useState } from 'preact/hooks';
import { ChevronsRightIcon, ChevronsLeftIcon } from 'lucide-preact';

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
  const [start, setStart] = useState(startOfWeek(date));
  const [end, setEnd] = useState(endOfWeek(date));

  const name = `${Intl.DateTimeFormat(lang, { month: 'long', day: 'numeric' }).format(start)} - ${Intl.DateTimeFormat(lang, { month: 'long', day: 'numeric' }).format(end)}`;
  const weekInterval = eachDayOfInterval({ start, end });

  return (
    <div className='space-y-2'>
      <div className='flex gap-4 items-center justify-center'>
        <button
          onClick={(e) => {
            e.preventDefault();
            const prevWeek = subWeeks(start, 1);
            if (isBefore(prevWeek, new Date())) return;
            setStart(prevWeek);
            setEnd(subWeeks(end, 1));
          }}
        >
          <ChevronsLeftIcon />
        </button>
        <h2 className='text-center'>{name}</h2>
        <button
          onClick={(e) => {
            e.preventDefault();
            setStart(addWeeks(start, 1));
            setEnd(addWeeks(end, 1));
          }}
        >
          <ChevronsRightIcon />
        </button>
      </div>
      <div className='grid grid-cols-7'>
        {weekInterval.map((day, index) => {
          const businessHours = business?.businessHours[index];
          const isClosed = businessHours?.isClosed;
          const isPastDate = isBefore(day, date);
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
                      'bg-gray-300 hover:bg-gray-300': isPastDate || isClosed,
                      'bg-pink-400':
                        selectedDate && isSameDay(selectedDate, day),
                    },
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    if (isClosed || isPastDate) return;

                    onDateChange(day);
                  }}
                  disabled={isClosed || isPastDate}
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
