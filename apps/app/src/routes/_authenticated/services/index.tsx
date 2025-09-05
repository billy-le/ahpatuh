import { convexQuery } from '@convex-dev/react-query';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { PlusIcon } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { QuickAddServiceForm } from '@/components/QuickAddServiceForm';
import { Text } from '@/components/Text';
import { Popover, PopoverTrigger, PopoverContent, Button } from '@ahpatuh/ui';
import { useState } from 'react';
import { DataTable } from '@/components/DataTable';
import { servicesColumns } from '@/components/services/columns';

export const Route = createFileRoute('/_authenticated/services/')({
  component: ServicePage,
});

function ServicePage() {
  const [open, setOpen] = useState(false);
  const {
    data: services = [],
    isPending: isServicesPending,
    error: servicesError,
  } = useQuery(convexQuery(api.services.getServices, {}));
  if (isServicesPending) return;
  if (servicesError) return;
  return (
    <Layout className='space-y-6'>
      <div className='flex justify-between'>
        <div className='flex gap-4'>
          <Text el='h1'>Services</Text>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button size='icon'>
                <PlusIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent side='right' align='start'>
              <QuickAddServiceForm
                onSuccess={() => {
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <DataTable data={services} columns={servicesColumns} />
    </Layout>
  );
}
