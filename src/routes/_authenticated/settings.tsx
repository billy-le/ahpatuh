import { createFileRoute } from '@tanstack/react-router';
import { Layout } from '~/components/Layout';

export const Route = createFileRoute('/_authenticated/settings')({
  component: Settings,
});

function Settings() {
  return (
    <Layout>
      <div>Hello "/_authenticated/settings"!</div>
    </Layout>
  );
}
