// Who is signed in (FE-027). The server session (Sanctum cookie) is the truth; this store keeps
// the profile from /auth/me so pages and the router guard (FE-021) can read it.
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import * as auth from '@/api/auth'
import { setSessionLostHandler } from '@/api/http'
import { isWebRole } from '@/app/roles'

export const useSessionStore = defineStore('session', () => {
  const user = ref(null)
  // unknown: not asked yet · loading: /auth/me in flight · ready: we know who (or nobody)
  const status = ref('unknown')
  // Why the last session ended on its own (SESSION_EXPIRED, UNAUTHENTICATED), for the login page.
  const endedReason = ref(null)
  let pending = null
  // The temporary password typed at a first sign-in, kept in memory only (never stored) so the
  // forced password change (FE-026) can send it as current_password without asking again.
  // Lost on reload; the page then asks for it.
  let temporaryPassword = null

  const isSignedIn = computed(() => user.value !== null)
  const role = computed(() => user.value?.role ?? null)
  const mustChangePassword = computed(() => user.value?.must_change_password === true)
  const canUseWeb = computed(() => isWebRole(role.value))

  function setUser(profile) {
    user.value = profile
    status.value = 'ready'
    if (profile) endedReason.value = null
    else temporaryPassword = null
  }

  // Ask the server who is signed in. Called once on start (e.g. after a page reload); later calls
  // reuse the answer unless `force` is set.
  function restore({ force = false } = {}) {
    if (status.value === 'ready' && !force) return Promise.resolve(user.value)
    pending ??= (async () => {
      status.value = 'loading'
      try {
        setUser(await auth.fetchMe())
      } catch (error) {
        // 401: nobody is signed in. Anything else (server down) also leaves us signed out,
        // but the error goes back to the caller so it can show it.
        setUser(null)
        if (error.status !== 401) throw error
      } finally {
        pending = null
      }
      return user.value
    })()
    return pending
  }

  async function login(credentials) {
    setUser(await auth.login(credentials))
    temporaryPassword = mustChangePassword.value ? credentials.password : null
    return user.value
  }

  const hasTemporaryPassword = () => temporaryPassword !== null

  // currentPassword defaults to the temporary password from this sign-in.
  async function changePassword({
    currentPassword = temporaryPassword,
    newPassword,
    confirmation,
  }) {
    setUser(await auth.changePassword({ currentPassword, newPassword, confirmation }))
    temporaryPassword = null
    return user.value
  }

  // The kept temporary password was rejected (changed elsewhere): ask the user for it instead.
  function forgetTemporaryPassword() {
    temporaryPassword = null
  }

  // Signs out on the server, then forgets the user even if the server call failed.
  async function logout() {
    try {
      await auth.logout()
    } finally {
      setUser(null)
    }
  }

  // The API said the session is gone (expired or signed out elsewhere).
  function sessionLost(error) {
    if (!user.value) return
    endedReason.value = error?.code ?? 'UNAUTHENTICATED'
    setUser(null)
  }

  return {
    user,
    status,
    endedReason,
    isSignedIn,
    role,
    mustChangePassword,
    canUseWeb,
    restore,
    login,
    hasTemporaryPassword,
    forgetTemporaryPassword,
    changePassword,
    logout,
    sessionLost,
  }
})

// Connect the API client to the store: a lost session signs the user out here too.
// `onSignedOut` runs whenever a signed-in user goes away (logout or lost session), so cached
// server data from that user (TanStack Query) can be dropped.
export function installSessionHandling(pinia, { onSignedOut } = {}) {
  const session = useSessionStore(pinia)
  setSessionLostHandler((error) => session.sessionLost(error))
  if (onSignedOut) {
    watch(
      () => session.user,
      (now, before) => {
        if (before && !now) onSignedOut()
      },
      { flush: 'sync' },
    )
  }
  return session
}
