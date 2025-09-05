import { createFileRoute, useRouter } from '@tanstack/react-router';
import { Layout } from '@/components/Layout';
import { api } from 'convex/_generated/api';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { Loader } from '@ahpatuh/ui';
import { ConvexError } from 'convex/values';
import { OnboardingForm } from '@/components/OnboardingForm';
import { Text } from '@/components/Text';
export const Route = createFileRoute('/_authenticated/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const router = useRouter();
  const {
    data: user,
    isPending: isUserPending,
    error: userError,
  } = useQuery(convexQuery(api.users.getUser, {}));
  const {
    data: businessDetails,
    isPending: isBusinessDetailsPending,
    error: businessDetailsError,
  } = useQuery(convexQuery(api.business.getBusinessDetails, {}));

  const error = userError || businessDetailsError;
  const isPending = isUserPending || isBusinessDetailsPending;

  function onSuccess() {
    router.invalidate();
  }

  if (isPending) {
    return (
      <Layout className='flex items-center justify-center'>
        <Loader />
      </Layout>
    );
  }

  if (error && error instanceof ConvexError && error.data.code !== 404) {
    return <Layout>{error.data.message}</Layout>;
  }

  return (
    <Layout>
      <Text el='h1' className='mb-6'>
        Hello, {user?.name}
      </Text>
      <OnboardingForm businessDetails={businessDetails} onSuccess={onSuccess} />
      {businessDetails && (
        <section className='grid grid-cols-6 gap-8'>
          <div>
            <Text el='h2' className='mb-2'>
              Summary
            </Text>
            <div className='h-96 border border-gray-300 shadow rounded-md p-6'>
              <Text el='p'>Today's Profit</Text>
              <p>$1,230.88</p>
            </div>
          </div>
          <div className='col-span-3'>
            <Text el='h2' className='mb-2'>
              Schedule
            </Text>
            <div className='h-96 border border-gray-300 shadow rounded-md'></div>
          </div>
          <div className='col-span-2'>
            <Text el='h2' className='mb-2'>
              Performance
            </Text>
            <div className='h-96 border border-gray-300 shadow rounded-md'></div>
          </div>
        </section>
      )}
    </Layout>
  );
}
