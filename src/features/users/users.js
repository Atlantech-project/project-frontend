// Port users for P-23 and P-24 (FE-045). Rows come from GET /users (port-api.yaml User), one
// user with the role history from GET /users/{user} (UserDetail).
import { http } from '@/api/http'
import { createResource } from '@/api/resource'
import { ROLES } from '@/app/roles'

export const users = createResource('/users')

export const PAGE_SIZE = 25

// Roles a user can be given, in the order of the Users & Actors list (R2 to R13).
export const ASSIGNABLE_ROLES = Object.freeze([
  ROLES.PORT_GM,
  ROLES.PORT_STAFF,
  ROLES.PILOTAGE_MANAGER,
  ROLES.PILOTAGE_OFFICER,
  ROLES.MARINE_PILOT,
  ROLES.TUG_MANAGER,
  ROLES.TUG_OFFICER,
  ROLES.TUG_MASTER,
  ROLES.TERMINAL_ADMIN,
  ROLES.TERMINAL_OFFICER,
  ROLES.TERMINAL_SUPERVISOR,
  ROLES.MARINE_SAFETY_OFFICER,
])

// These three roles belong to one terminal: the API needs terminal_id with them and refuses it
// with any other role.
export const TERMINAL_ROLES = Object.freeze([
  ROLES.TERMINAL_ADMIN,
  ROLES.TERMINAL_OFFICER,
  ROLES.TERMINAL_SUPERVISOR,
])

export const needsTerminal = (role) => TERMINAL_ROLES.includes(role)

// Account status filter: '' all, 'active', 'inactive'.
export const STATUS_FILTERS = Object.freeze(['', 'active', 'inactive'])

// Query for GET /users from the filter form. Empty filters are left out.
export function userParams({ q, status, page }) {
  const params = { page, per_page: PAGE_SIZE }
  const text = q?.trim()
  if (text) params.q = text
  if (status === 'active') params.is_active = 1
  if (status === 'inactive') params.is_active = 0
  return params
}

// Username rule of CreateUserRequest: 3 to 50 of a-z, 0-9, dot, underscore, dash.
export const USERNAME_PATTERN = /^[a-z0-9._-]{3,50}$/

// Field errors of the create form before it is sent, as i18n keys. The server checks again.
export function createErrors({ name, username, role, terminalId }) {
  const errors = {}
  if (!name.trim()) errors.name = 'validation.required'
  else if (name.trim().length > 120) errors.name = 'validation.max'
  const login = username.trim().toLowerCase()
  if (!login) errors.username = 'validation.required'
  else if (!USERNAME_PATTERN.test(login)) errors.username = 'users.form.usernameRule'
  Object.assign(errors, roleErrors({ role, terminalId }))
  return errors
}

export function roleErrors({ role, terminalId }) {
  if (!needsTerminal(role)) return {}
  return Number(terminalId) >= 1 ? {} : { terminal_id: 'validation.required' }
}

// The user actions besides create (port-api.yaml). Each one sends the version token the page
// loaded; a stale one answers 409 VERSION_CONFLICT, a business rule 409 CONFLICT.
const post = async (path, body) => (await http.post(path, body)).data

export const userActions = Object.freeze({
  activate: (id, version) => post(`/users/${id}/activate`, { version }),
  deactivate: (id, version) => post(`/users/${id}/deactivate`, { version }),
  assignRole: (id, { role, terminalId, version }) =>
    post(`/users/${id}/roles`, {
      role,
      version,
      ...(needsTerminal(role) ? { terminal_id: Number(terminalId) } : {}),
    }),
  endRole: (id, version) => post(`/users/${id}/roles/end`, { version }),
})

// 409 CONFLICT is a business rule (yourself, the last active Port Admin), not a stale version.
export const isRuleConflict = (error) => error?.code === 'CONFLICT'
