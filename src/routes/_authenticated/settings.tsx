import { createFileRoute } from '@tanstack/react-router';
import { LangSelector } from '~/components/LangSelector';
import { Layout } from '~/components/Layout';
import { api } from 'convex/_generated/api';
import { useMutation } from 'convex/react';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { Loader } from '~/components/ui/loader';
export const Route = createFileRoute('/_authenticated/settings')({
  component: Settings,
});

function Settings() {
  const updateUser = useMutation(api.users.updateUser);
  const {
    data: user,
    isPending: isUserPending,
    error: userError,
  } = useQuery(convexQuery(api.users.getUser, {}));
  const {
    data: languages = [],
    isPending: isLangaugesPending,
    error: languagesError,
  } = useQuery(convexQuery(api.languages.getLanguages, {}));

  if (isUserPending || isLangaugesPending) {
    return (
      <Layout className='flex items-center justify-center'>
        <Loader />
      </Layout>
    );
  }

  return (
    <Layout>
      {!user || !languages ? (
        <div>Loader</div>
      ) : (
        <>
          <h1>Settings Page</h1>
          <LangSelector
            defaultLang={user?.language ?? undefined}
            langs={languages}
            onLangChange={(lang) => {
              updateUser({ langId: lang._id });
            }}
          />
        </>
      )}
    </Layout>
  );
}
