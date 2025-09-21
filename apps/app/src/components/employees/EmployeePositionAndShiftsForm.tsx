import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import {
  Form,
  FormField,
  FormMessage,
  FormControl,
  FormLabel,
  FormItem,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
  Checkbox,
  Loader,
  Input,
} from '@ahpatuh/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Doc, Id } from '@ahpatuh/convex/_generated/dataModel';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@ahpatuh/convex/_generated/api';
import { useEffect, useState } from 'react';
import { ChevronsUpDownIcon, CheckIcon } from 'lucide-react';
import { cx, intToTimeString, timeStringToInt } from '@ahpatuh/utils';
import { eachDayOfInterval, endOfWeek, startOfWeek } from 'date-fns';
import { useMutation } from 'convex/react';

interface EmployeePositionAndShiftsFormProps {
  employee: Doc<'employees'>;
  onSuccess: () => void;
}

const employeePositionAndShiftsSchema = z.object({
  positionId: z.string().optional(),
  shifts: z
    .array(
      z
        .object({
          _id: z.string().optional(),
          day: z.union([
            z.literal(0),
            z.literal(1),
            z.literal(2),
            z.literal(3),
            z.literal(4),
            z.literal(5),
            z.literal(6),
          ]),
          startTime: z.string().transform((value) => {
            if (!value) return null;
            const time = timeStringToInt(value);
            return time;
          }),
          endTime: z.string().transform((value) => {
            if (!value) return null;
            const time = timeStringToInt(value);
            return time;
          }),
          dayOff: z.boolean().default(false),
          lunchStart: z
            .string()
            .optional()
            .transform((value) => {
              if (!value) return null;
              return timeStringToInt(value);
            }),
          lunchEnd: z
            .string()
            .optional()
            .transform((value) => {
              if (!value) return null;
              return timeStringToInt(value);
            }),
        })
        .refine(
          (shift) => {
            const startTime = shift.startTime;
            const endTime = shift.endTime;
            if (shift.dayOff) return true;
            if (startTime == null && endTime == null) return false;
            return true;
          },
          {
            message: 'Please fill out the shift hours',
          },
        )
        .refine(
          (shift) => {
            const lunchStart = shift.lunchStart;
            const lunchEnd = shift.lunchEnd;
            if (
              (lunchStart != null && lunchEnd == null) ||
              (lunchStart == null && lunchEnd != null)
            ) {
              return false;
            }
            return true;
          },
          {
            message: 'Please enter a lunch start and end time',
          },
        )
        .refine(
          ({ lunchStart, lunchEnd }) => {
            if (
              lunchEnd != null &&
              lunchStart != null &&
              lunchEnd <= lunchStart
            ) {
              return false;
            }
            return true;
          },
          {
            message: 'Lunch end time cannot be before lunch start time',
          },
        )
        .refine(
          ({ startTime, endTime }) => {
            if (startTime != null && endTime != null && startTime >= endTime) {
              return false;
            }

            return true;
          },
          {
            message: 'Shift end time cannot be before shift start time',
          },
        )
        .refine(
          (shift) => {
            const dayOff = shift.dayOff;
            const startTime = shift.startTime;
            const endTime = shift.endTime;
            if (!dayOff && startTime == null && endTime == null) {
              return false;
            }
            return true;
          },
          {
            message: 'Shifts must have start and end time',
          },
        )
        .refine(
          ({ startTime, endTime, lunchStart, lunchEnd }) => {
            if (lunchStart == null) return true;
            if (lunchEnd == null) return true;
            if (startTime == null) return true;
            if (endTime == null) return true;

            if (lunchStart >= startTime && lunchEnd < endTime) {
              return true;
            }
            return false;
          },
          {
            message: 'Lunch break must be between shift start and end time',
          },
        ),
    )
    .default([]),
});

const week = eachDayOfInterval({
  start: startOfWeek(new Date()),
  end: endOfWeek(new Date()),
});

const defaultShifts = week.map((_, idx) => ({
  day: idx as 0 | 1 | 2 | 3 | 4 | 5 | 6,
  startTime: '',
  endTime: '',
  lunchStart: '',
  lunchEnd: '',
  durationInMinutes: 0,
  numOfBreaks: 0,
  breakDurationInMinutes: 0,
  dayOff: false,
}));

export function EmployeePositionAndShiftsForm({
  employee,
  onSuccess,
}: EmployeePositionAndShiftsFormProps) {
  const {
    data: user,
    isPending: isUserPending,
    error: userError,
  } = useQuery(convexQuery(api.users.getUser, {}));
  const {
    data: businessHours = [],
    isPending: businessHoursPending,
    error: businessHoursError,
  } = useQuery(convexQuery(api.businessHours.getBusinessHours, {}));
  const {
    data: shifts = [],
    isPending: isShiftsPending,
    error: shiftsError,
  } = useQuery(convexQuery(api.shifts.getShifts, { employeeId: employee._id }));
  const {
    data: positions = [],
    isPending: isPositionsPending,
    error: positionsError,
  } = useQuery(convexQuery(api.roles.getRoles, {}));
  const updateEmployee = useMutation(api.employees.updateEmployee);
  const mutateShifts = useMutation(api.shifts.mutateShifts);
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(employeePositionAndShiftsSchema),
    defaultValues: {
      positionId: employee.positionId,
      shifts: defaultShifts,
    },
  });

  const watch = useWatch(form);

  const shiftFields = useFieldArray({
    control: form.control,
    name: 'shifts',
  });

  useEffect(() => {
    if (shifts.length) {
      form.setValue(
        'shifts',
        shifts.map((shift) => ({
          ...shift,
          startTime: shift.startTime ? intToTimeString(shift.startTime) : '',
          endTime: shift.endTime ? intToTimeString(shift.endTime) : '',
          lunchStart:
            shift.lunchStart != null ? intToTimeString(shift.lunchStart) : '',
          lunchEnd:
            shift.lunchEnd != null ? intToTimeString(shift.lunchEnd) : '',
        })),
      );
    }
  }, [shifts]);

  const onSubmit = (
    values: z.infer<typeof employeePositionAndShiftsSchema>,
  ) => {
    updateEmployee({
      _id: employee._id,
      positionId: values.positionId as Id<'roles'>,
    })
      .then(() => {
        mutateShifts({
          employeeId: employee._id,
          shifts: values.shifts as Doc<'shifts'>[],
        });
      })
      .then(() => {
        onSuccess();
      });
  };

  if (
    isUserPending ||
    isShiftsPending ||
    isPositionsPending ||
    businessHoursPending
  ) {
    return <Loader />;
  }

  if (userError || shiftsError || positionsError || businessHoursError) {
    return <div>Something went wrong</div>;
  }

  const shiftErrors = new Set<string>();

  if (form.formState.errors.shifts instanceof Array) {
    form.formState.errors.shifts.map((shift) =>
      shiftErrors.add(shift!.message),
    );
  }

  return (
    <Form {...form}>
      <form className='space-y-6' onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name='positionId'
          render={({ field }) => {
            return (
              <FormItem>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      role='combobox'
                      aria-expanded={open}
                      className='w-48 justify-between'
                    >
                      {field.value
                        ? positions.find(
                            (position) => position._id === field.value,
                          )?.name
                        : 'Select position...'}
                      <ChevronsUpDownIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-48 p-0'>
                    <Command>
                      <CommandInput placeholder='Search position...' />
                      <CommandList>
                        <CommandEmpty>No Positions found</CommandEmpty>
                        <CommandGroup>
                          {positions.map((position) => (
                            <CommandItem
                              key={position._id}
                              value={position._id}
                              onSelect={(positionId) => {
                                field.onChange(
                                  positionId === field.value ? '' : positionId,
                                );
                                setOpen(false);
                              }}
                            >
                              <CheckIcon
                                className={cx(
                                  'mr-2 h-4 w-4',
                                  field.value === position._id
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                              {position.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormItem>
            );
          }}
        />
        <div className='flex gap-6'>
          {shiftFields.fields.map((shift, idx) => {
            const businessHour = businessHours[idx];
            return (
              <div key={shift.id} className='flex flex-1 flex-col gap-2'>
                <h3 className='text-xl font-medium'>
                  {Intl.DateTimeFormat(user?.language?.value ?? 'en-US', {
                    weekday: 'short',
                  }).format(week[shift.day])}
                </h3>
                <FormField
                  control={form.control}
                  name={`shifts.${idx}.dayOff`}
                  render={({ field }) => (
                    <FormItem className='mb-4'>
                      <FormLabel
                        htmlFor={field.name}
                        className='text-gray-500 flex gap-2'
                      >
                        <span>Day off?</span>
                        <Checkbox
                          id={field.name}
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                          }}
                          disabled={businessHour.isClosed}
                        />
                      </FormLabel>
                    </FormItem>
                  )}
                />

                {watch.shifts?.[idx].dayOff ? null : (
                  <>
                    <FormField
                      control={form.control}
                      name={`shifts.${idx}.startTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            htmlFor={field.name}
                            className='text-gray-500'
                          >
                            Shift Start
                          </FormLabel>
                          <FormControl>
                            <Input
                              type='time'
                              id={field.name}
                              disabled={watch.shifts![idx].dayOff}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`shifts.${idx}.endTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            htmlFor={field.name}
                            className='text-gray-500'
                          >
                            Shift End
                          </FormLabel>
                          <FormControl>
                            <Input
                              type='time'
                              id={field.name}
                              disabled={watch.shifts![idx].dayOff}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className='my-4' />
                    <FormField
                      control={form.control}
                      name={`shifts.${idx}.lunchStart`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            htmlFor={field.name}
                            className='text-gray-500'
                          >
                            Lunch Start
                          </FormLabel>
                          <FormControl>
                            <Input
                              type='time'
                              id={field.name}
                              disabled={watch.shifts![idx].dayOff}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`shifts.${idx}.lunchEnd`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            htmlFor={field.name}
                            className='text-gray-500'
                          >
                            Lunch End
                          </FormLabel>
                          <FormControl>
                            <Input
                              type='time'
                              id={field.name}
                              disabled={watch.shifts![idx].dayOff}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
        <div className='text-red-400'>
          {Array.from(shiftErrors).map((m, i) => (
            <div key={i}>{m}</div>
          ))}
        </div>
        <Button type='submit' className='w-full uppercase'>
          Save
        </Button>
      </form>
    </Form>
  );
}
