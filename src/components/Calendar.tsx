import { useState } from 'react';
import { addMonths, subMonths, isBefore } from 'date-fns';
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
  hasWheelZoom = false,
  blockFutureDatesFrom,
  blockPastDatesFrom,
}: CalendarProps) => {
  const [currentDay, setCurrentDay] = useState(new Date());

  const goToPreviousMonth = () => {
    const date = subMonths(currentDay, 1);
    if (blockPastDatesFrom && isBefore(date, blockPastDatesFrom)) {
      setCurrentDay(new Date);
      return;
    }
    setCurrentDay(date);
  };

  const goToNextMonth = () => {
    setCurrentDay(addMonths(currentDay, 1));
  };

  return (
    <div className='flex justify-center h-[600px]'>
      <MonthCalender
        lang={lang}
        date={currentDay}
        onDateClick={(date) => {
          setCurrentDay(date);
        }}
        onNextMonthClick={goToNextMonth}
        onPrevMonthClick={goToPreviousMonth}
        blockPastDatesFrom={blockPastDatesFrom}
        blockFutureDatesFrom={blockFutureDatesFrom}
      />
      <DayCalendar lang={lang} date={currentDay} />
    </div>
  );
};
