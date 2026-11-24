import { describe, it, expect, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createQueryClient, shouldRetry } from '@/app/queryClient'
import {
  resourceKeys,
  useResourceItem,
  useResourceList,
  useResourceRemove,
  useResourceSave,
} from './useResource'

function fakeResource() {
  const rows = [
    { id: 1, name: 'Berth 1' },
    { id: 2, name: 'Berth 2' },
  ]
  return {
    path: '/berths',
    list: vi.fn(async (params) => ({
      items: rows,
      meta: { page: params.page ?? 1, per_page: 2, total: 4 },
    })),
    get: vi.fn(async (id) => ({ id: Number(id), name: `Berth ${id} (full)` })),
    create: vi.fn(async (body) => ({ id: 3, ...body })),
    update: vi.fn(async (id, body) => ({ id, ...body })),
    remove: vi.fn(async () => {}),
  }
}

// Runs composables inside a component that shares one query client.
function withSetup(queryClient, setup) {
  let result
  mount(
    defineComponent({
      setup() {
        result = setup()
        return () => null
      },
    }),
    { global: { plugins: [[VueQueryPlugin, { queryClient }]] } },
  )
  return result
}

describe('useResourceList', () => {
  it('loads a page and exposes its rows and meta', async () => {
    const qc = createQueryClient()
    const res = fakeResource()
    const list = withSetup(qc, () => useResourceList(res, { page: 1 }))
    await flushPromises()
    expect(list.items.value).toHaveLength(2)
    expect(list.meta.value.total).toBe(4)
  })

  it('reloads when the filters change and keeps the old page meanwhile', async () => {
    const qc = createQueryClient()
    const res = fakeResource()
    const params = ref({ page: 1 })
    const list = withSetup(qc, () => useResourceList(res, params))
    await flushPromises()
    params.value = { page: 2 }
    await Promise.resolve()
    expect(list.items.value).toHaveLength(2)
    await flushPromises()
    expect(res.list).toHaveBeenLastCalledWith({ page: 2 })
    expect(list.meta.value.page).toBe(2)
  })

  it('shares loaded data: a second page using the same list does not reload it', async () => {
    const qc = createQueryClient()
    const res = fakeResource()
    withSetup(qc, () => useResourceList(res, { page: 1 }))
    await flushPromises()
    withSetup(qc, () => useResourceList(res, { page: 1 }))
    await flushPromises()
    expect(res.list).toHaveBeenCalledTimes(1)
  })
})

describe('useResourceItem', () => {
  it('shows a record from a loaded list at once', async () => {
    const qc = createQueryClient()
    const res = fakeResource()
    withSetup(qc, () => useResourceList(res, {}))
    await flushPromises()
    const item = withSetup(qc, () => useResourceItem(res, 2))
    expect(item.data.value).toEqual({ id: 2, name: 'Berth 2' })
    await flushPromises()
    expect(res.get).not.toHaveBeenCalled()
  })

  it('loads a record that no list holds, and waits while there is no id', async () => {
    const qc = createQueryClient()
    const res = fakeResource()
    const id = ref(null)
    const item = withSetup(qc, () => useResourceItem(res, id))
    await flushPromises()
    expect(res.get).not.toHaveBeenCalled()
    id.value = 9
    await flushPromises()
    expect(item.data.value).toEqual({ id: 9, name: 'Berth 9 (full)' })
  })
})

describe('saving and removing', () => {
  it('a save updates the cached record and reloads the lists', async () => {
    const qc = createQueryClient()
    const res = fakeResource()
    withSetup(qc, () => useResourceList(res, {}))
    await flushPromises()
    const save = withSetup(qc, () => useResourceSave(res))
    await save.mutateAsync({ id: 1, name: 'Renamed', updated_at: 'v1' })
    await flushPromises()
    expect(res.update).toHaveBeenCalledWith(1, { name: 'Renamed', updated_at: 'v1' })
    expect(qc.getQueryData(resourceKeys('/berths').detail(1)).name).toBe('Renamed')
    expect(res.list).toHaveBeenCalledTimes(2)
  })

  it('a save without id creates', async () => {
    const qc = createQueryClient()
    const res = fakeResource()
    const save = withSetup(qc, () => useResourceSave(res))
    await save.mutateAsync({ name: 'New' })
    expect(res.create).toHaveBeenCalledWith({ name: 'New' })
    expect(qc.getQueryData(resourceKeys('/berths').detail(3))).toEqual({ id: 3, name: 'New' })
  })

  it('a removal drops the cached record', async () => {
    const qc = createQueryClient()
    const res = fakeResource()
    qc.setQueryData(resourceKeys('/berths').detail(1), { id: 1 })
    const remove = withSetup(qc, () => useResourceRemove(res))
    await remove.mutateAsync(1)
    expect(qc.getQueryData(resourceKeys('/berths').detail(1))).toBeUndefined()
  })
})

describe('shouldRetry', () => {
  it('retries once on lost connection or server errors, never on 4xx', () => {
    expect(shouldRetry(0, { status: 0 })).toBe(true)
    expect(shouldRetry(0, { status: 503 })).toBe(true)
    expect(shouldRetry(1, { status: 503 })).toBe(false)
    expect(shouldRetry(0, { status: 404 })).toBe(false)
    expect(shouldRetry(0, { status: 403 })).toBe(false)
  })
})
