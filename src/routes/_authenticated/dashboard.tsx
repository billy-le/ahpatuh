import { createFileRoute, useRouter } from '@tanstack/react-router';
import { Layout } from '~/components/Layout';
import { api } from 'convex/_generated/api';
import { BusinessForm } from '~/components/BusinessForm';
import { AddressForm } from '~/components/AddressForm';
import { BusinessHoursForm } from '~/components/BusinessHoursForm';
import { useQuery } from 'convex/react';
export const Route = createFileRoute('/_authenticated/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const router = useRouter();

  const businessDetails = useQuery(api.business.getBusinessDetails)

  return (
    <Layout>
      {!businessDetails ? (
        <section className='space-y-20'>
          <div className='space-y-4 text-2xl text-center'>
            <h2>Hi! Looks like this is your first time!</h2>
            <h2>
              Let's get you started by first entering your business details
            </h2>
          </div>
          <BusinessForm
            onSuccess={() => {
              router.invalidate();
            }}
          />
        </section>
      ) : !businessDetails.address ? (
        <section>
          <h1>What a great business name!</h1>
          <h2>
            Can you tell me what's the address for{' '}
            <span className='font-bold'>{businessDetails.name}</span>?
          </h2>
          <AddressForm
            businessId={businessDetails._id}
            onSuccess={() => {
              router.invalidate();
            }}
          />
        </section>
      ) : !businessDetails.businessHours.length ? (
        <section>
          Business Hours
          <BusinessHoursForm
            businessId={businessDetails._id}
            onSuccess={() => {
              router.invalidate();
            }}
          />
        </section>
      ) : (
        <span>Business</span>
      )}
    </Layout>
  );
}
