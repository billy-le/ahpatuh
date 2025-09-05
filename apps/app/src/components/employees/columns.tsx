import { ColumnDef } from '@tanstack/react-table';
import type { FunctionReturnType } from 'convex/server';
import { api } from 'convex/_generated/api';
import {
  User2,
  EllipsisVerticalIcon,
  Pencil,
  Trash2,
  Camera,
  Calendar,
  List,
  Trash,
} from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@ahpatuh/ui';
import { useMutation } from 'convex/react';
import { useState, useRef } from 'react';
import { EmployeeDetailsForm } from './EmployeeDetailsForm';
import { EmployeePositionAndShiftsForm } from './EmployeePositionAndShiftsForm';
import { EmployeeAvailabilityForm } from './EmployeeAvailabilityForm';
import { cx } from '@ahpatuh/utils';
import { format } from 'date-fns';

export const employeeUnavailabitiesColumns: ColumnDef<
  FunctionReturnType<
    typeof api.employeeUnavailability.getEmployeeUnavailabilities
  >[number]
>[] = [
  {
    header: 'Dates',
    cell: ({ row: { original } }) => (
      <div className='flex items-center gap-4'>
        {format(original.startDate, 'MM/dd/yyyy')} -{' '}
        {format(original.endDate, 'MM/dd/yyyy')}
      </div>
    ),
  },
  {
    header: 'Reason',
    cell: ({
      row: {
        original: { reason },
      },
    }) => <div>{reason}</div>,
  },
  {
    header: 'Actions',
    cell: ({ row: { original } }) => {
      const deleteUnavailability = useMutation(
        api.employeeUnavailability.deleteUnavailability,
      );
      return (
        <div className='flex items-center gap-4'>
          <Button
            size='icon'
            onClick={() => {
              deleteUnavailability({
                employeeId: original.employeeId,
                unavailabilityId: original._id,
              });
            }}
          >
            <Trash />
          </Button>
        </div>
      );
    },
  },
];

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
      const [availabilityView, setAvailablityView] = useState<
        'calendar' | 'list'
      >('calendar');
      const availabilityRef = useRef<HTMLButtonElement | null>(null);
      const availabilityViewRef = useRef<HTMLDivElement | null>(null);

      return (
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size='icon' variant='outline'>
                  <EllipsisVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side='bottom' align='start' autoFocus>
                <DropdownMenuItem>
                  <DialogTrigger className='font-medium w-full flex justify-between items-center'>
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
            className='block space-y-10 max-w-5xl sm:max-w-5xl top-40 translate-y-0'
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
              <div className='flex justify-between'>
                <TabsList
                  onClick={(e) => {
                    if (e.target === availabilityRef?.current) {
                      availabilityViewRef.current?.classList.remove('hidden');
                    } else {
                      availabilityViewRef.current?.classList.add('hidden');
                    }
                  }}
                >
                  <TabsTrigger value='details'>Details</TabsTrigger>
                  <TabsTrigger value='pos_shift'>Position & Shift</TabsTrigger>
                  <TabsTrigger ref={availabilityRef} value='unavailability'>
                    Unavailability
                  </TabsTrigger>
                </TabsList>
                <div
                  ref={availabilityViewRef}
                  className='flex items-center hidden rounded-md bg-apt-secondary overflow-hidden'
                >
                  <button
                    className={cx(
                      'grid place-items-center h-full w-full px-2',
                      {
                        'bg-apt-primary': availabilityView === 'calendar',
                      },
                    )}
                    onClick={() => {
                      setAvailablityView('calendar');
                    }}
                  >
                    <Calendar />
                  </button>
                  <button
                    className={cx(
                      'grid place-items-center h-full w-full px-2',
                      {
                        'bg-apt-primary': availabilityView === 'list',
                      },
                    )}
                    onClick={() => {
                      setAvailablityView('list');
                    }}
                  >
                    <List />
                  </button>
                </div>
              </div>
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
              <TabsContent value='unavailability'>
                <EmployeeAvailabilityForm
                  employee={employee}
                  view={availabilityView}
                />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      );
    },
  },
];
