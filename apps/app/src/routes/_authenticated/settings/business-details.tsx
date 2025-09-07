import { createFileRoute, Link } from '@tanstack/react-router';
import { Layout } from '@/components/Layout';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@ahpatuh/ui';
import { Text } from '@/components/Text';
import { ChevronsUpDownIcon } from 'lucide-react';
import { BusinessSettingsForm } from '@/components/BusinessSettingsForm';

export const Route = createFileRoute(
  '/_authenticated/settings/business-details',
)({
  component: Settings,
});

function Settings() {
  return (
    <Layout>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className='flex gap-4 items-center justify-between'>
            <Text el='h1'>Business Details</Text>
            <ChevronsUpDownIcon />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start'>
          <DropdownMenuItem>
            <Link to='/settings'>User Profile</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div>
        <BusinessSettingsForm />
      </div>
    </Layout>
  );
}
