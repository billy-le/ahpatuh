import { ColumnDef } from '@tanstack/react-table';
import type { FunctionReturnType } from 'convex/server';
import { api } from 'convex/_generated/api';
import {
  EllipsisVerticalIcon,
  Trash2,
  PencilIcon,
  PlusIcon,
} from 'lucide-react';
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
import { ServiceForm } from './ServiceForm';
import { Badge } from '../ui/badge';

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
    header: 'Images',
    cell: ({ row: { original: service } }) => {
      const uniqueMedia = service.media.filter((m) =>
        m.fileName.includes('thumbnail'),
      );
      const remainder = uniqueMedia.slice(3);
      return (
        <div className='grid'>
          {remainder.length > 0 && (
            <h2
              className='col-start-1 row-start-1 text-right bg-white text-xl pr-1 border border-black rounded-md size-20'
              style={{
                rotate: '5deg',
                marginLeft: '60px',
              }}
            >
              {remainder.length}
            </h2>
          )}
          {uniqueMedia.slice(0, 3).map((m, i) => (
            <div key={m._id} className='col-start-1 row-start-1'>
              <img
                src={m.url}
                className='object-cover border border-black rounded-md size-20'
                style={{
                  rotate: (i === 0 ? 0 : 5) + 'deg',
                  marginLeft: i * 20 + 'px',
                }}
              />
            </div>
          ))}
        </div>
      );
    },
  },
  {
    header: 'Categories',
    cell: ({ row: { original: service } }) => {
      const firstThree = service.categories
        .slice(0, 3)
        .map((cat) => <Badge key={cat._id}>{cat.name}</Badge>);
      const remainders = service.categories.slice(3).length > 0 && (
        <Badge>
          <PlusIcon size={16} />
          <span className='ml-1 text-apt-hot-pink'>
            {service.categories.slice(3).length}
          </span>
        </Badge>
      );
      return (
        <div className='flex flex-wrap h-10 gap-2'>
          {firstThree}
          {remainders}
        </div>
      );
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
    cell: ({ row: { original: service } }) => {
      const [formOpen, setFormOpen] = useState(false);
      const deleteService = useMutation(api.services.deleteService);

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
                    deleteService({ _id: service._id });
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
              <DialogTitle>Service Form</DialogTitle>
              <DialogDescription>Modify this service</DialogDescription>
            </DialogHeader>
            <ServiceForm
              service={service}
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
