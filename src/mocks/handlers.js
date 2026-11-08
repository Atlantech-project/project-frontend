// Mock API for tests (FE-034), with MSW: the same paths, answers and problem+json errors
// (RFC 9457, `code` + `message_key`) as the backend, from in-memory data. Test use only:
// never imported by the app.
import { http, HttpResponse } from 'msw'
import { PORT, profileOf, seedAuditLogs, seedUsers } from './fixtures'

const API = '*/api/v1'

// In-memory server state; resetMockDb() runs after every test.
export const db = { users: [], auditLogs: [], currentUserId: null }
export function resetMockDb() {
  db.users = seedUsers()
  db.auditLogs = seedAuditLogs()
  db.currentUserId = null
}
resetMockDb()

const MESSAGE_KEYS = {
  UNAUTHENTICATED: 'errors.unauthenticated',
  ACCOUNT_DISABLED: 'errors.account_disabled',
  VALIDATION_FAILED: 'errors.validation_failed',
  VERSION_CONFLICT: 'errors.version_conflict',
  NOT_FOUND: 'errors.not_found',
}

export function problem(status, code, extra = {}) {
  return HttpResponse.json(
    { type: 'about:blank', title: code, status, code, message_key: MESSAGE_KEYS[code], ...extra },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  )
}

const currentUser = () => db.users.find((u) => u.id === db.currentUserId) ?? null

function newPasswordErrors({ current_password, new_password, new_password_confirmation }, user) {
  const errors = {}
  if (!current_password) errors.current_password = ['validation.required']
  else if (current_password !== user.password)
    errors.current_password = ['validation.current_password']
  if (!new_password) errors.new_password = ['validation.required']
  else if (new_password.length < 8) errors.new_password = ['validation.min']
  else if (!/\p{L}/u.test(new_password) || !/\p{N}/u.test(new_password))
    errors.new_password = ['validation.password']
  else if (new_password === current_password) errors.new_password = ['validation.different']
  else if (new_password !== new_password_confirmation)
    errors.new_password = ['validation.confirmed']
  return errors
}

export const handlers = [
  http.get('*/sanctum/csrf-cookie', () => new HttpResponse(null, { status: 204 })),

  http.get(`${API}/system/info`, () => HttpResponse.json(PORT)),

  http.post(`${API}/auth/login`, async ({ request }) => {
    const { username, password } = await request.json()
    const user = db.users.find((u) => u.username === username)
    if (!user || user.password !== password) return problem(401, 'UNAUTHENTICATED')
    if (!user.active) return problem(403, 'ACCOUNT_DISABLED')
    db.currentUserId = user.id
    return HttpResponse.json(profileOf(user))
  }),

  http.get(`${API}/auth/me`, () => {
    const user = currentUser()
    return user ? HttpResponse.json(profileOf(user)) : problem(401, 'UNAUTHENTICATED')
  }),

  http.post(`${API}/auth/change-password`, async ({ request }) => {
    const user = currentUser()
    if (!user) return problem(401, 'UNAUTHENTICATED')
    const body = await request.json()
    const errors = newPasswordErrors(body, user)
    if (Object.keys(errors).length) return problem(422, 'VALIDATION_FAILED', { errors })
    user.password = body.new_password
    user.must_change_password = false
    return HttpResponse.json(profileOf(user))
  }),

  http.post(`${API}/auth/logout`, () => {
    db.currentUserId = null
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${API}/audit-logs`, ({ request }) => {
    if (!currentUser()) return problem(401, 'UNAUTHENTICATED')
    const query = new URL(request.url).searchParams
    const page = Number(query.get('page') ?? 1)
    const perPage = Number(query.get('per_page') ?? 20)
    let rows = db.auditLogs
    if (query.get('entity_type'))
      rows = rows.filter((r) => r.entity_type === query.get('entity_type'))
    if (query.get('action')) rows = rows.filter((r) => r.action === query.get('action'))
    return HttpResponse.json({
      data: rows.slice((page - 1) * perPage, page * perPage),
      meta: { page, per_page: perPage, total: rows.length },
    })
  }),
]

// Signs a fixture user in without a login request, for tests that start signed in.
export function signInAs(username) {
  const user = db.users.find((u) => u.username === username)
  db.currentUserId = user.id
  return profileOf(user)
}
