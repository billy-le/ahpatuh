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

interface BusinessFormProps {
  onSuccess: (businessId: Id<'businesses'>) => void;
}

const formSchema = z.object({
  name: z.string(),
  email: z.email().optional(),
  phone: z.string().optional(),
  domain: z.url().optional(),
});

export function BusinessForm({ onSuccess }: BusinessFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });
  const createBusiness = useMutation(api.business.createBusiness);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createBusiness(values).then((businessId) => {
      onSuccess(businessId);
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
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
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
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='domain'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
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
