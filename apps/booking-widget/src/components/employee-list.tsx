import type { api } from '@ahpatuh/convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';
import { isWithinInterval, parseISO, parse as dateParse } from 'date-fns';
import { cx } from '@ahpatuh/utils';

interface EmployeeListProps {
  employees: FunctionReturnType<typeof api.widget.getEmployees>;
  selectedEmployee:
    | FunctionReturnType<typeof api.widget.getEmployees>[number]
    | null;
  onEmployeeChange: (
    employee: FunctionReturnType<typeof api.widget.getEmployees>[number],
  ) => void;
  selectedDate: Date;
  selectedTime: Date;
}
export function EmployeeList({
  employees,
  selectedEmployee,
  onEmployeeChange,
  selectedTime,
  selectedDate,
}: EmployeeListProps) {
  return employees
    .filter((employee) => {
      const unavailable = employee.unavailabilities.find((ua) => {
        return isWithinInterval(selectedTime, {
          start: parseISO(ua.startDate),
          end: parseISO(ua.endDate),
        });
      });

      if (unavailable) return false;
      const shift = employee.shifts[selectedTime?.getDay() ?? 0];
      if (shift && shift.startTime && shift.endTime) {
        const start = dateParse(shift.startTime, 'HH:mm', selectedDate!);
        const end = dateParse(shift.endTime, 'HH:mm', selectedDate!);
        return isWithinInterval(selectedTime, {
          start,
          end,
        });
      }
      return true;
    })
    ?.map((employee) => {
      return (
        <div key={employee._id}>
          <button
            className={cx(
              'h-10 px-3 flex items-center justify-center gap-4 min-w-72',
              {
                'border-2 border-pink-500 text-pink-500':
                  selectedEmployee?._id === employee._id,
              },
            )}
            onClick={(e) => {
              e.preventDefault();
              onEmployeeChange(employee);
            }}
          >
            {employee.firstName} {employee.lastName.slice(0, 1)[0]}.
            {selectedEmployee?._id === employee._id && <span>Check</span>}
          </button>
        </div>
      );
    });
}
