import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/Layout';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  return <Layout>
    <div>Dashboard</div>
  </Layout>
}
