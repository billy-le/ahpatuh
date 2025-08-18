import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/Layout'

export const Route = createFileRoute('/_authenticated/employees')({
  component: Employees,
})

function Employees() {
  return <Layout><div>Hello "/_authenticated/employees"!</div></Layout>
}
