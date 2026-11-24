// Data loaders for API resources (FE-031), on TanStack Query. Pages share one cache, so a
// record loaded by a list opens its detail page at once, and a save updates every page.
import { computed, toValue } from 'vue'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

// Cache keys: [path] for everything of a resource, then 'list' + filters or 'detail' + id.
export function resourceKeys(path) {
  return {
    all: [path],
    lists: [path, 'list'],
    list: (params) => [path, 'list', params ?? {}],
    detail: (id) => [path, 'detail', String(id)],
  }
}

// Server data changed (SSE event or a save elsewhere): reload what is on screen.
export function invalidateResource(queryClient, path) {
  return queryClient.invalidateQueries({ queryKey: resourceKeys(path).all })
}

// A page of a list. `params` (filters, page) may be a ref or getter; while the next page
// loads, the previous one stays on screen.
export function useResourceList(resource, params = {}) {
  const keys = resourceKeys(resource.path)
  const query = useQuery({
    queryKey: computed(() => keys.list(toValue(params))),
    queryFn: () => resource.list(toValue(params)),
    placeholderData: keepPreviousData,
  })
  return {
    ...query,
    items: computed(() => query.data.value?.items ?? []),
    meta: computed(() => query.data.value?.meta ?? null),
  }
}

// One record. Shown straight away from any loaded list that holds it, then refreshed when
// that copy is stale. Waits while `id` is empty.
export function useResourceItem(resource, id) {
  const queryClient = useQueryClient()
  const keys = resourceKeys(resource.path)
  const fromLists = () => {
    const wanted = String(toValue(id))
    for (const [key, page] of queryClient.getQueriesData({ queryKey: keys.lists })) {
      const item = page?.items?.find((row) => String(row.id) === wanted)
      if (item) return { item, updatedAt: queryClient.getQueryState(key)?.dataUpdatedAt }
    }
    return null
  }
  return useQuery({
    queryKey: computed(() => keys.detail(toValue(id))),
    queryFn: () => resource.get(toValue(id)),
    enabled: computed(() => toValue(id) != null && toValue(id) !== ''),
    initialData: () => fromLists()?.item,
    initialDataUpdatedAt: () => fromLists()?.updatedAt,
  })
}

// Create (no id) or update ({ id, ...fields }). The saved record replaces the cached one and
// lists reload, since it may now sort or filter differently.
export function useResourceSave(resource) {
  const queryClient = useQueryClient()
  const keys = resourceKeys(resource.path)
  return useMutation({
    mutationFn: ({ id, ...body }) =>
      id == null ? resource.create(body) : resource.update(id, body),
    onSuccess: (saved, { id }) => {
      const savedId = saved?.id ?? id
      if (savedId != null && saved) queryClient.setQueryData(keys.detail(savedId), saved)
      return queryClient.invalidateQueries({ queryKey: keys.lists })
    },
  })
}

export function useResourceRemove(resource) {
  const queryClient = useQueryClient()
  const keys = resourceKeys(resource.path)
  return useMutation({
    mutationFn: (id) => resource.remove(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: keys.detail(id) })
      return queryClient.invalidateQueries({ queryKey: keys.lists })
    },
  })
}
