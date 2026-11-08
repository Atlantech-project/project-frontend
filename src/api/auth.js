// Sign-in endpoints (CT-03, port-api.yaml /auth/*). Each returns plain data or throws ApiError.
import { http, resetCsrfCookie } from './http'

// The signed-in user's profile: { id, name, role, terminal_ids, must_change_password }.
export async function fetchMe() {
  const { data } = await http.get('/auth/me', { skipSessionLost: true })
  return data
}

// 401 here means a wrong username or password, not a lost session.
export async function login({ username, password }) {
  const { data } = await http.post('/auth/login', { username, password }, { skipSessionLost: true })
  return data
}

export async function logout() {
  try {
    await http.post('/auth/logout', null, { skipSessionLost: true })
  } finally {
    // Laravel starts a new session, so the next write needs a new XSRF cookie.
    resetCsrfCookie()
  }
}

// Returns the updated profile, with must_change_password false.
export async function changePassword({ currentPassword, newPassword, confirmation }) {
  const { data } = await http.post('/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
    new_password_confirmation: confirmation,
  })
  return data
}
