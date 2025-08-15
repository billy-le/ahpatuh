import { useState } from "react";
import {
  addMonths,
  subMonths,
} from 'date-fns';
import { MonthCalender } from "./MonthCalendar";
import { DayCalendar } from "./DayCalendar";


interface CalendarProps {
  lang: string
  hasWheelZoom?: boolean
  blockPastDatesFrom?: Date;
  blockFutureDatesFrom?: Date;
}

export const Calendar = ({ lang, hasWheelZoom = false, blockFutureDatesFrom, blockPastDatesFrom }: CalendarProps) => {
  const [currentDay, setCurrentDay] = useState(new Date())

  const goToPreviousMonth = () => {
    setCurrentDay(subMonths(currentDay, 1));
  };

  const goToNextMonth = () => {
    setCurrentDay(addMonths(currentDay, 1));
  };

  return <>
    <MonthCalender lang={lang} date={currentDay} onDateClick={(date) => { setCurrentDay(date); }} onNextMonthClick={goToNextMonth} onPrevMonthClick={goToPreviousMonth} blockPastDatesFrom={blockPastDatesFrom} blockFutureDatesFrom={blockFutureDatesFrom} />
    <DayCalendar lang={lang} date={currentDay} />
  </>

};
