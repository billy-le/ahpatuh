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
import { Doc, Id } from 'convex/_generated/dataModel';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';
import { useEffect, useState } from 'react';
import { ChevronsUpDownIcon, CheckIcon } from 'lucide-react';
import { cx } from '@ahpatuh/utils';
import {
  eachDayOfInterval,
  endOfWeek,
  startOfWeek,
  parse as dateParser,
  isValid,
} from 'date-fns';
import { useMutation } from 'convex/react';

interface EmployeePositionAndShiftsFormProps {
  employee: Doc<'employees'>;
  onSuccess: () => void;
}

const employeePositionAndShiftsSchema = z.object({
  positionId: z.string().optional(),
  shifts: z
    .array(
      z.object({
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
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        durationInMinutes: z.int().optional(),
        numOfBreaks: z.int().optional(),
        breakDurationInMinutes: z.int().optional(),
        dayOff: z.boolean().default(false),
      }),
    )
    .default([])
    .refine(
      (shifts) => {
        let noError = true;
        for (let i = 0; i < shifts.length; i++) {
          const shift = shifts[i];
          const dayOff = shift.dayOff;
          const startTime = dateParser(shift.startTime!, 'HH:mm', new Date());
          const endTime = dateParser(shift.endTime!, 'HH:mm', new Date());

          if (!dayOff && (!isValid(startTime) || !isValid(endTime))) {
            noError = false;
          }
        }
        return noError;
      },
      {
        message: 'Work days must have shift start and end time',
        path: ['shifts'],
      },
    ),
});

const week = eachDayOfInterval({
  start: startOfWeek(new Date()),
  end: endOfWeek(new Date()),
});

const defaultShifts = week.map((_, idx) => ({
  day: idx as 0 | 1 | 2 | 3 | 4 | 5 | 6,
  startTime: '',
  endTime: '',
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
      form.setValue('shifts', shifts);
    }
  }, [shifts]);

  const onSubmit = (
    values: z.infer<typeof employeePositionAndShiftsSchema>,
  ) => {
    Promise.all([
      updateEmployee({
        _id: employee._id,
        positionId: values.positionId as Id<'roles'>,
      }),
      mutateShifts({
        employeeId: employee._id,
        shifts: values.shifts as Doc<'shifts'>[],
      }),
    ]).then(() => {
      onSuccess();
    });
  };

  if (isUserPending || isShiftsPending || isPositionsPending) {
    return <Loader />;
  }

  if (userError || shiftsError || positionsError) {
    return <div>Something went wrong</div>;
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
            return (
              <div key={shift.id} className='flex flex-col gap-2'>
                <h3 className='text-xl font-medium'>
                  {Intl.DateTimeFormat(user?.language?.value ?? 'en-US', {
                    weekday: 'short',
                  }).format(week[shift.day])}
                </h3>
                <FormField
                  control={form.control}
                  name={`shifts.${idx}.startTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={field.name} className='text-gray-500'>
                        Start
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
                      <FormLabel htmlFor={field.name} className='text-gray-500'>
                        End
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
                  name={`shifts.${idx}.dayOff`}
                  render={({ field }) => (
                    <FormItem>
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
                        />
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            );
          })}
        </div>
        <div className='text-red-400'>
          {
            (
              form.formState.errors?.shifts as unknown as {
                shifts?: { message: string };
              }
            )?.shifts?.message
          }
        </div>
        <Button type='submit'>Save</Button>
      </form>
    </Form>
  );
}
