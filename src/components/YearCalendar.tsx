import { eachMonthOfInterval, startOfYear, endOfYear, startOfMonth, endOfMonth, isSameMonth, eachDayOfInterval } from "date-fns";

interface YearCalendarProps {
  lang: string,
  date: Date,
  onDateClick: (date: Date) => void;
  onWheelChange: React.WheelEventHandler
}

export const YearCalendar = ({ lang, date, onDateClick, onWheelChange }: YearCalendarProps) => {
  const monthInterval = eachMonthOfInterval({ start: startOfYear(date), end: endOfYear(date) })
  const daysOfMonth = monthInterval.map(mo => eachDayOfInterval({ start: startOfMonth(mo), end: endOfMonth(mo) }));

  return <div className="space-y-2">
    <h2 className="text-center">{Intl.DateTimeFormat(lang, { year: 'numeric' }).format(date)}</h2>
    <div className="grid grid-cols-4 grid-rows-3 gap-4">
      {monthInterval.map(mo =>
        <div key={mo.getMonth()} data-month={mo.getMonth()} className="border rounded-md p-2" onWheel={onWheelChange}>
          <h2 data-month={mo.getMonth()} className="text-center">{Intl.DateTimeFormat(lang, { month: 'long' }).format(mo)}</h2>
          <div>
            {daysOfMonth.filter(mon => isSameMonth(mo, mon[0])).map(day =>
              <div className="grid grid-cols-7">
                {day.map(d => <div key={d.toISOString()} className="p-1 h-8 w-8 grid place-items-center hover:rounded-sm hover:bg-blue-400" onClick={() => { onDateClick(d) }}>{Intl.DateTimeFormat(lang, { day: 'numeric' }).format(d)}</div>)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>

}
