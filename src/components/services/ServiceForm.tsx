import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
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
import { Id } from 'convex/_generated/dataModel';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { Combobox } from '../ui/combobox';
import { FunctionReturnType } from 'convex/server';
import { XIcon } from 'lucide-react';

interface ServiceFormProps {
  service?: FunctionReturnType<typeof api.services.getServices>[number];
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
  media: z.array(z.instanceof(File)).default([]),
});

export function ServiceForm({ service, onSuccess }: ServiceFormProps) {
  const mutateService = useMutation(api.services.mutateService);
  const mutateCategory = useMutation(api.category.mutateCategory);
  const deleteStorageMedia = useMutation(api.media.deleteStorage);
  const deleteMedia = useMutation(api.media.deleteMedia);
  const {
    data: categories = [],
    isPending: isCategoriesPending,
    error: categoriesError,
  } = useQuery(convexQuery(api.category.getCategories, {}));
  const [cats, setCats] = useState<
    { value: string; displayName: string; active: boolean }[]
  >([]);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

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
      media: [],
    },
  });

  const watchForm = useWatch(form);
  const formMedia = watchForm.media;

  const onSubmit = async (values: z.infer<typeof serviceFormSchema>) => {
    const formData = new FormData();
    if (values.media.length) {
      for (const file of values.media) {
        formData.append('files[]', file);
      }
    }

    // don't set content-type
    try {
      // upload media in the bg
      fetch('/api/media', {
        method: 'POST',
        body: formData,
      })
        .then((res) => res.json())
        .then((data: { mediaIds: Id<'media'>[] }) => {
          const mediaIds = data.mediaIds;
          mutateService({
            _id: service!._id,
            mediaIds: [...(service?.mediaIds ?? []), ...mediaIds],
          });
        });

      await mutateService({
        _id: service?._id,
        name: values.name,
        description: values.description,
        price: parseFloat(values.price),
        categoryIds: cats
          .filter((c) => c.active)
          .map((c) => c.value as Id<'categories'>),
      }).then(() => onSuccess());
    } catch (err) {
      console.log(err);
    }
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
        <div className='my-8 flex flex-wrap gap-5'>
          {service?.media
            .filter((m) => m.fileName.includes('small'))
            .map((m) => (
              <div key={m._id} className='relative size-32'>
                <img
                  src={m.url}
                  className='max-w-full h-full w-full object-cover rounded-md'
                />
                <Button
                  size='icon'
                  className='absolute -top-4 -right-4 rounded-full z-10'
                  onClick={(e) => {
                    e.preventDefault();
                    const media = service.media.filter((sm) =>
                      sm.fileName.startsWith(
                        m.fileName.replace(/_thumbnail.*/, ''),
                      ),
                    );
                    for (const med of media) {
                      if (med._id) {
                        deleteStorageMedia({ storageId: med.storageId });
                        deleteMedia({ _id: med._id });
                      }
                    }

                    mutateService({
                      _id: service._id,
                      name: service.name,
                      price: service.price,
                      mediaIds: service.media
                        .filter(
                          (sm) =>
                            !sm.fileName.startsWith(
                              m.fileName.replace(/_thumbnail.*/, ''),
                            ),
                        )
                        .map((m) => m._id),
                    });
                  }}
                >
                  <XIcon />
                </Button>
              </div>
            ))}
          {formMedia!.map((media) => {
            const blob = URL.createObjectURL(media);
            return (
              <div key={media.name} className='relative size-32'>
                <img
                  src={blob}
                  className='max-w-full h-full w-full object-cover rounded-md'
                />
                <Button
                  size='icon'
                  className='absolute -top-4 -right-4 rounded-full z-10'
                  onClick={(e) => {
                    e.preventDefault();
                    form.setValue(
                      'media',
                      formMedia!.filter((m) => m.name !== media.name),
                    );
                  }}
                >
                  <XIcon />
                </Button>
              </div>
            );
          })}
        </div>
        <FormField
          control={form.control}
          name='media'
          render={() => (
            <FormItem>
              <Button
                className='w-fit'
                type='button'
                onClick={(e) => {
                  e.preventDefault();
                  imageInputRef.current?.click();
                }}
              >
                Upload Images
              </Button>
              <FormControl>
                <Input
                  ref={imageInputRef}
                  type='file'
                  accept='image/jpeg,image/jpg,image/png,image/avif,image/webp'
                  multiple
                  className='hidden'
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (!files) {
                      return;
                    }
                    const currentMedia = form.getValues('media') ?? [];
                    const uniqueMedia = [...files].filter((file) => {
                      const foundMedia = currentMedia.find(
                        (m) => m.name === file.name,
                      );
                      if (foundMedia) return false;
                      return true;
                    });
                    form.setValue('media', [...currentMedia, ...uniqueMedia]);
                  }}
                />
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
