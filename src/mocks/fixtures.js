// Test data for the mock API (FE-034), shaped like port-api.yaml. Test use only.

// GET /system/info (SystemInfo in the contract).
export const PORT = Object.freeze({
  port_id: '0d9f6a52-7c1b-4b7e-9a3e-5a2f1c8d7e10',
  port_code: 'EGALY',
  port_name: 'Alexandria Port',
  license_mode: 'FULL',
  token_warning_days_left: null,
  min_app_version: '1.0.0',
})

// Seeded-style accounts (backend DemoUserSeeder): every one starts on a one-time password.
export const TEMP_PASSWORD = 'Temp12345'
export const NEW_PASSWORD = 'Harbour2026'

const user = (id, username, name, role, extra = {}) => ({
  id,
  username,
  name,
  role,
  terminal_ids: [],
  must_change_password: true,
  password: TEMP_PASSWORD,
  active: true,
  ...extra,
})

export function seedUsers() {
  return [
    user(1, 'port.gm', 'Port General Manager', 'PORT_GM'),
    user(2, 'port.staff', 'Port Staff', 'PORT_STAFF', {
      must_change_password: false,
      password: NEW_PASSWORD,
    }),
    user(3, 'terminal.admin', 'Terminal Admin', 'TERMINAL_ADMIN', { terminal_ids: [1] }),
    user(4, 'pilot.01', 'Pilot One', 'MARINE_PILOT'),
    user(5, 'former.staff', 'Former Staff', 'PORT_STAFF', { active: false }),
  ]
}

// A user as GET /users returns it (port-api.yaml User), with the role history of UserDetail.
const TERMINAL_ROLES = ['TERMINAL_ADMIN', 'TERMINAL_OFFICER', 'TERMINAL_SUPERVISOR']
export function apiUserOf(u, { history = false } = {}) {
  const assignment = (role, terminalId, from, to = null) => ({
    role,
    organization_unit_id: terminalId ?? 1,
    unit_type: terminalId ? 'TERMINAL' : 'HARBOUR_AUTHORITY',
    terminal_id: terminalId,
    active_from: from,
    active_to: to,
  })
  const terminalId = TERMINAL_ROLES.includes(u.role) ? (u.terminal_ids[0] ?? null) : null
  const active = u.role
    ? assignment(u.role, terminalId, u.role_from ?? '2026-10-01T08:00:00Z')
    : null
  return {
    id: u.id,
    name: u.name,
    username: u.username,
    phone: null,
    is_active: u.active,
    must_change_password: u.must_change_password,
    version: u.version ?? `v${u.id}-1`,
    created_at: '2026-10-01T08:00:00Z',
    active_role: active,
    ...(history ? { role_history: [...(active ? [active] : []), ...(u.past_roles ?? [])] } : {}),
  }
}

// The signed-in profile the API returns (CT-03): no username, password or status.
export function profileOf({ id, name, role, terminal_ids, must_change_password }) {
  return { id, name, role, terminal_ids, must_change_password }
}

export function seedAuditLogs() {
  const actions = ['CREATE', 'UPDATE', 'STATUS_CHANGE', 'DELETE']
  return Array.from({ length: 45 }, (_, i) => ({
    id: 45 - i,
    actor: { id: 1, name: 'Port General Manager', username: 'port.gm' },
    entity_type: i % 2 ? 'berths' : 'users',
    entity_id: (i % 5) + 1,
    action: actions[i % actions.length],
    before_state: null,
    after_state: { name: `Change ${45 - i}` },
    occurred_at: new Date(Date.UTC(2026, 9, 9, 10, 30 - (i % 30))).toISOString(),
  }))
}

// Registered mobile devices (port-api.yaml UserDevice) with the user they belong to.
export function seedDevices() {
  const device = (id, user_id, platform, app_version, extra = {}) => ({
    id,
    user_id,
    device_id: `${platform.toLowerCase()}-${id}a7f3c9`,
    platform,
    app_version,
    last_seen_at: `2026-10-0${id}T11:58:00Z`,
    revoked_at: null,
    has_push_token: true,
    live_token_count: 1,
    ...extra,
  })
  return [
    device(1, 4, 'ANDROID', '2.4.0'),
    device(2, 4, 'IOS', '2.4.1'),
    device(3, 4, 'ANDROID', '2.3.9', {
      revoked_at: '2026-10-05T09:00:00Z',
      live_token_count: 0,
      has_push_token: false,
    }),
  ]
}
