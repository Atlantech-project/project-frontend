import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ApiError } from '@/api/errors'

vi.mock('@/api/auth', () => ({
  fetchMe: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  changePassword: vi.fn(),
}))
vi.mock('@/api/http', () => ({ setSessionLostHandler: vi.fn() }))

const auth = await import('@/api/auth')
const http = await import('@/api/http')
const { useSessionStore, installSessionHandling } = await import('./session')

const staff = {
  id: 3,
  name: 'Port Staff',
  role: 'PORT_STAFF',
  terminal_ids: [],
  must_change_password: false,
}
const newUser = { ...staff, must_change_password: true }

let pinia
beforeEach(() => {
  vi.clearAllMocks()
  pinia = createPinia()
  setActivePinia(pinia)
})

describe('session store', () => {
  it('restores the signed-in user from /auth/me once', async () => {
    auth.fetchMe.mockResolvedValue(staff)
    const s = useSessionStore()
    await Promise.all([s.restore(), s.restore()])
    await s.restore()
    expect(auth.fetchMe).toHaveBeenCalledTimes(1)
    expect(s.status).toBe('ready')
    expect(s.isSignedIn).toBe(true)
    expect(s.role).toBe('PORT_STAFF')
    expect(s.canUseWeb).toBe(true)
  })

  it('treats 401 from /auth/me as nobody signed in', async () => {
    auth.fetchMe.mockRejectedValue(new ApiError({ status: 401, code: 'UNAUTHENTICATED' }))
    const s = useSessionStore()
    await expect(s.restore()).resolves.toBeNull()
    expect(s.isSignedIn).toBe(false)
    expect(s.status).toBe('ready')
  })

  it('passes other errors on, signed out', async () => {
    auth.fetchMe.mockRejectedValue(new ApiError({ code: 'NETWORK_ERROR' }))
    const s = useSessionStore()
    await expect(s.restore()).rejects.toMatchObject({ code: 'NETWORK_ERROR' })
    expect(s.isSignedIn).toBe(false)
  })

  it('logs in, flags the forced password change, then clears it', async () => {
    auth.login.mockResolvedValue(newUser)
    auth.changePassword.mockResolvedValue(staff)
    const s = useSessionStore()
    await s.login({ username: 'port.staff', password: 'x' })
    expect(auth.login).toHaveBeenCalledWith({ username: 'port.staff', password: 'x' })
    expect(s.mustChangePassword).toBe(true)
    await s.changePassword({
      currentPassword: 'x',
      newPassword: 'abc12345',
      confirmation: 'abc12345',
    })
    expect(s.mustChangePassword).toBe(false)
  })

  it('a failed login keeps nobody signed in', async () => {
    auth.login.mockRejectedValue(new ApiError({ status: 401, code: 'UNAUTHENTICATED' }))
    const s = useSessionStore()
    await expect(s.login({ username: 'a', password: 'b' })).rejects.toBeInstanceOf(ApiError)
    expect(s.isSignedIn).toBe(false)
  })

  it('logout forgets the user even if the server call fails', async () => {
    auth.login.mockResolvedValue(staff)
    auth.logout.mockRejectedValue(new ApiError({ code: 'NETWORK_ERROR' }))
    const s = useSessionStore()
    await s.login({ username: 'a', password: 'b' })
    await s.logout().catch(() => {})
    expect(s.isSignedIn).toBe(false)
  })

  it('a lost session signs out, remembers why and runs onSignedOut', async () => {
    const onSignedOut = vi.fn()
    const s = installSessionHandling(pinia, { onSignedOut })
    const handler = http.setSessionLostHandler.mock.calls[0][0]
    auth.login.mockResolvedValue(staff)
    await s.login({ username: 'a', password: 'b' })

    handler(new ApiError({ status: 419, code: 'SESSION_EXPIRED' }))
    expect(s.isSignedIn).toBe(false)
    expect(s.endedReason).toBe('SESSION_EXPIRED')
    expect(onSignedOut).toHaveBeenCalledTimes(1)
  })

  it('field roles cannot use the web app', async () => {
    auth.login.mockResolvedValue({ ...staff, role: 'MARINE_PILOT' })
    const s = useSessionStore()
    await s.login({ username: 'a', password: 'b' })
    expect(s.canUseWeb).toBe(false)
  })
})
