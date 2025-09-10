import { useQuery } from 'convex/react';
import { api } from '@ahpatuh/convex/_generated/api';

export function App() {
  const business = useQuery(api.widget.getBusiness, {
    origin: window.location.origin,
  });

  const employees = useQuery(
    api.widget.getEmployees,
    business
      ? {
          origin: window.location.origin,
          businessId: business._id,
        }
      : 'skip',
  );

  const bookings = useQuery(
    api.widget.getBookings,
    business
      ? {
          origin: window.location.origin,
          businessId: business._id,
        }
      : 'skip',
  );

  console.log({
    business,
    employees,
    bookings,
  });

  return (
    <>
      <h1>Vite + Preact</h1>
    </>
  );
}
