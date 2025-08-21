import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '~/components/Layout';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { UserPlus, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { EmployeeForm } from '~/components/EmployeeForm';

export const Route = createFileRoute('/_authenticated/employees')({
  component: Employees,
});

function Employees() {
  return (
    <Layout>
      <header className='flex justify-between'>
        <div className='flex items-center gap-4'>
          <h1 className='text-xl font-bold'>Employees</h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline'>
                <UserPlus />
              </Button>
            </PopoverTrigger>
            <PopoverContent side='right' align='start' sideOffset={4}>
              <EmployeeForm />
            </PopoverContent>
          </Popover>
        </div>
        <form className='flex'>
          <Input type='search' className='rounded-r-none' />
          <Button className='rounded-l-none'>
            <Search />
          </Button>
        </form>
      </header>
    </Layout>
  );
}
