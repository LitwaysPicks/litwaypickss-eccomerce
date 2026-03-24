import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 min — don't refetch on every mount
      gcTime: 10 * 60 * 1000,    // 10 min — keep unused data in memory
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
