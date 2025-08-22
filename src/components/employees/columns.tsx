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
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { z } from 'zod';
import { Input } from '../ui/input';
import { Checkbox } from '~/components/ui/checkbox';
import { useState } from 'react';

const updateEmployeeSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.email().optional(),
  phone: z.e164().optional(),
  hiredDate: z.string().optional(),
  isActive: z.boolean(),
  isBookable: z.boolean(),
  positionId: z.string().optional(),
  shiftIds: z.array(z.string()),
});

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
        const updateEmployee = useMutation(api.employees.updateEmployee);
        const [formOpen, setFormOpen] = useState(false)

        const form = useForm({
          resolver: zodResolver(updateEmployeeSchema),
          defaultValues: {
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            phone: employee.phone,
            hiredDate: employee.hiredDate,
            isActive: employee.isActive,
            isBookable: employee.isBookable,
          },
        });

        const onSubmit = ({ firstName, lastName, email, phone, hiredDate, isActive, isBookable }: z.infer<typeof updateEmployeeSchema>) => {
          updateEmployee({
            employeeId: employee._id,
            firstName,
            lastName,
            email,
            phone,
            hiredDate,
            isActive,
            isBookable
          }).then(() => {
            setFormOpen(false)
          })
        }
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
                    <DialogTrigger className='font-medium w-full flex justify-between items-center' onClick={() => {
                      setFormOpen(true)
                    }}>
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
            <DialogContent onInteractOutside={() => {
              setFormOpen(false)
            }}>
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
                  <Form {...form}>
                    <form className='space-y-4'>
                      <FormField
                        control={form.control}
                        name='firstName'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='lastName'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='email'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='phone'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className='flex gap-8 items-center justify-between'>
                        <FormField
                          control={form.control}
                          name='hiredDate'
                          render={({ field }) => (
                            <FormItem className='grow'>
                              <FormLabel>Hired Date</FormLabel>
                              <FormControl>
                                <Input type='date' {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className='grow flex justify-end gap-8 mt-6'>
                          <FormField
                            control={form.control}
                            name='isActive'
                            render={({ field }) => (
                              <FormItem className='flex items-center gap-2'>
                                <FormLabel>Active</FormLabel>
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked) =>
                                      field.onChange(checked)
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name='isBookable'
                            render={({ field }) => (
                              <FormItem className='flex items-center gap-2'>
                                <FormLabel>Bookable?</FormLabel>
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked) =>
                                      field.onChange(checked)
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <Button type="submit" onClick={(e) => {
                        e.preventDefault()
                        onSubmit(form.getValues())
                      }}>Save</Button>
                    </form>
                  </Form>
                </TabsContent>
                <TabsContent value='pos_shift'>hello</TabsContent>
                <TabsContent value='availability'>welcome</TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        );
      },
    },
  ];
