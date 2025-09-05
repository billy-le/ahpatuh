import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '@/components/Layout';
import { Calendar } from '@/components/Calendar';
import { api } from 'convex/_generated/api';
import { endOfYesterday } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { Loader } from '@ahpatuh/ui';
import { ConvexError } from 'convex/values';

export const Route = createFileRoute('/_authenticated/calendar')({
  component: CalendarPage,
});

function CalendarPage() {
  const {
    data: user,
    isPending: isUserPending,
    error: userError,
  } = useQuery(convexQuery(api.users.getUser, {}));

  if (isUserPending) {
    return (
      <Layout className='flex items-center justify-center'>
        <Loader />
      </Layout>
    );
  }
  if (userError) {
    if (userError instanceof ConvexError)
      return (
        <Layout className='flex items-center justify-center'>
          {userError.data.error}
        </Layout>
      );
  }
  return (
    <Layout>
      <Calendar
        lang={user!.language?.value ?? 'en-US'}
        blockPastDatesFrom={endOfYesterday()}
      />
    </Layout>
  );
}
