import { convexQuery } from '@convex-dev/react-query';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { api } from '@ahpatuh/convex/_generated/api';
import { categoriesColumns } from '@/components/categories/columns';
import { DataTable } from '@/components/DataTable';
import { Layout } from '@/components/Layout';
import { Text } from '@/components/Text';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
  Input,
  Loader,
} from '@ahpatuh/ui';
import { useState } from 'react';
import { SearchIcon, PlusIcon } from 'lucide-react';
import { CategoryForm } from '@/components/CategoryForm';

export const Route = createFileRoute('/_authenticated/services/categories')({
  component: CategoryPage,
});

function CategoryPage() {
  const [open, setOpen] = useState(false);
  const {
    data: categories = [],
    isPending: isCategoriesPending,
    error: categoriesError,
  } = useQuery(convexQuery(api.category.getCategories, {}));

  if (isCategoriesPending) {
    return (
      <Layout className='h-full w-full grid place-items-center'>
        <Loader />
      </Layout>
    );
  }

  return (
    <Layout className='space-y-6'>
      <header className='flex justify-between'>
        <div className='flex items-center gap-4'>
          <Text el='h1'>Categories</Text>
          <Popover open={open}>
            <PopoverTrigger asChild>
              <Button
                size='icon'
                onClick={() => {
                  setOpen(!open);
                }}
              >
                <PlusIcon />
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
              <CategoryForm
                onSuccess={() => {
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <form className='flex'>
          <Input type='search' className='rounded-r-none' />
          <Button type='button' className='rounded-l-none'>
            <SearchIcon />
          </Button>
        </form>
      </header>
      {categoriesError ? (
        <Text el='h2'>{categoriesError.message}</Text>
      ) : (
        <DataTable data={categories} columns={categoriesColumns} />
      )}
    </Layout>
  );
}
