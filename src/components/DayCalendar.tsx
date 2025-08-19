import { startOfDay, endOfDay, eachMinuteOfInterval } from 'date-fns';

interface DayCalendarProps {
  date: Date;
  onWheelChange?: React.WheelEventHandler;
  timeOpen?: Date;
  timeClose?: Date;
  lang: string;
}

export const DayCalendar = ({
  date,
  lang,
  onWheelChange,
}: DayCalendarProps) => {
  const start = startOfDay(date);
  const end = endOfDay(date);
  const name = Intl.DateTimeFormat(lang, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(start);
  const hourInterval = eachMinuteOfInterval({ start, end }, { step: 30 });

  return (
    <div className='space-y-5 w-72 py-4 px-6 flex flex-col'>
      <h2 className='text-center font-bold text-gray-600'>{name}</h2>
      <div
        data-view='day'
        className='overflow-y-scroll pl-1 py-1 pr-4 space-y-4'
        onWheel={onWheelChange}
      >
        {hourInterval.map((hour) => (
          <button
            className='h-12 border border-blue-600 text-blue-600 mx-auto w-full rounded grid place-items-center hover:ring-2 hover:ring-blue-600 focus:ring-blue-600'
            key={hour.getTime()}
            data-time={hour.getTime()}
          >
            <span>
              {Intl.DateTimeFormat(lang, {
                hour: 'numeric',
                minute: '2-digit',
              }).format(hour)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
