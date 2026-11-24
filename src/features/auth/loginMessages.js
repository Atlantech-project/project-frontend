// Which message the sign-in page shows under the button, from Figma P-16 states.
// Returns an i18n key prefix: login.messages.<name>.title / .body

const BY_CODE = {
  UNAUTHENTICATED: 'invalidCredentials',
  ACCOUNT_DISABLED: 'accountDisabled',
  TOO_MANY_ATTEMPTS: 'tooManyAttempts',
  SESSION_EXPIRED: 'sessionExpired',
  NETWORK_ERROR: 'network',
  SERVICE_UNAVAILABLE: 'unavailable',
}

// error: ApiError from the last sign-in try; endedReason: why the previous session ended.
export function loginMessage({ error = null, endedReason = null } = {}) {
  if (error) return BY_CODE[error.code] ?? 'generic'
  if (endedReason === 'SESSION_EXPIRED' || endedReason === 'UNAUTHENTICATED')
    return 'sessionExpired'
  return 'staffOnly'
}

// Errors that the user can fix by typing again get the strong (alert) announcement.
export const isProblem = (name) => name !== 'staffOnly'
