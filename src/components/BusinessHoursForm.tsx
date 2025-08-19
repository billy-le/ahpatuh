import { Id } from 'convex/_generated/dataModel';
import { endOfWeek, startOfWeek, eachDayOfInterval } from 'date-fns';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '~/components/ui/form';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
import { createBusinessHours } from 'convex/businessHours';
interface BusinessHoursFormProps {
  businessId: Id<'businesses'>;
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

export function BusinessHoursForm({
  businessId,
  onSuccess,
}: BusinessHoursFormProps) {
  const createBusinessHours = useMutation(
    api.businessHours.createBusinessHours,
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
      dayOfWeek: businessHour.dayOfWeek.getDay(),
    }));
    await createBusinessHours({ businessId, businessHours: data }).then(
      (data) => {
        onSuccess(data);
      },
    );
  };

  return (
    <Form {...form}>
      <form
        className='max-w-2xl mx-auto p-4 border border-slate-300 rounded-md'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {fields.map((field, index) => {
          return (
            <div
              key={field.id}
              className='flex items-center gap-4 whitespace-nowrap'
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
                  <>
                    <FormLabel htmlFor={`businessHours.${index}.timeOpen`}>
                      Open
                    </FormLabel>
                    <Input
                      id={`businessHours.${index}.timeOpen`}
                      type='time'
                      {...field}
                    />
                  </>
                )}
              />
              <FormField
                control={form.control}
                name={`businessHours.${index}.timeClose`}
                render={({ field }) => (
                  <>
                    <FormLabel htmlFor={`businessHours.${index}.timeClose`}>
                      Close
                    </FormLabel>
                    <Input
                      id={`businessHours.${index}.timeClose`}
                      type='time'
                      {...field}
                    />
                  </>
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
