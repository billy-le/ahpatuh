import { createFileRoute, } from '@tanstack/react-router';
import { LangSelector } from '~/components/LangSelector';
import { Layout } from '~/components/Layout';
import { useConvexQuery } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';
import { useMutation } from 'convex/react';
import { Id } from 'convex/_generated/dataModel';

export const Route = createFileRoute('/_authenticated/settings')({
  component: Settings,
});

function Settings() {
  const context = Route.useRouteContext()
  const updateUser = useMutation(api.users.updateUser)
  const languages = useConvexQuery(api.languages.getLanguages) ?? []

  return (
    <Layout>
      <h1>Settings Page</h1>
      <LangSelector langs={languages} onLangChange={async (lang) => {
        updateUser({ userId: context.userId as Id<'users'>, langId: lang._id })
      }} />
    </Layout>
  );
}
