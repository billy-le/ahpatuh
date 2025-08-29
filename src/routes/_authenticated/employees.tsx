import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '~/components/Layout';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { UserPlus, Search } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { QuickAddEmployeeForm } from '~/components/QuickAddEmployeeForm';
import { EmployeeDataTable } from '~/components/employees/data-table';
import { api } from 'convex/_generated/api';
import { useState } from 'react';
import { employeeColumns } from '~/components/employees/columns';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { Loader } from '~/components/ui/loader';
import { Text } from '~/components/Text';

export const Route = createFileRoute('/_authenticated/employees')({
  component: Employees,
});

function Employees() {
  const [open, setOpen] = useState(false);
  const {
    data: business,
    isPending: isBusinessDetailsPending,
    error: businessDetailsError,
  } = useQuery(convexQuery(api.business.getBusinessDetails, {}));
  const {
    data: employees = [],
    isPending: isEmployeesPending,
    error: employeesError,
  } = useQuery(convexQuery(api.employees.getEmployees, {}));

  return (
    <Layout className='space-y-6'>
      <header className='flex justify-between'>
        <div className='flex items-center gap-4'>
          <Text el='h1'>Employees</Text>
          <Popover open={open}>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                disabled={
                  !business ||
                  isBusinessDetailsPending ||
                  !!businessDetailsError ||
                  !!employeesError
                }
                onClick={() => {
                  setOpen(!open);
                }}
              >
                <UserPlus />
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
              <QuickAddEmployeeForm onSuccess={setOpen} />
            </PopoverContent>
          </Popover>
        </div>
        <form className='flex'>
          <Input type='search' className='rounded-r-none' />
          <Button type='button' className='rounded-l-none'>
            <Search />
          </Button>
        </form>
      </header>
      <section>
        {isEmployeesPending ? (
          <div className='flex items-center justify-center'>
            <Loader />
          </div>
        ) : (
          <EmployeeDataTable columns={employeeColumns} data={employees} />
        )}
      </section>
    </Layout>
  );
}
