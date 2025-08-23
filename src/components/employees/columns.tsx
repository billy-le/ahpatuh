import { ColumnDef } from '@tanstack/react-table';
import type { FunctionReturnType } from 'convex/server';
import { api } from 'convex/_generated/api';
import {
  User2,
  EllipsisVerticalIcon,
  Pencil,
  Trash2,
  Camera,
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { useMutation } from 'convex/react';
import { useState } from 'react';
import { EmployeeDetailsForm } from './EmployeeDetailsForm';
import { EmployeePositionAndShiftsForm } from './EmployeePositionAndShiftsForm';

export const employeeColumns: ColumnDef<
  FunctionReturnType<typeof api.employees.getEmployees>[number]
>[] = [
  {
    header: 'First Name',
    cell: ({ row: { original } }) => (
      <div className='flex items-center gap-4'>
        {original.image ? (
          <img src={original.image} />
        ) : (
          <div className='size-16 rounded-full bg-yellow-200 grid place-items-center'>
            <User2 size={32} />
          </div>
        )}
        <div>
          <p>
            {original.firstName} {original.lastName}
          </p>
          <p className='text-gray-500'>{original.email}</p>
        </div>
      </div>
    ),
  },
  {
    header: 'Current Customer',
    cell: () => {
      return <div>WIP</div>;
    },
  },
  {
    header: 'Next Booking',
    cell: () => {
      return <div>WIP</div>;
    },
  },
  {
    header: 'Hired Date',
    accessorFn: (props) => (props.hiredDate ? props.hiredDate : 'N/A'),
  },
  {
    accessorFn: (row) => row.position?.name,
    header: 'Position',
  },
  {
    header: 'Action',
    cell: ({ row: { original: employee } }) => {
      const deleteEmployee = useMutation(api.employees.deleteEmployee);
      const [formOpen, setFormOpen] = useState(false);

      return (
        <Dialog open={formOpen}>
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size='icon' variant='outline'>
                  <EllipsisVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side='bottom' align='start' autoFocus>
                <DropdownMenuItem>
                  <DialogTrigger
                    className='font-medium w-full flex justify-between items-center'
                    onClick={() => {
                      setFormOpen(true);
                    }}
                  >
                    <span>Edit</span>
                    <Pencil />
                  </DialogTrigger>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <AlertDialogTrigger className='font-medium w-full flex justify-between items-center'>
                    <span>Delete</span>
                    <Trash2 />
                  </AlertDialogTrigger>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  employee, "{employee.firstName} {employee.lastName}", and
                  remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    deleteEmployee({ employeeId: employee._id });
                  }}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <DialogContent
            className='max-w-5xl sm:max-w-5xl'
            onInteractOutside={() => {
              setFormOpen(false);
            }}
          >
            <DialogHeader className='flex-row items-center gap-5'>
              <div className='relative size-20 grid place-items-center rounded-full bg-yellow-200'>
                <User2 size={40} />
                <button
                  type='button'
                  className='absolute bottom-0 right-0 size-8 rounded-full bg-rose-200 grid place-items-center cursor-pointer'
                >
                  <Camera size={20} />
                </button>
              </div>
              <div>
                <DialogTitle>
                  {employee.firstName} {employee.lastName}
                </DialogTitle>
                <DialogDescription>Update Employee Details</DialogDescription>
              </div>
            </DialogHeader>
            <Tabs defaultValue='details' className='space-y-4'>
              <TabsList>
                <TabsTrigger value='details'>Details</TabsTrigger>
                <TabsTrigger value='pos_shift'>Position & Shift</TabsTrigger>
                <TabsTrigger value='availability'>Availability</TabsTrigger>
              </TabsList>
              <TabsContent value='details'>
                <EmployeeDetailsForm
                  employee={employee}
                  onSuccess={() => {
                    setFormOpen(false);
                  }}
                />
              </TabsContent>
              <TabsContent value='pos_shift'>
                <EmployeePositionAndShiftsForm
                  employee={employee}
                  onSuccess={() => setFormOpen(false)}
                />
              </TabsContent>
              <TabsContent value='availability'>Availability</TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      );
    },
  },
];
