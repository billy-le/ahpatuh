import { createSignal } from 'solid-js';
import {
  addWeeks,
  eachDayOfInterval,
  startOfDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format as dateFormat,
  parse as dateParse,
  isValid,
  isBefore,
  isSameDay,
} from 'date-fns';
import { cx } from '@ahpatuh/utils';

export interface CalendarWidgetProps {
  isLoaded: boolean;
  primaryColor: string;
  secondaryColor: string;
}

const weekDayNameFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
});
const dayFormatter = new Intl.DateTimeFormat('en-US', { day: 'numeric' });

function CalendarWidget({
  isLoaded,
  secondaryColor,
  primaryColor,
}: CalendarWidgetProps) {
  const today = startOfDay(new Date());
  const [date, setDate] = createSignal(today);
  const [selectedDate, setSelectedDate] = createSignal<Date | null>(today);
  const weekStart = () => startOfWeek(date());
  const weekEnd = () => endOfWeek(date());

  const daysOfTheWeek = () =>
    eachDayOfInterval({
      start: weekStart(),
      end: weekEnd(),
    });

  const getCalendarDays = (date: Date | undefined): Date[] => {
    date = date ? date : new Date();
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

  const isSelectedSameDay = (day: Date) => {
    const date = selectedDate();
    return date ? isSameDay(date, day) : false;
  };

  return (
    <div class='w-fit'>
      {isLoaded && (
        <input
          type='date'
          class='mx-auto block'
          min={dateFormat(new Date(), 'yyyy-MM-dd')}
          onchange={(e) => {
            const value = e.target.value;
            const date = dateParse(value, 'yyyy-MM-dd', new Date());
            if (isValid(date) && !isBefore(date, new Date())) {
              setDate(date);
            }
          }}
          value={dateFormat(date(), 'yyyy-MM-dd')}
        />
      )}
      <div
        class={cx('grid grid-cols-7 gap-1', {
          'cursor-none pointer-events-none relative': !isLoaded,
        })}
      >
        {daysOfTheWeek().map((day) => (
          <div class='text-center'>{weekDayNameFormatter.format(day)}</div>
        ))}
        {getCalendarDays(date()).map((day) => {
          if (isBefore(day, today)) return <div class='size-10' />;

          return (
            <button
              class='mx-auto rounded-full size-10 grid place-items-center'
              style={{
                'background-color': primaryColor,
                color:
                  selectedDate() && isSelectedSameDay(day)
                    ? 'tan'
                    : (secondaryColor ?? 'black'),
              }}
              onclick={(e) => {
                e.preventDefault();
                setSelectedDate((sDate) => {
                  if (sDate && isSameDay(sDate, day)) return null;
                  return day;
                });
              }}
            >
              {dayFormatter.format(day)}
            </button>
          );
        })}
        {!isLoaded && (
          <div class='absolute inset-0 bg-white/90 h-full w-full grid place-items-center text-xl'>
            <p class='w-64 text-center text-balance'>
              Booking is unavailable at this time
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CalendarWidget;
