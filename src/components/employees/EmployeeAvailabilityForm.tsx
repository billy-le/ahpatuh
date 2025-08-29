import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '../ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Doc } from 'convex/_generated/dataModel';
import { MonthCalender } from '../MonthCalendar';
import {
  eachDayOfInterval,
  endOfDay,
  endOfYesterday,
  parse,
  startOfDay,
  isValid,
  format as dateFormat,
  isWithinInterval,
  isBefore,
  isAfter,
} from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';
import { useMemo, useState } from 'react';
import { useMutation } from 'convex/react';
import { Input } from '../ui/input';
import { EmployeeDataTable } from './data-table';
import { employeeUnavailabitiesColumns } from './columns';
import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
import { Loader } from '../ui/loader';

interface EmployeeAvailabilityFormProps {
  employee: Doc<'employees'>;
  view: 'calendar' | 'list';
}

const employeeAvailabiltySchema = z.object({
  _id: z.string().optional(),
  startDate: z
    .string()
    .optional()
    .refine(
      (d) => {
        if (!d) return true;
        return !isBefore(endOfDay(new Date(d)), endOfYesterday());
      },
      {
        message: 'Day cannot be in the past',
      },
    ),
  endDate: z.string().optional(),
  reason: z.string().optional(),
  mode: z.string().optional(),
});

export function EmployeeAvailabilityForm({
  employee,
  view,
}: EmployeeAvailabilityFormProps) {
  const [open, setOpen] = useState(false);
  const args = useMemo(
    () => ({
      employeeIds: [employee._id],
      startDate: startOfDay(new Date()).toISOString(),
    }),
    [employee._id],
  );
  const {
    data: user,
    isPending: isUserPending,
    error: userError,
  } = useQuery(convexQuery(api.users.getUser, {}));
  const {
    data: unavailabilities = [],
    isPending: isUnavailabilityPending,
    error: unavailabilityError,
  } = useQuery(
    convexQuery(api.employeeUnavailability.getEmployeeUnavailabilities, args),
  );
  const mutateUnavailability = useMutation(
    api.employeeUnavailability.mutateEmployeeAvailability,
  );
  const deleteUnavailability = useMutation(
    api.employeeUnavailability.deleteUnavailability,
  );

  const form = useForm({
    resolver: zodResolver(employeeAvailabiltySchema),
  });

  const getDateRange = ({ start, end }: { start: string; end: string }) => {
    if (!start || !end) return null;
    const startDate = parse(start, 'yyyy-MM-dd', new Date());
    const endDate = parse(end, 'yyyy-MM-dd', new Date());
    if (!isValid(startDate) || !isValid(endDate)) return null;
    return {
      start: startOfDay(startDate),
      end: endOfDay(endDate),
    };
  };

  const findOverlaps = ({ start, end }: { start: string; end: string }) => {
    const dateRange = getDateRange({
      start,
      end,
    });

    const overlaps = unavailabilities.filter((u) => {
      const days = eachDayOfInterval({ start: u.startDate, end: u.endDate });
      return days.some((day) => isWithinInterval(day, dateRange!));
    });

    // extend current unavailabities to selected date range
    if (overlaps.length) {
      // find the earliest and latest date in all the date ranges
      let startDate = dateRange!.start;
      let endDate = dateRange!.end;

      overlaps.forEach((u) => {
        startDate = isBefore(u.startDate, startDate)
          ? new Date(u.startDate)
          : startDate;
        endDate = isAfter(u.endDate, endDate) ? new Date(u.endDate) : endDate;
      });

      return {
        start: startDate,
        end: endDate,
      };
    }
    return {
      start,
      end,
    };
  };

  const onSubmit = async (
    values: z.infer<typeof employeeAvailabiltySchema>,
  ) => {
    if (!values.startDate || !values.endDate) return;

    const dateRange = getDateRange({
      start: values.startDate,
      end: values.endDate,
    });

    if (!dateRange) return;
    if (values.mode === 'dnd' && values._id) {
      const unavailability = unavailabilities.find((u) => u._id === values._id);
      if (!unavailability) return;
      await mutateUnavailability({
        unavailablityId: unavailability._id,
        employeeId: employee._id,
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
        reason: values.reason ?? unavailability.reason,
      });
      setOpen(false);
      return;
    }

    const overlaps = unavailabilities.filter((u) => {
      const days = eachDayOfInterval({ start: u.startDate, end: u.endDate });
      return days.some((day) => isWithinInterval(day, dateRange));
    });

    // extend current unavailabities to selected date range
    if (overlaps.length) {
      // find the earliest and latest date in all the date ranges
      let startDate = dateRange.start;
      let endDate = dateRange.end;
      overlaps.forEach((u) => {
        startDate = isBefore(u.startDate, startDate)
          ? new Date(u.startDate)
          : startDate;
        endDate = isAfter(u.endDate, endDate) ? new Date(u.endDate) : endDate;
      });

      const [firstOverlap, ...rest] = overlaps;

      await mutateUnavailability({
        unavailablityId: firstOverlap._id,
        employeeId: employee._id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        reason: values.reason || firstOverlap.reason,
      });
      await Promise.all(
        rest.map((r) =>
          deleteUnavailability({
            unavailabilityId: r._id,
            employeeId: employee._id,
          }),
        ),
      );
    } else {
      mutateUnavailability({
        startDate: dateRange!.start.toISOString(),
        endDate: dateRange!.end.toISOString(),
        employeeId: employee._id,
        reason: values.reason,
      });
    }
    setOpen(false);
  };

  if (isUserPending || isUnavailabilityPending) {
    return <Loader />;
  }

  if (userError || unavailabilityError) {
    return <div>Something went wrong</div>;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          form.reset();
        }
        setOpen(open);
      }}
    >
      {view === 'calendar' ? (
        <MonthCalender
          lang={user?.language?.value ?? 'en-US'}
          dateRange={{
            start: undefined,
            end: undefined,
          }}
          onDateRangeChange={(dateRange) => {
            if (dateRange.mode === 'dnd') {
              form.setValue(
                'startDate',
                dateFormat(dateRange.start, 'yyyy-MM-dd'),
              );
              form.setValue('endDate', dateFormat(dateRange.end, 'yyyy-MM-dd'));
              form.setValue('_id', dateRange._id);
              form.setValue('mode', 'dnd');
              setOpen(true);
              return;
            }
            const overlaps = findOverlaps({
              start: dateFormat(dateRange.start, 'yyyy-MM-dd'),
              end: dateFormat(dateRange.end, 'yyyy-MM-dd'),
            });
            form.setValue(
              'startDate',
              dateFormat(overlaps.start, 'yyyy-MM-dd'),
            );
            form.setValue('endDate', dateFormat(overlaps.end, 'yyyy-MM-dd'));
            setOpen(true);
          }}
          blockPastDatesFrom={endOfYesterday()}
          unavailabilities={unavailabilities}
        />
      ) : (
        <EmployeeDataTable
          columns={employeeUnavailabitiesColumns}
          data={unavailabilities}
        />
      )}
      <DialogContent>
        <Form {...form}>
          <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='startDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input
                      type='date'
                      min={dateFormat(new Date(), 'yyyy-MM-dd')}
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='endDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type='date' required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit'>Save</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
