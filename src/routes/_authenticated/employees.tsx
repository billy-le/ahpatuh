import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '~/components/Layout';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { UserPlus, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { EmployeeForm } from '~/components/EmployeeForm';
import { EmployeeDataTable } from '~/components/employees/data-table';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { useState } from 'react';
import { employeeColumns } from '~/components/employees/columns';

export const Route = createFileRoute('/_authenticated/employees')({
  component: Employees,
});

function Employees() {
  const [open, setOpen] = useState(false)
  const business = useQuery(api.business.getBusinessDetails)
  const employees = useQuery(api.employees.getEmployees) ?? []

  return (
    <Layout className='space-y-8'>
      <header className='flex justify-between'>
        <div className='flex items-center gap-4'>
          <h1 className='text-xl font-bold'>Employees</h1>
          <Popover open={open}>
            <PopoverTrigger asChild>
              <Button variant='outline' disabled={!business} onClick={() => {
                setOpen(!open)
              }}>
                <UserPlus />
              </Button>
            </PopoverTrigger>
            <PopoverContent side='right' align='start' sideOffset={4} onInteractOutside={() => {
              setOpen(false)
            }}>
              <EmployeeForm onSuccess={setOpen} />
            </PopoverContent>
          </Popover>
        </div>
        <form className='flex'>
          <Input type='search' className='rounded-r-none' />
          <Button type="button" className='rounded-l-none'>
            <Search />
          </Button>
        </form>
      </header>
      <section>
        <EmployeeDataTable columns={employeeColumns} data={employees} />
      </section>
    </Layout>
  );
}
