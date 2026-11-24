// New password rules, the same as the API (ChangePasswordRequest): at least 8 characters, with
// letters and numbers (Laravel Password::min(8)->letters()->numbers(), any script counts).
export const MIN_PASSWORD_LENGTH = 8

export function isStrongEnough(password) {
  return (
    typeof password === 'string' &&
    [...password].length >= MIN_PASSWORD_LENGTH &&
    /\p{L}/u.test(password) &&
    /\p{N}/u.test(password)
  )
}
