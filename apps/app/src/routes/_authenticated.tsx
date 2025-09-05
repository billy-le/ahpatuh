import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { AuthLoading, Authenticated, Unauthenticated } from 'convex/react';
import { Loader } from '@ahpatuh/ui';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad(ctx) {
    if (!ctx.context.userId) {
      throw redirect({ to: '/' });
    }
  },
  component: AuthenticatedRoute,
});

function AuthenticatedRoute() {
  return (
    <>
      <Unauthenticated>Something went wrong</Unauthenticated>
      <AuthLoading>
        <Loader />
      </AuthLoading>
      <Authenticated>
        <Outlet />
      </Authenticated>
    </>
  );
}
