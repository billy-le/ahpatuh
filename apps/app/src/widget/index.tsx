import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
export function WidgetContainer({ children }: React.PropsWithChildren) {
  const queryClient = new QueryClient({});

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export function Widget() {
  const { data, isPending, error } = useQuery({
    queryKey: ['bookings'],
    queryFn: async function () {
      console.log(import.meta.env);
      await fetch(import.meta.env.VITE_BASE_URL + '/api/booking').then(
        (res) => {
          return res.json();
        },
      );
    },
  });
  console.log(data, isPending, error);
  return <WidgetContainer>HI</WidgetContainer>;
}
