import {
  Link,
  useRouter,
  type LinkComponentProps,
} from '@tanstack/react-router';
import { LayoutDashboard, Calendar, Users, Cog } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { authClient } from '~/utils/auth-client';

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
  {
    to: '/settings',
    name: 'Settings',
    icon: <Cog />,
  },
];

export function Layout({ children }: React.PropsWithChildren) {
  const router = useRouter();
  return (
    <div className='flex gap-4 min-h-dvh'>
      <section className='py-10 flex flex-col justify-between shrink-0 min-w-40 border-r border-slate-300'>
        <nav className='px-4'>
          <ul className='space-y-2'>
            {navigation.map(({ name, to, icon }) => (
              <li className='rounded hover:bg-yellow-400/20' key={name}>
                <Link
                  activeProps={{ className: 'block bg-yellow-300 rounded-md' }}
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
        <ul className='px-4'>
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

      <main className='py-10 grow'>{children}</main>
    </div>
  );
}
