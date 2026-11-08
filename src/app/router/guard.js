// Route guard (FE-021): who may open which page.
//   meta.public   page anyone can open (landing, sign-in, errors)
//   meta.roles    web roles allowed; leave out for "any signed-in web user"
// Order: signed in -> new password chosen (FE-026) -> web role (DEC-48) -> page role.
import { isWebRole } from '@/app/roles'
import { HOME } from '@/features/auth/redirect'

export const ACCESS_DENIED_REASONS = Object.freeze(['permissions', 'mobileOnly'])

const denied = (reason, to) => ({
  name: 'access-denied',
  query: { reason, from: to.fullPath },
  replace: true,
})

export function createAuthGuard(getSession) {
  return async function authGuard(to) {
    const session = getSession()

    if (to.meta.public) {
      // A signed-in user who opens the sign-in page goes on to the app.
      if (to.name === 'login') {
        await session.restore().catch(() => {})
        if (session.isSignedIn)
          return session.mustChangePassword ? { name: 'change-password' } : HOME
      }
      return true
    }

    try {
      await session.restore()
    } catch {
      // Server unreachable: treat as signed out; the sign-in page shows the connection problem.
    }
    if (!session.isSignedIn) return { name: 'login', query: { redirect: to.fullPath } }

    if (session.mustChangePassword) {
      return to.name === 'change-password'
        ? true
        : { name: 'change-password', query: { redirect: to.fullPath } }
    }
    if (to.name === 'change-password') return HOME

    if (to.name === 'access-denied') return true
    if (!isWebRole(session.role)) return denied('mobileOnly', to)
    if (to.meta.roles && !to.meta.roles.includes(session.role)) return denied('permissions', to)
    return true
  }
}

// When the session ends while the user is on a signed-in page (expired, or logged out),
// go to the sign-in page and come back to this page afterwards.
export function redirectOnSignOut(router) {
  return () => {
    const current = router.currentRoute.value
    if (current.meta.public) return
    router.replace({ name: 'login', query: { redirect: current.fullPath } })
  }
}
