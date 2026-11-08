// Where to go after signing in: the page the user was headed to, if it is on this site.
// Until the router guard (FE-021) picks a home page per role, anything else goes to '/'.
export function safeRedirect(redirect) {
  return typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
    ? redirect
    : '/'
}
