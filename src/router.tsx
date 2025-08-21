import { QueryClient, MutationCache } from '@tanstack/react-query';
import {
  createRouter as createTanStackRouter,
  ErrorComponent,
} from '@tanstack/react-router';
import { routerWithQueryClient } from '@tanstack/react-router-with-query';
import { ConvexQueryClient } from '@convex-dev/react-query';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { routeTree } from './routeTree.gen';

export function createRouter() {
  const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;

  if (!CONVEX_URL) {
    throw new Error('CONVEX_VITE_URL not set');
  }

  const convex = new ConvexReactClient(CONVEX_URL, {
    unsavedChangesWarning: false,
  });
  const convexQueryClient = new ConvexQueryClient(convex);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 hours
        retry: 0,
        refetchOnWindowFocus: false,
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  });

  convexQueryClient.connect(queryClient);

  const router = routerWithQueryClient(
    createTanStackRouter({
      routeTree,
      scrollRestoration: true,
      defaultPreload: 'intent',
      context: {
        queryClient,
        convexClient: convex,
        convexQueryClient,
      },
      Wrap: ({ children }) => (
        <ConvexProvider client={convexQueryClient.convexClient}>
          {children}
        </ConvexProvider>
      ),
    }),
    queryClient,
  );

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
