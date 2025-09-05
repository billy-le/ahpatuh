import { Id } from '@ahpatuh/convex/_generated/dataModel';
import { endOfWeek, startOfWeek, eachDayOfInterval } from 'date-fns';
import {
  Form,
  FormField,
  FormLabel,
  Input,
  Checkbox,
  Button,
} from '@ahpatuh/ui';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { api } from '@ahpatuh/convex/_generated/api';

interface BusinessHoursFormProps {
  onSuccess: (businessHours: Id<'businessHours'>[]) => void;
}

const formSchema = z.object({
  businessHours: z.array(
    z.object({
      dayOfWeek: z.date(),
      timeOpen: z.string().optional(),
      timeClose: z.string().optional(),
      isClosed: z.boolean().default(false),
    }),
  ),
});
const weekDays = eachDayOfInterval({
  start: startOfWeek(new Date()),
  end: endOfWeek(new Date()),
});

export function BusinessHoursForm({ onSuccess }: BusinessHoursFormProps) {
  const mutateBusinessHours = useMutation(
    api.businessHours.mutateBusinessHours,
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessHours: weekDays.map((day) => ({
        dayOfWeek: day,
        timeOpen: '',
        timeClose: '',
        isClosed: false,
      })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'businessHours',
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const data = values.businessHours.map((businessHour) => ({
      ...businessHour,
      dayOfWeek: businessHour.dayOfWeek.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6,
    }));

    await mutateBusinessHours({ businessHours: data }).then((data) => {
      if (data) onSuccess(data);
    });
  };

  return (
    <Form {...form}>
      <form
        className='max-w-4xl mx-auto p-8 space-y-4 border border-slate-300 rounded-md'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <h1 className='text-3xl font-medium mb-10'>Business Hours</h1>
        {fields.map((field, index) => {
          return (
            <div
              key={field.id}
              className='grid grid-cols-4 items-center gap-8 whitespace-nowrap'
            >
              <h1>
                {Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(
                  field.dayOfWeek,
                )}
              </h1>
              <FormField
                control={form.control}
                name={`businessHours.${index}.timeOpen`}
                render={({ field }) => (
                  <div className='flex gap-2'>
                    <FormLabel htmlFor={`businessHours.${index}.timeOpen`}>
                      Open
                    </FormLabel>
                    <Input
                      id={`businessHours.${index}.timeOpen`}
                      type='time'
                      {...field}
                    />
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name={`businessHours.${index}.timeClose`}
                render={({ field }) => (
                  <div className='flex gap-2'>
                    <FormLabel htmlFor={`businessHours.${index}.timeClose`}>
                      Close
                    </FormLabel>
                    <Input
                      id={`businessHours.${index}.timeClose`}
                      type='time'
                      {...field}
                    />
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name={`businessHours.${index}.isClosed`}
                render={({ field }) => (
                  <FormLabel htmlFor={`businessHours.${index}.isClosed`}>
                    Closed
                    <Checkbox
                      id={`businessHours.${index}.isClosed`}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                      }}
                      checked={field.value}
                    />
                  </FormLabel>
                )}
              />
            </div>
          );
        })}
        <Button type='submit'>Save</Button>
      </form>
    </Form>
  );
}
