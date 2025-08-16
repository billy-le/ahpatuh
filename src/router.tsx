import { QueryClient, MutationCache } from '@tanstack/react-query';
import { createRouter as createTanStackRouter, ErrorComponent } from '@tanstack/react-router'
import { routerWithQueryClient } from '@tanstack/react-router-with-query';
import { routeTree } from './routeTree.gen'

export function createRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 hours
        retry: 0,
        refetchOnWindowFocus: false,
      }
    },
  });

  const router = routerWithQueryClient(
    createTanStackRouter({
      routeTree,
      scrollRestoration: true,
      context: {
        queryClient,
      }
    }),
    queryClient
  )

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
