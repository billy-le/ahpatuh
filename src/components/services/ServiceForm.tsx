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
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Button } from '~/components/ui/button';
import { useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
import { Doc, Id } from 'convex/_generated/dataModel';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { Combobox } from '../ui/combobox';

interface ServiceFormProps {
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

export function ServiceForm({ service, onSuccess }: ServiceFormProps) {
  const mutateService = useMutation(api.services.mutateService);
  const mutateCategory = useMutation(api.category.mutateCategory);
  const {
    data: categories = [],
    isPending: isCategoriesPending,
    error: categoriesError,
  } = useQuery(convexQuery(api.category.getCategories, {}));
  const [cats, setCats] = useState<
    { value: string; displayName: string; active: boolean }[]
  >([]);

  useEffect(() => {
    setCats(
      categories.map((c) => ({
        value: c._id,
        displayName: c.name,
        active:
          !!cats.find((cat) => cat.active && cat.value === c._id) ||
          !!service?.categoryIds?.includes(c._id),
      })),
    );
  }, [categories]);

  const form = useForm({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      _id: service?._id,
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
      categoryIds: cats
        .filter((c) => c.active)
        .map((c) => c.value as Id<'categories'>),
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
        <Combobox
          emptySelectionString='Assign Categories'
          data={cats}
          onChange={(data) => {
            setCats(data);
          }}
          addHandler={(value) => {
            mutateCategory({
              name: value,
            });
          }}
          placeholder='Search categories'
          emptyString='No categories found'
          disabled={isCategoriesPending || !!categoriesError}
        />
        <Button>Save</Button>
      </form>
    </Form>
  );
}
