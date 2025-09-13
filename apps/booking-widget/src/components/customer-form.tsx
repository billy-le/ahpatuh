import { api } from '@ahpatuh/convex/_generated/api';
import type { Id } from '@ahpatuh/convex/_generated/dataModel';
import { useConvex } from 'convex/react';
import type { FunctionReturnType } from 'convex/server';

export interface CustomerFormProps {
  business: FunctionReturnType<typeof api.widget.getBusiness>;
  onSuccess: (customerId: Id<'customers'>) => void;
}
export function CustomerForm({ business, onSuccess }: CustomerFormProps) {
  const convex = useConvex();

  if (!business) return;

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const customerId = await convex.mutation(api.widget.createCustomer, {
          businessId: business._id,
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
        });

        if (customerId) {
          onSuccess(customerId);
        }
      }}
    >
      <fieldset>
        <label htmlFor='name'>Name</label>
        <input required id='name' name='name' type='text' />
      </fieldset>

      <fieldset>
        <label htmlFor='email'>Email</label>
        <input required id='email' name='email' type='email' />
      </fieldset>

      <fieldset>
        <label htmlFor='phone'>Phone</label>
        <input required id='phone' name='phone' type='number' />
      </fieldset>

      <fieldset>
        <button type='submit'>Next</button>
      </fieldset>
    </form>
  );
}
