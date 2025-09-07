import { api } from '@ahpatuh/convex/_generated/api';
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormMessage,
  FormLabel,
  Card,
  Input,
  Button,
} from '@ahpatuh/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { FunctionReturnType } from 'convex/server';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { LangSelector } from './LangSelector';
import { useMutation } from 'convex/react';
import { CameraIcon, UserIcon } from 'lucide-react';
import { useRef } from 'react';
import { Id } from '@ahpatuh/convex/_generated/dataModel';

interface UserProfileFormProps {
  user: FunctionReturnType<typeof api.users.getUser>;
}

const userProfileForm = z.object({
  name: z.string(),
  email: z.email(),
  langId: z.string().optional(),
  phone: z.string().optional(),
  timeZone: z.string().optional(),
  mediaUrl: z.url().optional(),
  imageFile: z.instanceof(File).optional(),
});

export function UserProfileForm({ user }: UserProfileFormProps) {
  const avatarRef = useRef<HTMLInputElement | null>(null);
  const updateUser = useMutation(api.users.updateUser);
  const {
    data: languages = [],
    isPending: isLanguagesPending,
    error: languagesError,
  } = useQuery(convexQuery(api.languages.getLanguages, {}));

  const avatarUrl = user.avatar?.variants?.find((v) =>
    v.fileName.includes('_small'),
  )?.url;

  const form = useForm({
    resolver: zodResolver(userProfileForm),
    defaultValues: {
      name: user.name,
      email: user.email,
      langId: user.langId,
      phone: user.phone,
      timeZone: user.timeZone,
      mediaUrl: avatarUrl,
    },
  });

  const onSubmit = async (values: z.infer<typeof userProfileForm>) => {
    if (values.mediaUrl && values.mediaUrl !== avatarUrl) {
      const file = await fetch(values.mediaUrl!)
        .then((res) => res.blob())
        .then(
          (blob) =>
            new File([blob], values.imageFile!.name, {
              type: values.imageFile!.type,
            }),
        );
      const formData = new FormData();
      formData.append('files[]', file);

      await fetch('/api/media', {
        method: 'POST',
        body: formData,
      }).then(async (res) => {
        const data: {
          mediaIds: FunctionReturnType<typeof api.media.mutateMedia>[];
        } = await res.json();
        const mediaId = data.mediaIds[0]!;
        return await updateUser({
          mediaId,
        });
      });
    }
    await updateUser({
      name: values.name,
      email: values.email,
      phone: values.phone,
      langId: values.langId as Id<'languages'>,
    });
  };

  return (
    <Card className='p-6 max-w-sm mx-auto'>
      <Form {...form}>
        <form className='space-y-6' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='relative mx-auto size-40'>
            {form.watch('mediaUrl') ? (
              <img
                src={form.watch('mediaUrl')}
                className='block h-full w-full rounded-full object-cover'
              />
            ) : (
              <div className='h-full w-full rounded-full bg-apt-hot-pink grid place-items-center'>
                <UserIcon size={80} />
              </div>
            )}
            <input
              ref={avatarRef}
              className='hidden'
              type='file'
              hidden
              aria-hidden
              accept='image/png,image/jpg,image/jpeg,image/avig,iamge/webp'
              onChange={(e) => {
                const files = e.target.files;
                if (files?.length) {
                  const file = files[0];
                  const imageUrl = URL.createObjectURL(file);
                  form.setValue('mediaUrl', imageUrl);
                  form.setValue('imageFile', file);
                }
              }}
            />
            <Button
              size='icon'
              className='size-10 rounded-full absolute bottom-0 right-0'
              onClick={() => {
                avatarRef.current!.click();
              }}
            >
              <CameraIcon />
            </Button>
          </div>
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
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <LangSelector
              defaultLang={user?.language}
              langs={languages}
              onLangChange={(lang) => {
                form.setValue('langId', lang._id);
              }}
              disabled={isLanguagesPending || !!languagesError}
            />
          </div>
          <Button type='submit'>Save</Button>
        </form>
      </Form>
    </Card>
  );
}
