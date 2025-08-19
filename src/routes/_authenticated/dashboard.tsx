import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Layout } from '~/components/Layout';
import { api } from 'convex/_generated/api';
import { BusinessForm } from '~/components/BusinessForm';
import { AddressForm } from '~/components/AddressForm';
import { BusinessHoursForm } from '~/components/BusinessHoursForm';

export const Route = createFileRoute('/_authenticated/dashboard')({
  beforeLoad: async (ctx) => {
    const business = await ctx.context.convexClient.query(api.business.getBusinessDetails);
    return { business }
  },
  component: Dashboard,
})

function Dashboard() {
  const context = Route.useRouteContext()
  const router = useRouter()

  return <Layout>
    {!context.business ?
      <section className='space-y-20'>
        <div className='space-y-4 text-2xl text-center'>
          <h2>Hi! Looks like this is your first time!</h2>
          <h2>Let's get you started by first entering your business details</h2>
        </div>
        <BusinessForm onSuccess={() => {
          router.invalidate()
        }} />
      </section>
      : !context.business.address ?
        <section>
          <h1>
            What a great business name!
          </h1>
          <h2>Can you tell me what's the address for <span className='font-bold'>{context.business.name}</span>?</h2>
          <AddressForm businessId={context.business._id} onSuccess={() => {
            router.invalidate()
          }} />
        </section>
        : !context.business.businessHours.length ?
          <section>
            Business Hours
            <BusinessHoursForm businessId={context.business._id} onSuccess={() => {
              router.invalidate()
            }} />
          </section>

          : <span>Business</span>}
  </Layout>
}
