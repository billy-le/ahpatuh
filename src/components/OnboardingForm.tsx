import { api } from "convex/_generated/api"
import { BusinessForm } from "./BusinessForm"
import { AddressForm } from "./AddressForm"
import { BusinessHoursForm } from "./BusinessHoursForm"
import type { FunctionReturnType } from "convex/server"

interface OnoardingFormProps {
  businessDetails: FunctionReturnType<typeof api.business.getBusinessDetails> | undefined
  onSuccess: () => void;
}
export function OnboardingForm({ businessDetails, onSuccess }: OnoardingFormProps) {
  return !businessDetails ? (
    <section className='space-y-20'>
      <div className='space-y-4 text-2xl text-center'>
        <h2>Hi! Looks like this is your first time!</h2>
        <h2>
          Let's get you started by first entering your business details
        </h2>
      </div>
      <BusinessForm
        onSuccess={onSuccess} />
    </section>
  ) : !businessDetails.address ? (
    <section>
      <h1>What a great business name!</h1>
      <h2>
        Can you tell me what's the address for{' '}
        <span className='font-bold'>{businessDetails.name}</span>?
      </h2>
      <AddressForm
        onSuccess={onSuccess}
      />
    </section>
  ) : !businessDetails.businessHours.length && (
    <section>
      Business Hours
      <BusinessHoursForm
        onSuccess={onSuccess}
      />
    </section>
  )
}
