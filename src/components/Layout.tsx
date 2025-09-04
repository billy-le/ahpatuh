import {
  Link,
  useRouter,
  type LinkComponentProps,
} from '@tanstack/react-router';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Cog,
  LogsIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '~/components/ui/button';
import { authClient } from '~/lib/auth-client';
import { cx } from '~/lib/cva';

interface LayoutProps extends React.PropsWithChildren {
  className?: string;
}

type NavigationLink = Pick<LinkComponentProps, 'to'> & {
  name: string;
  icon: React.ReactElement;
};

const navigation: (NavigationLink & {
  subPaths?: Omit<NavigationLink, 'icon'>[];
})[] = [
  {
    to: '/dashboard',
    name: 'Dashboard',
    icon: <LayoutDashboard />,
  },
  {
    to: '/calendar',
    name: 'Calendar',
    icon: <Calendar />,
  },
  {
    to: '/employees',
    name: 'Employees',
    icon: <Users />,
    subPaths: [{ to: '/employees/positions', name: 'Positions' }],
  },
  {
    to: '/services',
    name: 'Services',
    icon: <LogsIcon />,
    subPaths: [
      {
        to: '/services/categories',
        name: 'Categories',
      },
    ],
  },
];

const NavMenuItem = ({
  to,
  name,
  icon,
  subPaths = [],
}: (typeof navigation)[number]) => {
  const active = window.location.pathname.startsWith(to as string);
  const [open, setOpen] = useState(active);
  return (
    <>
      <li
        className={cx(
          'flex items-center justify-between rounded-md hover:bg-apt-secondary px-4 py-2',
          {
            'bg-apt-secondary': active,
          },
        )}
      >
        <Link to={to} className='w-full'>
          <div className='flex items-center gap-4'>
            {icon}
            <span>{name}</span>
          </div>
        </Link>
        {subPaths.length > 0 && (
          <Button
            variant='ghost'
            className='p-0! size-6'
            onClick={() => {
              setOpen(!open);
            }}
          >
            {open ? <ChevronDownIcon /> : <ChevronUpIcon />}
          </Button>
        )}
      </li>
      {open && subPaths.length > 0 && (
        <li className='border-l border-black ml-8 pl-4'>
          <ul className='space-y-4'>
            {subPaths.map(({ name, to }) => (
              <li key={name} className='rounded-md hover:bg-apt-secondary'>
                <Link
                  activeProps={{
                    className: 'bg-apt-secondary rounded-md',
                  }}
                  to={to}
                  className='block py-2 px-4'
                >
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      )}
    </>
  );
};

export function Layout({ children, className }: LayoutProps) {
  const router = useRouter();
  return (
    <div className='flex min-h-dvh bg-apt-hot-pink'>
      <section className='py-10 flex flex-col justify-between shrink-0 min-w-80 border-r-2 border-black'>
        <nav className='px-4'>
          <ul className='space-y-4'>
            {navigation.map((navItem) => (
              <NavMenuItem key={navItem.to} {...navItem} />
            ))}
          </ul>
        </nav>
        <ul className='px-4 space-y-4'>
          <li className='rounded-md hover:bg-apt-secondary'>
            <Link
              activeProps={{
                className: 'block bg-apt-secondary rounded-md',
              }}
              to='/settings'
            >
              <div className='flex items-center gap-4 py-2 px-4'>
                <Cog />
                <span>Settings</span>
              </div>
            </Link>
          </li>
          <li>
            <Button
              className='w-full'
              onClick={() => {
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.navigate({ to: '/' });
                    },
                  },
                });
              }}
            >
              Sign Out
            </Button>
          </li>
        </ul>
      </section>
      <main className='m-6 py-4 px-6 rounded-md grow bg-white'>
        <div className={className}>{children}</div>
      </main>
    </div>
  );
}
