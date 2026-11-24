import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchSystemInfo } from '@/api/system'

// The port this server belongs to (CT-04). Pages still work if it can't be loaded.
export function usePortName() {
  const { data } = useQuery({
    queryKey: ['system', 'info'],
    queryFn: fetchSystemInfo,
    staleTime: Infinity,
    retry: false,
  })
  return computed(() => data.value?.port_name ?? '')
}
