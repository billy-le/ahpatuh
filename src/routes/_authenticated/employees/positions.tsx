import { convexQuery } from '@convex-dev/react-query';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { api } from 'convex/_generated/api';
import { DataTable } from '~/components/DataTable';
import { Layout } from '~/components/Layout';
import { Text } from '~/components/Text';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { useState } from 'react';
import { SearchIcon, PlusIcon } from 'lucide-react';
import { positionsColumns } from '~/components/positions/columns';
import { PositionForm } from '~/components/PositionForm';
import { Loader } from '~/components/ui/loader';

export const Route = createFileRoute('/_authenticated/employees/positions')({
  component: PositionsPage,
});

function PositionsPage() {
  const [open, setOpen] = useState(false);
  const {
    data: positions = [],
    isPending: isPositionsPending,
    error: positionsError,
  } = useQuery(convexQuery(api.roles.getRoles, {}));

  if (isPositionsPending) {
    return (
      <Layout className='h-full w-full grid place-items-center'>
        <Loader />
      </Layout>
    );
  }

  return (
    <Layout className='space-y-6'>
      <header className='flex justify-between'>
        <div className='flex items-center gap-4'>
          <Text el='h1'>Positions</Text>
          <Popover open={open}>
            <PopoverTrigger asChild>
              <Button
                size='icon'
                onClick={() => {
                  setOpen(!open);
                }}
              >
                <PlusIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              side='right'
              align='start'
              sideOffset={4}
              onInteractOutside={() => {
                setOpen(false);
              }}
            >
              <PositionForm onSuccess={() => setOpen(false)} />
            </PopoverContent>
          </Popover>
        </div>
        <form className='flex'>
          <Input type='search' className='rounded-r-none' />
          <Button type='button' className='rounded-l-none'>
            <SearchIcon />
          </Button>
        </form>
      </header>
      {positionsError ? (
        <Text el='h2'>{positionsError.message}</Text>
      ) : (
        <DataTable data={positions} columns={positionsColumns} />
      )}
    </Layout>
  );
}
