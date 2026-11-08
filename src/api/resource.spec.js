import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./http', () => ({
  http: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))
const { http } = await import('./http')
const { createResource } = await import('./resource')

const users = createResource('/users')
beforeEach(() => vi.clearAllMocks())

describe('createResource', () => {
  it('lists with filters and splits rows from the page meta', async () => {
    http.get.mockResolvedValue({
      data: { data: [{ id: 1 }], meta: { page: 2, per_page: 20, total: 21 } },
    })
    await expect(users.list({ page: 2 })).resolves.toEqual({
      items: [{ id: 1 }],
      meta: { page: 2, per_page: 20, total: 21 },
    })
    expect(http.get).toHaveBeenCalledWith('/users', { params: { page: 2 } })
  })

  it('reads, creates, updates and deletes one record', async () => {
    http.get.mockResolvedValue({ data: { id: 7 } })
    http.post.mockResolvedValue({ data: { id: 8 } })
    http.patch.mockResolvedValue({ data: { id: 7, name: 'b' } })
    http.delete.mockResolvedValue({})
    await expect(users.get(7)).resolves.toEqual({ id: 7 })
    await expect(users.create({ name: 'a' })).resolves.toEqual({ id: 8 })
    await expect(users.update(7, { name: 'b', updated_at: 'v1' })).resolves.toEqual({
      id: 7,
      name: 'b',
    })
    await users.remove(7)
    expect(http.get).toHaveBeenCalledWith('/users/7')
    expect(http.patch).toHaveBeenCalledWith('/users/7', { name: 'b', updated_at: 'v1' })
    expect(http.delete).toHaveBeenCalledWith('/users/7')
  })

  it('escapes ids in the address', async () => {
    http.get.mockResolvedValue({ data: {} })
    await users.get('a/b')
    expect(http.get).toHaveBeenCalledWith('/users/a%2Fb')
  })
})
