import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { AuthLoading, Authenticated } from 'convex/react';

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
    <AuthLoading>
      <div>Loading...</div>
    </AuthLoading>
    <Authenticated>
      <Outlet />
    </Authenticated>
  </>
}
