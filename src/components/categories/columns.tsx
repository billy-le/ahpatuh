import { ColumnDef } from '@tanstack/react-table';
import type { FunctionReturnType } from 'convex/server';
import { api } from 'convex/_generated/api';
import { EllipsisVerticalIcon, Trash2, PencilIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { useMutation } from 'convex/react';
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogDescription,
} from '~/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu';
import { useState } from 'react';
import { CategoryForm } from '../CategoryForm';

export const categoriesColumns: ColumnDef<
  FunctionReturnType<typeof api.category.getCategories>[number]
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
    header: 'Actions',
    cell: ({ row: { original: category } }) => {
      const [formOpen, setFormOpen] = useState(false);
      const deleteCategory = useMutation(api.category.deleteCategory);

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
                    deleteCategory({ _id: category._id });
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
              <DialogTitle>Category Form</DialogTitle>
              <DialogDescription>Modify this category</DialogDescription>
            </DialogHeader>
            <CategoryForm
              category={category}
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
