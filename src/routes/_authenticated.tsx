import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad(ctx) {
    if (!ctx.context.userId) {
      throw redirect({ to: '/' });
    }
  },
  component: AuthenticatedRoute,
});

function AuthenticatedRoute() {
  return <Outlet />;
}
