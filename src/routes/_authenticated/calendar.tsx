import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/Layout'

export const Route = createFileRoute('/_authenticated/calendar')({
  component: Calendar,
})

function Calendar() {
  return <Layout><div>Hello "/_authenticated/calendar"!</div></Layout>
}
