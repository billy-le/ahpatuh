import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { AuthLoading, Authenticated } from 'convex/react';
import { Loader } from '~/components/ui/loader';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad(ctx) {
    if (!ctx.context.userId) {
      throw redirect({ to: '/' });
    }
  },
  component: AuthenticatedRoute,
});

function AuthenticatedRoute() {
  return <>
    <AuthLoading >
      <Loader />
    </AuthLoading>
    <Authenticated>
      <Outlet />
    </Authenticated>
  </>
}
