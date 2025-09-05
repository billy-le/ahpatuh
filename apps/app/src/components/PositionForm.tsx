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

interface PositionFormProps {
  position?: FunctionReturnType<typeof api.roles.getRoles>[number];
  onSuccess: () => void;
}
const positionFormSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
});
export function PositionForm({ position, onSuccess }: PositionFormProps) {
  const mutatePosition = useMutation(api.roles.mutateRole);
  const form = useForm({
    resolver: zodResolver(positionFormSchema),
    defaultValues: {
      ...position,
    },
  });

  const onSubmit = async (values: z.infer<typeof positionFormSchema>) => {
    await mutatePosition({
      _id: values._id as Id<'roles'>,
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
        <Button type='submit'>{position ? 'Save' : 'Create'}</Button>
      </form>
    </Form>
  );
}
