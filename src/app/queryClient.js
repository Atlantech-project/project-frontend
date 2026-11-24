import { QueryClient } from '@tanstack/vue-query'

// How long loaded data counts as fresh: pages opened within this time reuse it without a
// request. SSE events (CT-05) mark data stale sooner when the server says it changed.
export const STALE_TIME = 30_000

// A request is retried once only when it may succeed next time: lost connection or a server
// error. A 4xx answer (not found, forbidden, invalid) won't change by asking again.
export function shouldRetry(failureCount, error) {
  if (failureCount >= 1) return false
  return !error?.status || error.status >= 500
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      // SSE events tell us when data changes (CT-05), so no background refetch on focus.
      queries: { staleTime: STALE_TIME, refetchOnWindowFocus: false, retry: shouldRetry },
      mutations: { retry: false },
    },
  })
}
