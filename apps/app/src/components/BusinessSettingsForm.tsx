import {
  Button,
  Card,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@ahpatuh/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction, useMutation, useQuery } from 'convex/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import z from 'zod';
import { CheckIcon, XIcon } from 'lucide-react';
import { api } from '@ahpatuh/convex/_generated/api';

const start = startOfWeek(new Date());
const end = endOfWeek(new Date());
const weekInterval = eachDayOfInterval({ start, end });

const businessSettingsFormSchema = z.object({
  name: z.string(),
  email: z.email().optional(),
  phone: z.string().optional(),
  domain: z.url().optional(),
  address: z.object({
    _id: z.string().optional(),
    street1: z.string().optional(),
    street2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  }),
  businessHours: z.array(
    z.object({
      _id: z.string().optional(),
      timeOpen: z.string().optional(),
      timeClose: z.string().optional(),
      isClosed: z.boolean().default(false),
    }),
  ),
});

export function BusinessSettingsForm() {
  const business = useQuery(api.business.getBusinessDetails);
  const createBusiness = useMutation(api.business.createBusiness);
  const updateBusiness = useMutation(api.business.updateBusiness);
  const updateAddress = useMutation(api.address.mutateAddress);
  const mutateDomain = useMutation(api.domains.mutateDomain);
  const deleteDomain = useMutation(api.domains.deleteDomain);
  const verifyDomain = useAction(api.domains_verify.verifyDomain);
  const updateBusinessHours = useMutation(
    api.businessHours.mutateBusinessHours,
  );
  const form = useForm({
    resolver: zodResolver(businessSettingsFormSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (!business) return;
    form.setValue('name', business.name);
    form.setValue('email', business.email);
    form.setValue('phone', business.phone);
    form.setValue('domain', business.domain?.name);
    if (business.address) {
      form.setValue('address', {
        ...business.address,
        street2: '',
      });
    }
    if (business.businessHours.length > 0) {
      form.setValue('businessHours', business.businessHours);
    }
  }, [business]);

  const onSubmit = async (
    values: z.infer<typeof businessSettingsFormSchema>,
  ) => {
    if (!business) {
      const { businessHours, domain, address, ...businessValue } = values;
      createBusiness({
        ...businessValue,
        domain,
      });
      return;
    }
    updateBusiness({
      _id: business?._id,
      name: values.name,
      email: values.email,
      phone: values.phone,
    })
      .then(() => updateAddress(values.address))
      .then(() => {
        try {
          const url = new URL(values.domain);
          if (business.domain?.name === url.origin) return;

          if (business.domain?._id) {
            mutateDomain({ _id: business.domain._id, name: url.origin });
          } else {
            mutateDomain({ name: url.origin });
          }
        } catch (_) {
          if (business.domain?._id) {
            deleteDomain({ _id: business.domain._id });
          } else if (values.domain?.length) {
            form.setError('domain', { message: 'Invalid URL' });
          }
        }
      })
      .then(() =>
        updateBusinessHours({
          businessHours: values.businessHours.map((bh, index) => ({
            ...bh,
            dayOfWeek: index,
          })),
        }),
      );
  };

  return (
    <Form {...form}>
      <form
        className='grid grid-cols-2 gap-6'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Card className='p-6 h-fit'>
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
          <FormField
            control={form.control}
            name='domain'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Domain</FormLabel>
                <FormControl>
                  <div className='relative '>
                    <Input {...field} />
                    {business?.domain && (
                      <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        className='absolute rounded-l-none right-0 top-1/2 -translate-y-1/2'
                        onClick={(e) => {
                          e.preventDefault();
                          if (!business?.domain?.isVerified) {
                            verifyDomain({});
                          }
                        }}
                      >
                        {business.domain.isVerified ? (
                          <CheckIcon className='text-green-500' />
                        ) : (
                          <XIcon className='text-red-500' />
                        )}
                      </Button>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!business?.domain?.isVerified ? (
            <div>
              <p className='mb-2'>
                Domain not verified. Add a TXT record to your DNS records.
              </p>
              <code>{business?.domain?.challengePublic}</code>
            </div>
          ) : (
            business?.domain?.publicKey && (
              <div>
                <p className='mb-2'>Your public key is:</p>
                <code>{business?.domain?.publicKey}</code>
              </div>
            )
          )}
        </Card>
        <Card className='p-6'>
          <FormField
            control={form.control}
            name='address.street1'
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
            name='address.street2'
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
            name='address.city'
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
            name='address.state'
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
            name='address.country'
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
            name='address.postalCode'
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
        </Card>
        <Card className='p-6'>
          <table className='text-center max-w-fit'>
            <thead>
              <tr>
                <th></th>
                <th>Time Open</th>
                <th>Time Close</th>
                <th>Is Closed?</th>
              </tr>
            </thead>
            <tbody>
              {form.watch('businessHours')?.map((businessHour, index) => (
                <tr key={businessHour._id}>
                  <td className='text-left py-2 px-3'>
                    {Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(
                      weekInterval[index],
                    )}
                  </td>
                  <td className='py-2 px-3'>
                    <Input
                      type='time'
                      className='w-fit mx-auto'
                      {...form.register(`businessHours.${index}.timeOpen`)}
                    />
                  </td>
                  <td className='py-2 px-3'>
                    <Input
                      type='time'
                      className='w-fit mx-auto'
                      {...form.register(`businessHours.${index}.timeClose`)}
                    />
                  </td>
                  <td className='py-2 px-3'>
                    <Checkbox
                      checked={form.watch(`businessHours.${index}.isClosed`)}
                      onCheckedChange={(checked) => {
                        form.setValue(
                          `businessHours.${index}.isClosed`,
                          Boolean(checked),
                        );
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Button
          type='submit'
          disabled={form.formState.isSubmitting}
          className='col-span-2'
        >
          Save
        </Button>
      </form>
    </Form>
  );
}
