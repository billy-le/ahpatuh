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
import { useConvex, useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
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
  const mutateServiceMedia = useMutation(api.serviceMedia.mutateServiceMedia);
  const deleteServiceMedia = useMutation(api.serviceMedia.deleteServiceMedia);
  const deleteMedia = useMutation(api.media.deleteMedia);
  const convex = useConvex();
  const {
    data: categories = [],
    isPending: isCategoriesPending,
    error: categoriesError,
  } = useQuery(convexQuery(api.category.getCategories, {}));
  const [selectedCategories, setSelectedCategories] = useState<
    typeof categories
  >([]);
  const [storageMedia, setStorageMedia] = useState(service?.media ?? []);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const categoriesLoadedRef = useRef(false);

  useEffect(() => {
    if (!isCategoriesPending && !categoriesLoadedRef.current) {
      setSelectedCategories(service?.categories ?? []);
      categoriesLoadedRef.current = true;
    }
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
    const removedMedia =
      service?.media?.filter(
        (media) => !storageMedia.find((sm) => sm._id === media._id),
      ) ?? [];
    const serviceMedia = await Promise.all(
      removedMedia.map((media) => {
        return convex.query(api.serviceMedia.getServiceMedia, {
          mediaId: media._id,
        });
      }),
    ).then((res) => res.flat());
    await Promise.all(
      serviceMedia.map((serviceMedia) =>
        deleteServiceMedia({ _id: serviceMedia._id }),
      ),
    );
    await Promise.all(
      removedMedia.map((media) => deleteMedia({ _id: media._id })),
    );

    try {
      const serviceId = await mutateService({
        _id: service?._id,
        name: values.name,
        description: values.description,
        price: parseFloat(values.price),
        categoryIds: selectedCategories.map((c) => c._id),
      });
      if (serviceId) {
        const formData = new FormData();
        if (values.media.length) {
          for (const file of values.media) {
            formData.append('files[]', file);
          }
        }
        // dont await. don't add content-type in headers, browser will set
        fetch('/api/media', {
          method: 'POST',
          body: formData,
        }).then(async (res) => {
          const data: {
            mediaIds: FunctionReturnType<typeof api.media.mutateMedia>[];
          } = await res.json();
          Promise.all(
            data.mediaIds.map((mId) =>
              mutateServiceMedia({ serviceId, mediaId: mId! }),
            ),
          );
        });

        onSuccess();
      }
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
          data={categories.map((category) => ({
            value: category._id,
            displayName: category.name,
            active: !!selectedCategories.find((c) => c._id === category._id),
          }))}
          onChange={(data) => {
            const selected = categories.filter((category) =>
              data.find((d) => d.active && d.value === category._id),
            );
            setSelectedCategories(selected);
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
          {storageMedia.map((media) => {
            const variants = media.variants;

            return variants
              .filter((variant) => variant.fileName.includes('thumbnail'))
              .map((variant) => (
                <div key={variant._id} className='relative size-32'>
                  <img
                    src={variant.url}
                    className='max-w-full h-full w-full object-cover rounded-md'
                  />
                  <Button
                    size='icon'
                    className='absolute -top-4 -right-4 rounded-full z-10'
                    onClick={async (e) => {
                      e.preventDefault();
                      setStorageMedia((storageMedia) =>
                        storageMedia.filter((m) => m._id !== media._id),
                      );
                    }}
                  >
                    <XIcon />
                  </Button>
                </div>
              ));
          })}
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
        <Button>Save</Button>
      </form>
    </Form>
  );
}
