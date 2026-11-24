// Signed-in users never land on the public landing page ('/'). Until the role home pages exist
// (P-17), they go to the temporary home page.
export const HOME = '/home'

// Where to go after signing in: the page the user was headed to, if it is on this site.
export function safeRedirect(redirect) {
  return typeof redirect === 'string' &&
    redirect.startsWith('/') &&
    !redirect.startsWith('//') &&
    redirect !== '/'
    ? redirect
    : HOME
}

// After sign-in (or the first password change): field roles have no web pages (DEC-48), so they
// see P-20 right away; everyone else goes on.
export function afterSignIn(session, redirect) {
  if (!session.canUseWeb) return { name: 'access-denied', query: { reason: 'mobileOnly' } }
  return safeRedirect(redirect)
}
