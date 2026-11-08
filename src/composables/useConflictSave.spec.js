import { describe, it, expect, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createQueryClient } from '@/app/queryClient'
import { ApiError } from '@/api/errors'
import { resourceKeys } from './useResource'
import { useConflictSave } from './useConflictSave'

const conflictError = (current) => new ApiError({ status: 409, code: 'VERSION_CONFLICT', current })

function setup(resource, options) {
  const queryClient = createQueryClient()
  let result
  mount(
    defineComponent({
      setup() {
        result = useConflictSave(resource, options)
        return () => null
      },
    }),
    { global: { plugins: [[VueQueryPlugin, { queryClient }]] } },
  )
  return { ...result, queryClient }
}

const berths = (overrides = {}) => ({
  path: '/berths',
  list: vi.fn(),
  get: vi.fn(async (id) => ({ id, name: 'From server', updated_at: 'v3' })),
  create: vi.fn(),
  update: vi.fn(async (id, body) => ({ id, ...body })),
  remove: vi.fn(),
  ...overrides,
})

describe('useConflictSave', () => {
  it('returns the saved record when there is no conflict', async () => {
    const s = setup(berths())
    await expect(s.submit({ id: 1, name: 'A', updated_at: 'v1' })).resolves.toMatchObject({
      name: 'A',
    })
    expect(s.hasConflict.value).toBe(false)
  })

  it('opens the conflict instead of throwing on 409', async () => {
    const current = { id: 1, name: 'Changed elsewhere', updated_at: 'v2' }
    const s = setup(berths({ update: vi.fn().mockRejectedValue(conflictError(current)) }))
    await expect(s.submit({ id: 1, name: 'Mine', updated_at: 'v1' })).resolves.toBeNull()
    expect(s.hasConflict.value).toBe(true)
  })

  it('reload hands the current record from the 409 answer to the form', async () => {
    const current = { id: 1, name: 'Changed elsewhere', updated_at: 'v2' }
    const onReload = vi.fn()
    const res = berths({ update: vi.fn().mockRejectedValue(conflictError(current)) })
    const s = setup(res, { onReload })
    await s.submit({ id: 1, name: 'Mine', updated_at: 'v1' })
    await s.reload()
    expect(onReload).toHaveBeenCalledWith(current)
    expect(res.get).not.toHaveBeenCalled()
    expect(s.queryClient.getQueryData(resourceKeys('/berths').detail(1))).toEqual(current)
    expect(s.hasConflict.value).toBe(false)
  })

  it('reload asks the server when the 409 answer has no record', async () => {
    const onReload = vi.fn()
    const res = berths({ update: vi.fn().mockRejectedValue(conflictError(null)) })
    const s = setup(res, { onReload })
    await s.submit({ id: 1, name: 'Mine', updated_at: 'v1' })
    await s.reload()
    expect(res.get).toHaveBeenCalledWith(1)
    expect(onReload).toHaveBeenCalledWith({ id: 1, name: 'From server', updated_at: 'v3' })
  })

  it('cancel keeps nothing open and does not touch the form', async () => {
    const onReload = vi.fn()
    const s = setup(berths({ update: vi.fn().mockRejectedValue(conflictError(null)) }), {
      onReload,
    })
    await s.submit({ id: 1, name: 'Mine', updated_at: 'v1' })
    s.hasConflict.value = false
    expect(s.conflict.value).toBeNull()
    expect(onReload).not.toHaveBeenCalled()
  })

  it('other errors still throw', async () => {
    const s = setup(
      berths({
        update: vi.fn().mockRejectedValue(new ApiError({ status: 422, code: 'VALIDATION_FAILED' })),
      }),
    )
    await expect(s.submit({ id: 1 })).rejects.toBeInstanceOf(ApiError)
    expect(s.hasConflict.value).toBe(false)
  })
})
