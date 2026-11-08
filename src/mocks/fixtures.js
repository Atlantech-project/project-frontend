// Test data for the mock API (FE-034), shaped like port-api.yaml. Test use only.

export const PORT = Object.freeze({ port_name: 'Alexandria Port' })

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
