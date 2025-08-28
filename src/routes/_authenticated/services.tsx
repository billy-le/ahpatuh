import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '~/components/Layout';

export const Route = createFileRoute('/_authenticated/services')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Layout></Layout>;
}
