// Where to go after signing in: the page the user was headed to, if it is on this site.
// Until the role home pages exist (P-17), anything else goes to '/'.
export function safeRedirect(redirect) {
  return typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
    ? redirect
    : '/'
}

// After sign-in (or the first password change): field roles have no web pages (DEC-48), so they
// see P-20 right away; everyone else goes on.
export function afterSignIn(session, redirect) {
  if (!session.canUseWeb) return { name: 'access-denied', query: { reason: 'mobileOnly' } }
  return safeRedirect(redirect)
}
