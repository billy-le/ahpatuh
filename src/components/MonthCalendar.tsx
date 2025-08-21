import {
  startOfMonth,
  endOfMonth,
  addWeeks,
  isSameMonth,
  isSameDay,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isBefore,
  isAfter,
  addMonths,
} from 'date-fns';
import { cx } from '~/lib/cva';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthCalendarProps {
  date: Date;
  onDateClick: (date: Date) => void;
  onPrevMonthClick: () => void;
  onNextMonthClick: () => void;
  onWheelChange?: React.WheelEventHandler;
  blockPastDatesFrom?: Date;
  blockFutureDatesFrom?: Date;
  className?: string,
  lang: string;
}
const week = eachDayOfInterval({
  start: startOfWeek(new Date()),
  end: endOfWeek(new Date()),
});

export const MonthCalender = ({
  lang,
  date,
  onDateClick,
  onWheelChange,
  onNextMonthClick,
  onPrevMonthClick,
  blockPastDatesFrom,
  blockFutureDatesFrom,
  className,
}: MonthCalendarProps) => {
  const getCalendarDays = (date: Date): Date[] => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    let days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    if (days.length < 42) {
      const prevMonth = addWeeks(calendarEnd, 1);
      const addDays = eachDayOfInterval({
        start: startOfWeek(prevMonth),
        end: prevMonth,
      });
      days = [...days, ...addDays];
    }
    return days;
  };

  const calendarDays = getCalendarDays(date);

  return (
    <div className={cx('space-y-2 px-6 flex flex-col justify-center', className)}>
      <div className='flex justify-center items-center gap-2'>
        <button
          className='size-6 grid place-items-center border border-gray-500 rounded'
          onClick={() => {
            if (
              blockPastDatesFrom &&
              isAfter(blockPastDatesFrom, calendarDays[0])
            )
              return;
            onPrevMonthClick();
          }}
        >
          <ChevronLeft />
        </button>
        <span>
          {Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' }).format(
            date,
          )}
        </span>
        <button
          className='size-6 grid place-items-center border border-gray-500 rounded'
          onClick={() => {
            if (
              blockFutureDatesFrom &&
              isBefore(
                blockFutureDatesFrom,
                calendarDays[calendarDays.length - 1],
              )
            )
              return;
            onNextMonthClick();
          }}
        >
          <ChevronRight />
        </button>
      </div>
      <div>
        <div className='grid grid-cols-7 h-10'>
          {week.map((day) => (
            <div key={day.getDay()} className='grid place-items-center text-xl'>
              {Intl.DateTimeFormat(lang, { weekday: 'short' }).format(day)}
            </div>
          ))}
        </div>
        <div className='grid grid-cols-7 gap-2' onWheel={onWheelChange}>
          {calendarDays.map((day) => {
            const beforeDate =
              blockPastDatesFrom && isBefore(day, blockPastDatesFrom);
            const afterDate =
              blockFutureDatesFrom && isAfter(day, blockFutureDatesFrom);
            return (
              <button
                key={day.toISOString()}
                disabled={beforeDate || afterDate}
                aria-disabled={beforeDate || afterDate}
                className={cx(
                  'text-2xl font-bold relative grid place-items-center h-20 w-20 rounded-full mx-auto text-gray-400',
                  (beforeDate || afterDate) && 'text-gray-400',
                  !beforeDate &&
                  !afterDate &&
                  'bg-blue-100 text-blue-600 hover:bg-blue-200',
                  isSameDay(day, date) &&
                  'bg-blue-600 text-white hover:bg-blue-600',
                  isSameMonth(addMonths(date, 1), day) &&
                  !afterDate &&
                  'bg-gray-300 text-gray-600 hover:bg-gray-400',
                  !beforeDate && isBefore(day, startOfMonth(date)) && 'bg-gray-300 text-gray-600 hover:bg-gray-400 hi',

                )}
                data-date={day.toISOString()}
                onClick={() => {
                  if (beforeDate || afterDate) {
                    return;
                  }
                  onDateClick(day);
                }}
              >
                <span
                  className={cx(
                    isSameDay(new Date(), day) &&
                    'relative after:block after:h-3 after:w-3 after:rounded-full after:absolute after:-bottom-4 after:left-1/2 after:-translate-x-1/2 after:bg-blue-600',
                  )}
                >
                  {Intl.DateTimeFormat(lang, { day: 'numeric' }).format(day)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
