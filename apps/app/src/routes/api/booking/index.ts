import { createServerFileRoute } from '@tanstack/react-start/server';
import { fetchAuth } from 'src/routes/__root';
import { convex } from 'src/services/convex-http-client';

export const ServerRoute = createServerFileRoute('/api/booking/').methods({
  GET: async ({ request }) => {
    console.log(request);
    const auth = await fetchAuth();
    if (auth.token) {
      convex.setAuth(auth.token);
    }
    return new Response(JSON.stringify([{ name: 'test' }]), { status: 200 });
  },
});
