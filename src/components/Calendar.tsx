import { useState } from 'react';
import { MonthCalender } from './MonthCalendar';
import { DayCalendar } from './DayCalendar';

interface CalendarProps {
  lang: string;
  hasWheelZoom?: boolean;
  blockPastDatesFrom?: Date;
  blockFutureDatesFrom?: Date;
}

export const Calendar = ({
  lang,
  blockFutureDatesFrom,
  blockPastDatesFrom,
}: CalendarProps) => {
  const [currentDay, setCurrentDay] = useState(new Date());

  return (
    <div className='flex justify-center h-[600px]'>
      <MonthCalender
        lang={lang}
        date={currentDay}
        onDateChange={(date) => {
          setCurrentDay(date);
        }}
        blockPastDatesFrom={blockPastDatesFrom}
        blockFutureDatesFrom={blockFutureDatesFrom}
      />
      <DayCalendar lang={lang} date={currentDay} />
    </div>
  );
};
