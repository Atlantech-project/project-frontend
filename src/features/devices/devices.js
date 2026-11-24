// A user's registered mobile devices for P-25 (FE-046), from GET /users/{user}/devices
// (port-api.yaml UserDevice). The push token is never sent to the web.
import { computed, toValue } from 'vue'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/vue-query'
import { http } from '@/api/http'
import { users } from '@/features/users/users'

export const PAGE_SIZE = 25

const base = (userId) => `/users/${encodeURIComponent(userId)}/devices`

export const devices = Object.freeze({
  async list(userId, params = {}) {
    const { data } = await http.get(base(userId), { params })
    return { items: data.data ?? [], meta: data.meta ?? null }
  },
  revoke: async (userId, id) => (await http.post(`${base(userId)}/${id}/revoke`)).data,
  restore: async (userId, id) => (await http.post(`${base(userId)}/${id}/restore`)).data,
  revokeAll: async (userId) => (await http.post(`${base(userId)}/revoke-all`)).data,
})

// Cached under the users resource, so anything that reloads users reloads devices too.
export const deviceKeys = (userId) => [users.path, 'devices', String(userId)]

export function useDeviceList(userId, params = {}) {
  const query = useQuery({
    queryKey: computed(() => [...deviceKeys(toValue(userId)), toValue(params)]),
    queryFn: () => devices.list(toValue(userId), toValue(params)),
    enabled: computed(() => toValue(userId) != null && toValue(userId) !== ''),
    placeholderData: keepPreviousData,
  })
  return {
    ...query,
    items: computed(() => query.data.value?.items ?? []),
    meta: computed(() => query.data.value?.meta ?? null),
  }
}

export function useRefreshDevices(userId) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: deviceKeys(toValue(userId)) })
}

export const deviceStatus = (device) => (device.revoked_at ? 'REVOKED' : 'ACTIVE')
