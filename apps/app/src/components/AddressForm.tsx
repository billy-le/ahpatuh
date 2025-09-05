import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@ahpatuh/ui';
import { useMutation } from 'convex/react';
import { api } from '@ahpatuh/convex/_generated/api';
import { Id } from '@ahpatuh/convex/_generated/dataModel';

interface AddressFormProps {
  onSuccess: (addressId: Id<'addresses'>) => void;
}

const formSchema = z.object({
  street1: z.string(),
  street2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  postalCode: z.string(),
});

export function AddressForm({ onSuccess }: AddressFormProps) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      street1: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    },
  });

  const mutateAddress = useMutation(api.address.mutateAddress);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await mutateAddress(values).then((addressId) => {
      if (addressId) onSuccess(addressId);
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='max-w-md mx-auto border border-slate-200 p-4 rounded-md space-y-8'
      >
        <h2 className='text-2xl font-medium'>Business Details</h2>
        <FormField
          control={form.control}
          name='street1'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street 1</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='street2'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street 2</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='city'
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='state'
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='country'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='postalCode'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal Code</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit'>Submit</Button>
      </form>
    </Form>
  );
}
