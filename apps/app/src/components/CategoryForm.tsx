import { zodResolver } from '@hookform/resolvers/zod';
import { api } from 'convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';
import { useForm } from 'react-hook-form';
import z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
  Input,
  Button,
  Textarea,
} from '@ahpatuh/ui';
import { useMutation } from 'convex/react';
import { Id } from 'convex/_generated/dataModel';

interface CategoryFormProps {
  category?: FunctionReturnType<typeof api.category.getCategories>[number];
  onSuccess: () => void;
}
const categoryFormSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
});
export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const mutateCategory = useMutation(api.category.mutateCategory);
  const form = useForm({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      ...category,
    },
  });

  const onSubmit = async (values: z.infer<typeof categoryFormSchema>) => {
    await mutateCategory({
      _id: values._id as Id<'categories'>,
      name: values.name,
      description: values.description,
    }).then(() => {
      onSuccess();
    });
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
                <Input {...field} />
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
        <Button type='submit'>{category ? 'Save' : 'Create'}</Button>
      </form>
    </Form>
  );
}
