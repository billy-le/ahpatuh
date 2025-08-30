import { ColumnDef } from '@tanstack/react-table';
import type { FunctionReturnType } from 'convex/server';
import { api } from 'convex/_generated/api';
import { Trash } from 'lucide-react';
import { Button } from '../ui/button';
import { useMutation } from 'convex/react';
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogClose,
} from '../ui/dialog';

export const servicesColumns: ColumnDef<
  FunctionReturnType<typeof api.services.getServices>[number]
>[] = [
  {
    header: 'Name',
    cell: ({ row: { original } }) => (
      <div className='flex items-center gap-4'>{original.name}</div>
    ),
  },
  {
    header: 'Description',
    cell: ({
      row: {
        original: { description },
      },
    }) => <div>{description}</div>,
  },
  {
    header: 'Categories',
    cell: ({ row: { original: _ } }) => {
      return <div>category</div>;
    },
  },
  {
    header: 'Price',
    cell: ({
      row: {
        original: { price },
      },
    }) => <div>${price.toFixed(2)}</div>,
  },
  {
    header: 'Actions',
    cell: ({ row: { original } }) => {
      const deleteService = useMutation(api.services.deleteService);
      return (
        <Dialog>
          <div className='flex items-center gap-4'>
            <DialogTrigger asChild>
              <Button size='icon'>
                <Trash />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Are you sure you want to delete, {original.name}?
                </DialogTitle>
                <DialogDescription>
                  This is a permanent action
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant='outline'>Cancel</Button>
                </DialogClose>
                <Button
                  onClick={() => {
                    deleteService({ _id: original._id });
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </div>
        </Dialog>
      );
    },
  },
];
