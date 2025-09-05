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
  isWithinInterval,
} from 'date-fns';
import { cx } from '@ahpatuh/utils';
import { useEffect, useState, useRef } from 'react';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Id } from 'convex/_generated/dataModel';

type SingleDate = {
  date: Date;
  onDateChange: (date: Date) => void;
  dateRange?: never;
  onDateRangeChange?: never;
};
type DateRange = {
  date?: never;
  onDateChange?: never;
  dateRange: {
    start?: Date;
    end?: Date;
  };
  onDateRangeChange: (dateRange: {
    _id?: Id<'employeeUnavailabilities'>;
    mode?: 'dnd';
    start: Date;
    end: Date;
  }) => void;
};
type MonthCalendarProps = {
  onWheelChange?: React.WheelEventHandler;
  blockPastDatesFrom?: Date;
  blockFutureDatesFrom?: Date;
  className?: string;
  lang: string;
  unavailabilities?: {
    _id: Id<'employeeUnavailabilities'>;
    startDate: string;
    endDate: string;
    reason?: string;
  }[];
} & (SingleDate | DateRange);

const week = eachDayOfInterval({
  start: startOfWeek(new Date()),
  end: endOfWeek(new Date()),
});

const DragAndDropWrapper = ({
  day,
  unavailabilities = [],
  headOrTail,
  onDateRangeChange,
  blockPastDatesFrom,
  blockFutureDatesFrom,
  children,
}: React.PropsWithChildren<{
  day: Date;
  blockPastDatesFrom?: Date;
  blockFutureDatesFrom?: Date;
  unavailabilities?: {
    _id: Id<'employeeUnavailabilities'>;
    startDate: string;
    endDate: string;
    reason?: string;
  }[];
  headOrTail: 'head' | 'tail' | null;
  onDateRangeChange: (dateRange: {
    _id?: Id<'employeeUnavailabilities'>;
    mode?: 'dnd';
    start: Date;
    end: Date;
  }) => void;
}>) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return draggable({
      element: el,
      canDrag: () => !!headOrTail,
      getInitialData: () => ({ day, headOrTail }),
      onDragStart: () => setDragging(true),
      onDrop: () => setDragging(false),
    });
  }, [day, headOrTail]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return dropTargetForElements({
      element: el,
      onDragEnter: ({ source }) => {
        if (!source.data.isUnavailability) return;
        setIsDraggedOver(true);
      },
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: ({ source }) => {
        const dropDate = source.data.day as Date;
        const headOrTail = source.data.headOrTail as 'head' | 'tail' | null;
        if (!headOrTail) return;
        const unavailability = unavailabilities.filter((u) =>
          isWithinInterval(dropDate, {
            start: u.startDate,
            end: u.endDate,
          }),
        )[0];
        const start = new Date(unavailability.startDate);
        const end = new Date(unavailability.endDate);
        if (headOrTail === 'head') {
          onDateRangeChange({
            _id: unavailability._id,
            mode: 'dnd',
            start: day,
            end,
          });
        } else {
          onDateRangeChange({
            _id: unavailability._id,
            mode: 'dnd',
            start,
            end: day,
          });
        }

        setIsDraggedOver(false);
      },
      canDrop: () => {
        if (blockPastDatesFrom && isBefore(day, blockPastDatesFrom))
          return false;
        if (blockFutureDatesFrom && isAfter(day, blockFutureDatesFrom))
          return false;
        return true;
      },
    });
  }, [
    unavailabilities,
    blockPastDatesFrom,
    blockFutureDatesFrom,
    day,
    headOrTail,
    onDateRangeChange,
  ]);

  return (
    <div
      ref={ref}
      className={cx({
        'opacity-50': dragging || isDraggedOver,
      })}
    >
      {children}
    </div>
  );
};

export const MonthCalender = ({
  lang,
  date,
  onDateChange,
  dateRange,
  onDateRangeChange,
  onWheelChange,
  blockPastDatesFrom,
  blockFutureDatesFrom,
  className,
  unavailabilities,
}: MonthCalendarProps) => {
  const [internalDateRange, setInternalDateRange] = useState<{
    start?: Date;
    end?: Date;
  }>(() => {
    if (dateRange) return dateRange;
    return { start: undefined, end: undefined };
  });
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
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

  const calendarDays = date
    ? getCalendarDays(date)
    : getCalendarDays(dateRange.start);

  return (
    <div className={cx('w-fit', className)}>
      <div className='grid grid-cols-7 h-10'>
        {week.map((day) => (
          <div key={day.getDay()} className='grid place-items-center text-xl'>
            {Intl.DateTimeFormat(lang, { weekday: 'short' }).format(day)}
          </div>
        ))}
      </div>
      <div className='grid grid-cols-7' onWheel={onWheelChange}>
        {calendarDays.map((day) => {
          const beforeDate =
            blockPastDatesFrom && isBefore(day, blockPastDatesFrom);
          const afterDate =
            blockFutureDatesFrom && isAfter(day, blockFutureDatesFrom);
          const isUnavailable =
            unavailabilities?.filter((u) => {
              return isWithinInterval(day, {
                start: new Date(u.startDate),
                end: new Date(u.endDate),
              });
            }) ?? [];

          let headOrTail: 'head' | 'tail' | null = null;
          if (isUnavailable.length) {
            headOrTail = isSameDay(day, isUnavailable[0].startDate)
              ? 'head'
              : isSameDay(day, isUnavailable[0].endDate)
                ? 'tail'
                : null;
          }

          const disabled = beforeDate || afterDate;
          const selectable = !beforeDate && !afterDate;

          if (date) {
            return (
              <button
                key={day.toISOString()}
                disabled
                aria-disabled={disabled}
                className={cx(
                  'text-2xl font-bold relative grid place-items-center h-20 w-20 rounded-full mx-auto text-gray-400',
                  {
                    'text-gray-400': disabled,
                    'bg-blue-100 text-blue-600 hover:bg-blue-200': selectable,
                    'bg-blue-600 text-white hover:bg-blue-600': isSameDay(
                      day,
                      date,
                    ),
                    'bg-gray-300 text-gray-600 hover:bg-gray-400':
                      (isSameMonth(addMonths(date, 1), day) && !afterDate) ||
                      (!beforeDate && isBefore(day, startOfMonth(date))),
                    'bg-black': isUnavailable.length > 0,
                  },
                )}
                data-date={day.toISOString()}
                onClick={() => {
                  if (disabled) {
                    return;
                  } else if (onDateChange) {
                    onDateChange(day);
                  }
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
          } else {
            return (
              <DragAndDropWrapper
                key={day.toISOString()}
                unavailabilities={unavailabilities}
                day={day}
                headOrTail={headOrTail}
                blockFutureDatesFrom={blockFutureDatesFrom}
                blockPastDatesFrom={blockPastDatesFrom}
                onDateRangeChange={onDateRangeChange}
              >
                <button
                  disabled={disabled}
                  aria-disabled={disabled}
                  data-date={day.toISOString()}
                  className={cx(
                    'size-20 text-2xl font-bold rounded-full grid place-items-center text-blue-500 bg-blue-200 hover:bg-blue-600 hover:text-white',
                    {
                      'cursor-grab inset-ring-apt-primary inset-ring-4':
                        !!headOrTail,
                      'bg-transparent cursor-default text-gray-400 hover:bg-transparent hover:text-gray-400':
                        disabled,
                      'bg-blue-600 text-white': isSameDay(day, new Date()),
                      'bg-black text-white hover:bg-black':
                        isUnavailable.length > 0,
                      'opacity-50':
                        internalDateRange.start &&
                        hoveredDate &&
                        (blockPastDatesFrom
                          ? isAfter(day, blockPastDatesFrom)
                          : true) &&
                        isWithinInterval(day, {
                          start: internalDateRange.start,
                          end: hoveredDate,
                        }),
                    },
                  )}
                  onClick={() => {
                    if (!internalDateRange.start) {
                      setInternalDateRange({ start: day, end: undefined });
                    } else if (!internalDateRange.end) {
                      if (onDateRangeChange) {
                        if (isBefore(day, internalDateRange.start)) {
                          onDateRangeChange({
                            start: day,
                            end: internalDateRange.start,
                          });
                        } else {
                          onDateRangeChange({
                            start: internalDateRange.start,
                            end: day,
                          });
                        }
                      }
                      setInternalDateRange({
                        start: undefined,
                        end: undefined,
                      });
                    }
                  }}
                  onMouseOver={() => {
                    setHoveredDate(day);
                  }}
                  onMouseLeave={() => {
                    setHoveredDate(null);
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
              </DragAndDropWrapper>
            );
          }
        })}
      </div>
    </div>
  );
};
