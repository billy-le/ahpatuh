import {
  startOfWeek,
  endOfWeek,
  isSameMonth,
  eachDayOfInterval,
} from 'date-fns';

interface WeekCalendarProps {
  date: Date;
  onDateClick: (date: Date) => void;
  onWheelChange: React.WheelEventHandler;
  lang: string;
}

export const WeekCalendar = ({
  date,
  onDateClick,
  lang,
  onWheelChange,
}: WeekCalendarProps) => {
  const start = startOfWeek(date);
  const end = endOfWeek(date);
  const name = `${Intl.DateTimeFormat(lang, { month: 'long', day: 'numeric' }).format(start)} - ${Intl.DateTimeFormat(lang, { month: 'long', day: 'numeric' }).format(end)}`;
  const weekInterval = eachDayOfInterval({ start, end });

  return (
    <div className='space-y-2'>
      <h2 className='text-center'>{name}</h2>
      <div className='grid grid-cols-7' onWheel={onWheelChange}>
        {weekInterval.map((day) => (
          <div key={day.getDate()} data-day={day.getDate()}>
            <h2 className='h-10 border grid place-items-center'>
              {Intl.DateTimeFormat(lang, { weekday: 'long' }).format(day)}
            </h2>
            <div
              className={`border border-solid border-black h-40 text-right p-4 hover:bg-blue-400 ${isSameMonth(date, day) ? '' : 'bg-gray-300'}`}
              onClick={() => {
                onDateClick(day);
              }}
            >
              {Intl.DateTimeFormat(lang, { day: 'numeric' }).format(day)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
