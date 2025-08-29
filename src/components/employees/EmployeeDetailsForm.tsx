import { Doc } from 'convex/_generated/dataModel';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '~/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';

interface EmployeeDetailsFormProps {
  employee: Doc<'employees'>;
  onSuccess: () => void;
}
const employeeDetailsSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.email().optional(),
  phone: z.e164().optional(),
  hiredDate: z.string().optional(),
  isActive: z.boolean(),
  isBookable: z.boolean(),
  positionId: z.string().optional(),
  shiftIds: z.array(z.string()),
});

export function EmployeeDetailsForm({
  employee,
  onSuccess,
}: EmployeeDetailsFormProps) {
  const updateEmployee = useMutation(api.employees.updateEmployee);

  const form = useForm({
    resolver: zodResolver(employeeDetailsSchema),
    defaultValues: {
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      hiredDate: employee.hiredDate,
      isActive: employee.isActive,
      isBookable: employee.isBookable,
    },
  });

  const onSubmit = ({
    firstName,
    lastName,
    email,
    phone,
    hiredDate,
    isActive,
    isBookable,
  }: z.infer<typeof employeeDetailsSchema>) => {
    updateEmployee({
      _id: employee._id,
      firstName,
      lastName,
      email,
      phone,
      hiredDate,
      isActive,
      isBookable,
    }).then(() => {
      onSuccess();
    });
  };
  return (
    <Form {...form}>
      <form className='space-y-4'>
        <FormField
          control={form.control}
          name='firstName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
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
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex gap-8 items-center justify-between'>
          <FormField
            control={form.control}
            name='hiredDate'
            render={({ field }) => (
              <FormItem className='grow'>
                <FormLabel>Hired Date</FormLabel>
                <FormControl>
                  <Input type='date' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='grow flex justify-end gap-8 mt-6'>
            <FormField
              control={form.control}
              name='isActive'
              render={({ field }) => (
                <FormItem className='flex items-center gap-2'>
                  <FormLabel>Active</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='isBookable'
              render={({ field }) => (
                <FormItem className='flex items-center gap-2'>
                  <FormLabel>Bookable?</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <Button
          type='submit'
          onClick={(e) => {
            e.preventDefault();
            onSubmit(form.getValues());
          }}
        >
          Save
        </Button>
      </form>
    </Form>
  );
}
