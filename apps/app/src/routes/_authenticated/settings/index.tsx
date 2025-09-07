import { createFileRoute, Link } from '@tanstack/react-router';
import { LangSelector } from '@/components/LangSelector';
import { Layout } from '@/components/Layout';
import { api } from '@ahpatuh/convex/_generated/api';
import { useMutation } from 'convex/react';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import {
  Loader,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@ahpatuh/ui';
import { Text } from '@/components/Text';

import { ChevronsUpDownIcon } from 'lucide-react';
export const Route = createFileRoute('/_authenticated/settings/')({
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

  if (userError || languagesError) {
    return <Layout>Something went wrong</Layout>;
  }

  return (
    <Layout>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className='flex gap-4 items-center justify-between'>
            <Text el='h1'>User Profile</Text>
            <ChevronsUpDownIcon />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start'>
          <DropdownMenuItem>
            <Link to='/settings/business-details'>Business Details</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div>
        <LangSelector
          defaultLang={user?.language}
          langs={languages}
          onLangChange={(lang) => {
            updateUser({ langId: lang._id });
          }}
        />
      </div>
    </Layout>
  );
}
