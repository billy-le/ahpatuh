import { createFileRoute, useRouter } from '@tanstack/react-router';
import { Layout } from '~/components/Layout';
import { api } from 'convex/_generated/api';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { Loader } from '~/components/ui/loader';
import { ConvexError } from 'convex/values';
import { OnboardingForm } from '~/components/OnboardingForm';
export const Route = createFileRoute('/_authenticated/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const router = useRouter();
  const { data: user } = useQuery(convexQuery(api.users.getUser, {}));
  const { data: businessDetails, isPending, error } = useQuery(convexQuery(api.business.getBusinessDetails, {}))

  function onSuccess() {
    router.invalidate()
  }

  if (isPending) {
    return <Layout className='flex items-center justify-center'>
      <Loader />
    </Layout>
  }

  if (error && error instanceof ConvexError) {
    return <Layout>{error.data.message}</Layout>
  }

  return (
    <Layout>
      <h1>Welcome back, {user?.name}</h1>
      <OnboardingForm businessDetails={businessDetails} onSuccess={onSuccess} />
    </Layout>
  );
}
