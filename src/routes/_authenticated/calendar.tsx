import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '~/components/Layout';
import { Calendar } from '~/components/Calendar';
import { api } from 'convex/_generated/api';
import { endOfYesterday } from 'date-fns';
import { useQuery } from 'convex/react';

export const Route = createFileRoute('/_authenticated/calendar')({
  component: CalendarPage,
});

function CalendarPage() {
  const user = useQuery(api.users.getUser);
  if (!user) return null;
  return (
    <Layout>
      <Calendar lang={user.language?.value ?? 'en-US'} blockPastDatesFrom={endOfYesterday()} />
    </Layout>
  );
}
