import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 min — don't refetch on every mount
      gcTime: 10 * 60 * 1000,    // 10 min — keep unused data in memory
      retry: 1,
      // Refetch stale data when the user returns to the tab after being away.
      // staleTime (5 min) prevents excessive refetches during normal use.
      refetchOnWindowFocus: true,
    },
  },
});
