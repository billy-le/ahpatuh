import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  Button,
} from '@ahpatuh/ui';
import { useMutation } from 'convex/react';
import { api } from '@ahpatuh/convex/_generated/api';
import { Doc } from '@ahpatuh/convex/_generated/dataModel';

interface QuickAddServiceFormProps {
  service?: Doc<'services'>;
  onSuccess: () => void;
}

const serviceFormSchema = z.object({
  _id: z.string().optional(),
  name: z.string().nonempty(),
  description: z.string().optional(),
  price: z
    .string()
    .nonempty()
    .refine((value) => !isNaN(parseFloat(value)), {
      message: 'Price must be a number',
    }),
});

export function QuickAddServiceForm({
  service,
  onSuccess,
}: QuickAddServiceFormProps) {
  const mutateService = useMutation(api.services.mutateService);
  const form = useForm({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: service?.name ?? '',
      description: service?.description,
      price: service?.price?.toString() ?? '',
    },
  });

  const onSubmit = async (values: z.infer<typeof serviceFormSchema>) => {
    await mutateService({
      ...values,
      _id: service?._id,
      price: parseFloat(values.price),
      categoryIds: [],
    }).then(() => onSuccess());
  };

  return (
    <Form {...form}>
      <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='Name of service' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='price'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button>Save</Button>
      </form>
    </Form>
  );
}
