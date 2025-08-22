import { useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from './ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
import { Checkbox } from '~/components/ui/checkbox';

interface QuickAddEmployeeFormProps {
  onSuccess: (open: boolean) => void;
}

const formSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  isActive: z.boolean().default(true),
  isBookable: z.boolean().default(true),
});

export function QuickAddEmployeeForm({ onSuccess }: QuickAddEmployeeFormProps) {
  const createEmployee = useMutation(api.employees.createEmployee);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      isBookable: true,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createEmployee(values).then(() => {
      onSuccess(false);
    });
  };

  return (
    <Form {...form}>
      <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name='firstName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>First name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='lastName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='isBookable'
          render={({ field }) => (
            <FormItem className='flex items-center gap-4'>
              <FormLabel>Bookable?</FormLabel>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type='submit' className='w-full'>
          Add
        </Button>
      </form>
    </Form>
  );
}
