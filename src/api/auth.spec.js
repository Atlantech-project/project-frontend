import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./http', () => ({ http: { get: vi.fn(), post: vi.fn() }, resetCsrfCookie: vi.fn() }))
const { http, resetCsrfCookie } = await import('./http')
const auth = await import('./auth')

beforeEach(() => vi.clearAllMocks())

describe('auth api', () => {
  it('login posts the credentials and does not count 401 as a lost session', async () => {
    http.post.mockResolvedValue({ data: { id: 1 } })
    await expect(auth.login({ username: 'port.gm', password: 'p' })).resolves.toEqual({ id: 1 })
    expect(http.post).toHaveBeenCalledWith(
      '/auth/login',
      { username: 'port.gm', password: 'p' },
      { skipSessionLost: true },
    )
  })

  it('change-password sends the API field names', async () => {
    http.post.mockResolvedValue({ data: { must_change_password: false } })
    await auth.changePassword({
      currentPassword: 'old',
      newPassword: 'new12345',
      confirmation: 'new12345',
    })
    expect(http.post).toHaveBeenCalledWith('/auth/change-password', {
      current_password: 'old',
      new_password: 'new12345',
      new_password_confirmation: 'new12345',
    })
  })

  it('logout drops the XSRF cookie even when it fails', async () => {
    http.post.mockRejectedValue(new Error('x'))
    await expect(auth.logout()).rejects.toThrow()
    expect(resetCsrfCookie).toHaveBeenCalled()
  })
})
