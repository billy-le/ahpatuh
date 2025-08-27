import {
  Link,
  useRouter,
  type LinkComponentProps,
} from '@tanstack/react-router';
import { LayoutDashboard, Calendar, Users, Cog } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { authClient } from '~/lib/auth-client';
import { cx } from '~/lib/cva';

interface LayoutProps extends React.PropsWithChildren {
  className?: string;
}

const navigation: Array<
  Pick<LinkComponentProps, 'to'> & { name: string; icon: React.ReactElement }
> = [
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
  },
];

export function Layout({ children, className }: LayoutProps) {
  const router = useRouter();
  return (
    <div className='flex min-h-dvh bg-apt-hot-pink'>
      <section className='py-10 flex flex-col justify-between shrink-0 min-w-40 border-r-2 border-black'>
        <nav className='px-4'>
          <ul className='space-y-4'>
            {navigation.map(({ name, to, icon }) => (
              <li className='rounded-md hover:bg-apt-secondary' key={name}>
                <Link
                  activeProps={{
                    className: 'block bg-apt-secondary rounded-md',
                  }}
                  to={to}
                >
                  <div className='flex items-center gap-4 py-2 px-4'>
                    {icon}
                    <span>{name}</span>
                  </div>
                </Link>
              </li>
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
      <main className={cx('m-6 py-4 px-6 rounded-md grow bg-white', className)}>
        {' '}
        {children}
      </main>
    </div>
  );
}
