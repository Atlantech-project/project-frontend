// Mock API for tests (FE-034), with MSW: the same paths, answers and problem+json errors
// (RFC 9457, `code` + `message_key`) as the backend, from in-memory data. Test use only:
// never imported by the app.
import { http, HttpResponse } from 'msw'
import { PORT, apiUserOf, profileOf, seedAuditLogs, seedDevices, seedUsers } from './fixtures'

const API = '*/api/v1'

// In-memory server state; resetMockDb() runs after every test.
export const db = { users: [], auditLogs: [], devices: [], currentUserId: null }
export function resetMockDb() {
  db.users = seedUsers()
  db.auditLogs = seedAuditLogs()
  db.devices = seedDevices()
  db.currentUserId = null
}
resetMockDb()

const MESSAGE_KEYS = {
  UNAUTHENTICATED: 'errors.unauthenticated',
  ACCOUNT_DISABLED: 'errors.account_disabled',
  VALIDATION_FAILED: 'errors.validation_failed',
  VERSION_CONFLICT: 'errors.version_conflict',
  NOT_FOUND: 'errors.not_found',
  CONFLICT: 'errors.conflict',
}

export function problem(status, code, extra = {}) {
  return HttpResponse.json(
    {
      type: `https://atlantech.io/errors/${code.toLowerCase().replaceAll('_', '-')}`,
      title: code,
      status,
      code,
      message_key: MESSAGE_KEYS[code] ?? `errors.${code.toLowerCase()}`,
      detail: code,
      ...extra,
    },
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
    if (query.get('from')) rows = rows.filter((r) => r.occurred_at >= query.get('from'))
    if (query.get('q')) {
      const text = query.get('q').toLowerCase()
      rows = rows.filter((r) =>
        [r.actor?.name, r.actor?.username].some((v) => v?.toLowerCase().includes(text)),
      )
    }
    return HttpResponse.json({
      data: rows.slice((page - 1) * perPage, page * perPage),
      meta: { page, per_page: perPage, total: rows.length },
    })
  }),

  ...usersHandlers(),
  ...devicesHandlers(),
]

// Signs a fixture user in without a login request, for tests that start signed in.
export function signInAs(username) {
  const user = db.users.find((u) => u.username === username)
  db.currentUserId = user.id
  return profileOf(user)
}

// /users (FE-045): the Port Admin's user management, with version tokens and the two 409s.
const TERMINAL_ROLES = ['TERMINAL_ADMIN', 'TERMINAL_OFFICER', 'TERMINAL_SUPERVISOR']
const bump = (user) => {
  const [, n = '0'] = (user.version ?? `v${user.id}-1`).split('-')
  user.version = `v${user.id}-${Number(n) + 1}`
}
const isLastAdmin = (user) =>
  user.role === 'PORT_GM' &&
  user.active &&
  db.users.filter((u) => u.role === 'PORT_GM' && u.active).length === 1

function usersHandlers() {
  const admin = () => {
    const me = currentUser()
    if (!me) return problem(401, 'UNAUTHENTICATED')
    if (me.role !== 'PORT_GM') return problem(403, 'FORBIDDEN')
    return null
  }
  const find = (params) => db.users.find((u) => u.id === Number(params.user))
  // Checks shared by the writes: signed in as Port Admin, the user exists, the version is current.
  async function write(request, params, { versioned = true } = {}) {
    const refused = admin()
    if (refused) return { refused }
    const user = find(params)
    if (!user) return { refused: problem(404, 'NOT_FOUND') }
    const body = await request.json().catch(() => ({}))
    if (versioned && body.version !== apiUserOf(user).version)
      return {
        refused: problem(409, 'VERSION_CONFLICT', {
          current: { id: user.id, version: apiUserOf(user).version },
        }),
      }
    return { user, body }
  }

  return [
    http.get(`${API}/users`, ({ request }) => {
      const refused = admin()
      if (refused) return refused
      const query = new URL(request.url).searchParams
      const page = Number(query.get('page') ?? 1)
      const perPage = Number(query.get('per_page') ?? 25)
      let rows = [...db.users].sort((a, b) => a.name.localeCompare(b.name))
      if (query.has('is_active'))
        rows = rows.filter((u) => u.active === (query.get('is_active') === '1'))
      if (query.get('q')) {
        const text = query.get('q').toLowerCase()
        rows = rows.filter((u) => [u.name, u.username].some((v) => v.toLowerCase().includes(text)))
      }
      return HttpResponse.json({
        data: rows.slice((page - 1) * perPage, page * perPage).map((u) => apiUserOf(u)),
        meta: { page, per_page: perPage, total: rows.length },
      })
    }),

    http.get(`${API}/users/:user`, ({ params }) => {
      const refused = admin()
      if (refused) return refused
      const user = find(params)
      return user
        ? HttpResponse.json(apiUserOf(user, { history: true }))
        : problem(404, 'NOT_FOUND')
    }),

    http.post(`${API}/users`, async ({ request }) => {
      const refused = admin()
      if (refused) return refused
      const { name, username } = await request.json()
      const errors = {}
      if (!name) errors.name = ['validation.required']
      if (!username) errors.username = ['validation.required']
      else if (db.users.some((u) => u.username === username))
        errors.username = ['validation.unique']
      if (Object.keys(errors).length) return problem(422, 'VALIDATION_FAILED', { errors })
      const user = {
        id: Math.max(...db.users.map((u) => u.id)) + 1,
        username,
        name,
        role: null,
        terminal_ids: [],
        must_change_password: true,
        password: 'OneTime-Pass-2026-xyz',
        active: true,
      }
      db.users.push(user)
      return HttpResponse.json(
        { ...apiUserOf(user), one_time_password: user.password },
        { status: 201 },
      )
    }),

    http.post(`${API}/users/:user/deactivate`, async ({ request, params }) => {
      const { refused, user } = await write(request, params)
      if (refused) return refused
      if (user.id === db.currentUserId || isLastAdmin(user)) return problem(409, 'CONFLICT')
      if (user.active) {
        user.active = false
        bump(user)
      }
      return HttpResponse.json(apiUserOf(user))
    }),

    http.post(`${API}/users/:user/activate`, async ({ request, params }) => {
      const { refused, user } = await write(request, params)
      if (refused) return refused
      if (!user.active) {
        user.active = true
        bump(user)
      }
      return HttpResponse.json(apiUserOf(user))
    }),

    http.post(`${API}/users/:user/roles`, async ({ request, params }) => {
      const { refused, user, body } = await write(request, params)
      if (refused) return refused
      const terminal = TERMINAL_ROLES.includes(body.role)
      if (terminal !== (body.terminal_id != null))
        return problem(422, 'VALIDATION_FAILED', {
          errors: { terminal_id: [terminal ? 'validation.required' : 'validation.prohibited'] },
        })
      if (body.role !== 'PORT_GM' && isLastAdmin(user)) return problem(409, 'CONFLICT')
      if (user.role)
        user.past_roles = [
          { ...apiUserOf(user).active_role, active_to: '2026-11-23T10:00:00Z' },
          ...(user.past_roles ?? []),
        ]
      user.role = body.role
      user.terminal_ids = terminal ? [body.terminal_id] : []
      user.role_from = '2026-11-23T10:00:00Z'
      bump(user)
      return HttpResponse.json(apiUserOf(user, { history: true }))
    }),

    http.post(`${API}/users/:user/roles/end`, async ({ request, params }) => {
      const { refused, user } = await write(request, params)
      if (refused) return refused
      if (isLastAdmin(user)) return problem(409, 'CONFLICT')
      if (user.role) {
        user.past_roles = [
          { ...apiUserOf(user).active_role, active_to: '2026-11-23T10:00:00Z' },
          ...(user.past_roles ?? []),
        ]
        user.role = null
        user.terminal_ids = []
        bump(user)
      }
      return HttpResponse.json(apiUserOf(user, { history: true }))
    }),
  ]
}

// /users/{user}/devices (FE-046): list, revoke, restore and revoke-all, newest first.
function devicesHandlers() {
  const guard = (params) => {
    const me = currentUser()
    if (!me) return { refused: problem(401, 'UNAUTHENTICATED') }
    if (me.role !== 'PORT_GM') return { refused: problem(403, 'FORBIDDEN') }
    const user = db.users.find((u) => u.id === Number(params.user))
    if (!user) return { refused: problem(404, 'NOT_FOUND') }
    const device = params.device
      ? db.devices.find((d) => d.id === Number(params.device) && d.user_id === user.id)
      : null
    if (params.device && !device) return { refused: problem(404, 'NOT_FOUND') }
    return { user, device }
  }
  const shape = (device) =>
    Object.fromEntries(Object.entries(device).filter(([k]) => k !== 'user_id'))
  const NOW = '2026-11-23T12:00:00Z'

  return [
    http.get(`${API}/users/:user/devices`, ({ request, params }) => {
      const { refused, user } = guard(params)
      if (refused) return refused
      const query = new URL(request.url).searchParams
      const page = Number(query.get('page') ?? 1)
      const perPage = Number(query.get('per_page') ?? 25)
      const rows = db.devices.filter((d) => d.user_id === user.id).sort((a, b) => b.id - a.id)
      return HttpResponse.json({
        data: rows.slice((page - 1) * perPage, page * perPage).map(shape),
        meta: { page, per_page: perPage, total: rows.length },
      })
    }),

    http.post(`${API}/users/:user/devices/revoke-all`, ({ params }) => {
      const { refused, user } = guard(params)
      if (refused) return refused
      const live = db.devices.filter((d) => d.user_id === user.id && !d.revoked_at)
      const tokens = live.reduce((sum, d) => sum + d.live_token_count, 0)
      live.forEach((d) => Object.assign(d, { revoked_at: NOW, live_token_count: 0 }))
      return HttpResponse.json({ devices_revoked: live.length, tokens_revoked: tokens })
    }),

    http.post(`${API}/users/:user/devices/:device/revoke`, ({ params }) => {
      const { refused, device } = guard(params)
      if (refused) return refused
      if (!device.revoked_at)
        Object.assign(device, { revoked_at: NOW, live_token_count: 0, has_push_token: false })
      return HttpResponse.json(shape(device))
    }),

    http.post(`${API}/users/:user/devices/:device/restore`, ({ params }) => {
      const { refused, device } = guard(params)
      if (refused) return refused
      device.revoked_at = null
      return HttpResponse.json(shape(device))
    }),
  ]
}
