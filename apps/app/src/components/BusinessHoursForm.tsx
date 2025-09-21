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
import { timeStringToInt } from '@ahpatuh/utils';

interface BusinessHoursFormProps {
  onSuccess: (businessHours: Id<'businessHours'>[]) => void;
}

const formSchema = z.object({
  businessHours: z.array(
    z
      .object({
        dayOfWeek: z.date(),
        timeOpen: z
          .string({ message: 'Open time is required' })
          .transform((value) => {
            if (!value) return null;
            const intTime = timeStringToInt(value);
            return intTime;
          }),
        timeClose: z
          .string({ message: 'Close time is required' })
          .transform((value) => {
            if (!value) return null;
            const intTime = timeStringToInt(value);
            return intTime;
          }),
        isClosed: z.boolean().default(false),
      })
      .refine(
        (bh) => {
          if (bh.isClosed) return true;
          if (bh.timeOpen == null) return false;
          if (bh.timeClose == null) return false;
          return true;
        },
        {
          message: 'Please enter opening and closing hours',
        },
      )
      .refine(
        (bh) => {
          if (bh.isClosed) return true;
          if (bh.timeOpen == null) return false;
          if (bh.timeClose == null) return false;
          if (bh.timeClose <= bh.timeOpen) {
            return false;
          }
          return true;
        },
        { message: 'Close time must be after open time' },
      ),
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

  const businessHoursErrors = new Set<string>();
  if (form.formState.errors.businessHours instanceof Array) {
    form.formState.errors.businessHours.forEach((bh) => {
      businessHoursErrors.add(bh.message);
    });
  }

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
              {form.watch(`businessHours.${index}.isClosed`) ? null : (
                <>
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
                </>
              )}
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
        {Array.from(businessHoursErrors).map((err, i) => (
          <div key={i} className='text-red-500'>
            {err}
          </div>
        ))}
        <Button type='submit'>Save</Button>
      </form>
    </Form>
  );
}
