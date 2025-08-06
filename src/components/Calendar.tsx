import { useRef, useState } from "react";
import {
  addMonths,
  subMonths,
  setMonth,
  setDate,
} from 'date-fns';
import { YearCalendar } from "./YearCalendar";
import { MonthCalender } from "./MonthCalendar";
import { WeekCalendar } from "./WeekCalendar";
import { DayCalendar } from "./DayCalendar";


interface CalendarProps {
  lang: string
  views: Map<'year' | 'month' | 'week' | 'day', boolean>
  hasWheelZoom?: boolean
  blockPastDatesFrom?: Date;
  blockFutureDatesFrom?: Date;
}

export const Calendar = ({ lang, views, hasWheelZoom = false, blockFutureDatesFrom, blockPastDatesFrom }: CalendarProps) => {
  const [viewIdx, setViewIdx] = useState<number>(1)
  const [currentDay, setCurrentDay] = useState(new Date())
  const viewThreshold = useRef(0)

  const view = [...views.entries()][viewIdx][0];

  const goToPreviousMonth = () => {
    setCurrentDay(subMonths(currentDay, 1));
  };

  const goToNextMonth = () => {
    setCurrentDay(addMonths(currentDay, 1));
  };

  const onWheelChange: React.WheelEventHandler = (e) => {
    if (!hasWheelZoom) return;
    e.preventDefault();
    const currTarget = e.currentTarget as HTMLDivElement;
    const target = e.target as HTMLElement;
    const data = view === 'year' ? currTarget.querySelector('h2')?.dataset.month : view === 'month' ? target.dataset.date : view === 'week' ? [...currTarget.querySelectorAll('[data-day]').values()].find(el => el.contains(target))?.dataset?.day : null;

    if (target.dataset.day && target.scrollTop > 0) return
    const delta = (e.deltaY) * -0.01;
    viewThreshold.current += delta;

    if (viewIdx === 0 && viewThreshold.current >= 2) {
      viewThreshold.current = 2
      return
    };
    if (viewIdx === 3 && viewThreshold.current <= -2) {
      viewThreshold.current = -2;
      return
    };

    // positive is wheel down aka zooming out
    if (viewThreshold.current > 2) {
      viewThreshold.current = 0;
      setViewIdx(idx => { return idx - 1 });
    } else if (viewThreshold.current < -2) {
      viewThreshold.current = 0;
      setViewIdx(idx => { return idx + 1 })
      if (view === 'year' && data) {
        setCurrentDay(setMonth(currentDay, data))
      } else if (view === 'month' && data) {
        setCurrentDay(new Date(data));
      } else if (view === 'week') {
        setCurrentDay(setDate(currentDay, data))
      }
    }
  }

  return <>
    <MonthCalender lang={lang} date={currentDay} onDateClick={(date) => { setCurrentDay(date); }} onWheelChange={onWheelChange} onNextMonthClick={goToNextMonth} onPrevMonthClick={goToPreviousMonth} blockPastDatesFrom={blockPastDatesFrom} blockFutureDatesFrom={blockFutureDatesFrom} />
    <DayCalendar lang={lang} date={currentDay} onWheelChange={onWheelChange} />
  </>

  return <>
    {
      view === 'year' ?
        <YearCalendar lang={lang} date={currentDay} onDateClick={(date) => {
          setCurrentDay(date);
          setViewIdx(3)
        }} onWheelChange={onWheelChange} /> :
        view === 'month' ?
          <MonthCalender lang={lang} date={currentDay} onDateClick={(date) => { setCurrentDay(date); }} onWheelChange={onWheelChange} onNextMonthClick={goToNextMonth} onPrevMonthClick={goToPreviousMonth} blockPastDatesFrom={blockPastDatesFrom} blockFutureDatesFrom={blockFutureDatesFrom} /> :
          view === 'week' ?
            <WeekCalendar lang={lang} date={currentDay} onDateClick={date => { setCurrentDay(date); setViewIdx(3) }} onWheelChange={onWheelChange} />
            : <DayCalendar lang={lang} date={currentDay} onWheelChange={onWheelChange} />
    }
  </>
};
