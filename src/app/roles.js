// Port roles, as stored in user_role_assignment.role (Users & Actors). The database enum is
// the source of truth for these codes (e.g. PORT_STAFF, not PORT_AUTHORITY_STAFF from the CT-03 example).
// R-numbers are the role IDs used in the Screens spec.
export const ROLES = Object.freeze({
  PORT_GM: 'PORT_GM', // R2 Port Admin
  PORT_STAFF: 'PORT_STAFF', // R3 Port Authority Staff
  PILOTAGE_MANAGER: 'PILOTAGE_MANAGER', // R4
  PILOTAGE_OFFICER: 'PILOTAGE_OFFICER', // R5
  MARINE_PILOT: 'MARINE_PILOT', // R6 (tablet)
  TUG_MANAGER: 'TUG_MANAGER', // R7
  TUG_OFFICER: 'TUG_OFFICER', // R8
  TUG_MASTER: 'TUG_MASTER', // R9 (tablet)
  TERMINAL_ADMIN: 'TERMINAL_ADMIN', // R10 CT Administrator
  TERMINAL_OFFICER: 'TERMINAL_OFFICER', // R11 CT Operation Planner
  TERMINAL_SUPERVISOR: 'TERMINAL_SUPERVISOR', // R12 CT Supervisor (tablet)
  MARINE_SAFETY_OFFICER: 'MARINE_SAFETY_OFFICER', // R13
})

// Field roles work on the tablet app and have no web pages.
// DEC-48 (open, recommended option 1): on the web they get P-20 with a "use the mobile app" message.
export const FIELD_ROLES = Object.freeze([
  ROLES.MARINE_PILOT,
  ROLES.TUG_MASTER,
  ROLES.TERMINAL_SUPERVISOR,
])

export const WEB_ROLES = Object.freeze(
  Object.values(ROLES).filter((role) => !FIELD_ROLES.includes(role)),
)

export function isWebRole(role) {
  return WEB_ROLES.includes(role)
}
