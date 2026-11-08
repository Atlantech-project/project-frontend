import { describe, it, expect, vi } from 'vitest'
import { createAuthGuard, redirectOnSignOut } from './guard'

function fakeSession({ user = null, fails = false } = {}) {
  return {
    user,
    get isSignedIn() {
      return this.user !== null
    },
    get role() {
      return this.user?.role ?? null
    },
    get mustChangePassword() {
      return this.user?.must_change_password === true
    },
    restore: vi.fn(() => (fails ? Promise.reject(new Error('down')) : Promise.resolve(user))),
  }
}

const staff = { role: 'PORT_STAFF', must_change_password: false }
const route = (name, { meta = {}, fullPath = `/${name}` } = {}) => ({ name, meta, fullPath })
const guardFor = (session) => createAuthGuard(() => session)

describe('auth guard', () => {
  it('lets anyone open public pages without asking the server', async () => {
    const s = fakeSession()
    expect(await guardFor(s)(route('landing', { meta: { public: true } }))).toBe(true)
    expect(s.restore).not.toHaveBeenCalled()
  })

  it('sends a signed-out visitor to sign in, then back', async () => {
    const result = await guardFor(fakeSession())(route('vessels', { fullPath: '/vessels?x=1' }))
    expect(result).toEqual({ name: 'login', query: { redirect: '/vessels?x=1' } })
  })

  it('treats an unreachable server as signed out', async () => {
    const result = await guardFor(fakeSession({ fails: true }))(route('vessels'))
    expect(result).toMatchObject({ name: 'login' })
  })

  it('moves a signed-in user away from the sign-in page', async () => {
    expect(
      await guardFor(fakeSession({ user: staff }))(route('login', { meta: { public: true } })),
    ).toBe('/')
    const first = fakeSession({ user: { ...staff, must_change_password: true } })
    expect(await guardFor(first)(route('login', { meta: { public: true } }))).toEqual({
      name: 'change-password',
    })
  })

  it('keeps a first sign-in on the password change until it is done', async () => {
    const s = fakeSession({ user: { ...staff, must_change_password: true } })
    expect(await guardFor(s)(route('vessels'))).toEqual({
      name: 'change-password',
      query: { redirect: '/vessels' },
    })
    expect(await guardFor(s)(route('change-password'))).toBe(true)
    expect(await guardFor(fakeSession({ user: staff }))(route('change-password'))).toBe('/')
  })

  it('shows P-20 "mobile only" to field roles and users with no role', async () => {
    for (const role of ['MARINE_PILOT', 'TUG_MASTER', 'TERMINAL_SUPERVISOR', null]) {
      const result = await guardFor(fakeSession({ user: { ...staff, role } }))(route('vessels'))
      expect(result).toMatchObject({ name: 'access-denied', query: { reason: 'mobileOnly' } })
    }
  })

  it('shows P-20 "permissions" when the page is for other roles', async () => {
    const page = route('audit', { meta: { roles: ['PORT_GM'] } })
    expect(await guardFor(fakeSession({ user: staff }))(page)).toMatchObject({
      name: 'access-denied',
      query: { reason: 'permissions', from: '/audit' },
    })
    expect(await guardFor(fakeSession({ user: { ...staff, role: 'PORT_GM' } }))(page)).toBe(true)
  })

  it('lets a field role see P-20 itself', async () => {
    const s = fakeSession({ user: { ...staff, role: 'MARINE_PILOT' } })
    expect(await guardFor(s)(route('access-denied'))).toBe(true)
  })
})

describe('redirectOnSignOut', () => {
  it('goes to sign-in from a signed-in page only', () => {
    const replace = vi.fn()
    const router = { currentRoute: { value: route('vessels') }, replace }
    redirectOnSignOut(router)()
    expect(replace).toHaveBeenCalledWith({ name: 'login', query: { redirect: '/vessels' } })

    replace.mockClear()
    router.currentRoute.value = route('landing', { meta: { public: true } })
    redirectOnSignOut(router)()
    expect(replace).not.toHaveBeenCalled()
  })
})
