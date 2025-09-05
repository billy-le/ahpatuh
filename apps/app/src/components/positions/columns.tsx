import { ColumnDef } from '@tanstack/react-table';
import type { FunctionReturnType } from 'convex/server';
import { api } from '@ahpatuh/convex/_generated/api';
import { EllipsisVerticalIcon, Trash2, PencilIcon } from 'lucide-react';
import { useMutation } from 'convex/react';
import {
  Button,
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  AlertDialog,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogDescription,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@ahpatuh/ui';
import { useState } from 'react';
import { PositionForm } from '../PositionForm';

export const positionsColumns: ColumnDef<
  FunctionReturnType<typeof api.roles.getRoles>[number]
>[] = [
  {
    header: 'Name',
    cell: ({ row: { original } }) => (
      <div className='flex items-center gap-4'>{original.name}</div>
    ),
  },
  {
    header: 'Description',
    cell: ({ row: { original } }) => <div>{original.description}</div>,
  },
  {
    header: 'Actions',
    cell: ({ row: { original: position } }) => {
      const [formOpen, setFormOpen] = useState(false);
      const deletePosition = useMutation(api.roles.deleteRole);

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
                    <PencilIcon />
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
                  This action is permanent.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    deletePosition({ _id: position._id });
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
            <DialogHeader>
              <DialogTitle>Position Form</DialogTitle>
              <DialogDescription>Modify this position</DialogDescription>
            </DialogHeader>
            <PositionForm
              position={position}
              onSuccess={() => {
                setFormOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      );
    },
  },
];
