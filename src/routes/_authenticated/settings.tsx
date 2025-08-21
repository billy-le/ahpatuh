import { createFileRoute, } from '@tanstack/react-router';
import { LangSelector } from '~/components/LangSelector';
import { Layout } from '~/components/Layout';
import { api } from 'convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';

export const Route = createFileRoute('/_authenticated/settings')({
  component: Settings,
});

function Settings() {
  const updateUser = useMutation(api.users.updateUser)
  const user = useQuery(api.users.getUser);
  const languages = useQuery(api.languages.getLanguages)

  return (
    <Layout>
      {(!user || !languages) ? <div>Loader</div> : <>
        <h1>Settings Page</h1>
        <LangSelector defaultLang={user?.language ?? undefined} langs={languages} onLangChange={(lang) => {
          updateUser({ langId: lang._id })
        }} />
      </>}
    </Layout>
  );
}
