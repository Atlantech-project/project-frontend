// GENERATED from contracts/port-api.yaml by scripts/api-types.mjs. Do not edit by hand:
// change the contract file and run `pnpm api:types`. Types are JSDoc only (no TypeScript).

export const API_VERSION = '1.8.0'

// ---- Schemas ----

/**
 * ISO 8601 in UTC with microseconds on output; input must carry Z or an offset.
 * @typedef {string} DateTime
 */

/**
 * @typedef {object} PageMeta
 * @property {number} page
 * @property {number} per_page
 * @property {number} total
 */

/**
 * Stable error code (CT-01 error-codes.md); never changes once CT-01 is approved.
 * @typedef {'VALIDATION_FAILED' | 'VERSION_CONFLICT' | 'UNAUTHENTICATED' | 'SESSION_EXPIRED' | 'FORBIDDEN' | 'NOT_FOUND' | 'METHOD_NOT_ALLOWED' | 'ACCOUNT_DISABLED' | 'PASSWORD_CHANGE_REQUIRED' | 'DEVICE_REVOKED' | 'APP_UPDATE_REQUIRED' | 'LICENSE_READ_ONLY' | 'PLAN_LIMIT_EXCEEDED' | 'TOO_MANY_ATTEMPTS' | 'IDEMPOTENCY_KEY_REUSED' | 'SERVICE_UNAVAILABLE' | 'SERVER_ERROR' | 'BAD_REQUEST'} ErrorCode
 */
export const ERROR_CODES = Object.freeze([
  'VALIDATION_FAILED',
  'VERSION_CONFLICT',
  'UNAUTHENTICATED',
  'SESSION_EXPIRED',
  'FORBIDDEN',
  'NOT_FOUND',
  'METHOD_NOT_ALLOWED',
  'ACCOUNT_DISABLED',
  'PASSWORD_CHANGE_REQUIRED',
  'DEVICE_REVOKED',
  'APP_UPDATE_REQUIRED',
  'LICENSE_READ_ONLY',
  'PLAN_LIMIT_EXCEEDED',
  'TOO_MANY_ATTEMPTS',
  'IDEMPOTENCY_KEY_REUSED',
  'SERVICE_UNAVAILABLE',
  'SERVER_ERROR',
  'BAD_REQUEST',
])

/**
 * RFC 9457 problem body. `detail` is English; clients translate by `message_key`.
 * @typedef {object} Problem
 * @property {string} type Identifier of the problem (https://atlantech.io/errors/<kebab-code>), not a page.
 * @property {string} title Short English title per code.
 * @property {number} status
 * @property {ErrorCode} code
 * @property {string} message_key Translation key, errors.<lower_snake code> or errors.<area>.<name> for feature keys.
 * @property {string} detail
 */

/**
 * 422 VALIDATION_FAILED; `errors` maps each field to its failed rules as message keys.
 * @typedef {Problem & { errors: Record<string, Array<string>> }} ValidationProblem
 */

/**
 * 409 VERSION_CONFLICT; `current` is the stored record's id and version token.
 * @typedef {Problem & { current: { id: number, version: DateTime } }} VersionConflictProblem
 */

/**
 * 426 APP_UPDATE_REQUIRED; `min_app_version` is the port's minimum mobile version.
 * @typedef {Problem & { min_app_version: string }} AppUpdateRequiredProblem
 */

/**
 * @typedef {object} ChangePasswordRequest
 * @property {string} current_password
 * @property {string} new_password
 * @property {string} new_password_confirmation
 */

/**
 * @typedef {object} LoginRequest
 * @property {string} username Trimmed and lowercased by the server before it is checked.
 * @property {string} password
 */

/**
 * @typedef {object} MobileLoginRequest
 * @property {string} username Trimmed and lowercased by the server before it is checked.
 * @property {string} password
 * @property {'ANDROID' | 'IOS'} platform
 */

/**
 * The mobile sign-in answer (CT-04).
 * @typedef {object} MobileSignIn
 * @property {string} token Opaque device token.
 * @property {string} expires_at The expiry at sign-in; each use moves it to 30 days later.
 * @property {UserProfile} user
 */

/**
 * Public port information (CT-04 v1.1).
 * @typedef {object} SystemInfo
 * @property {string} port_id `port_profiles.public_id`.
 * @property {string | null} port_code UN/LOCODE; may be null.
 * @property {string} port_name
 * @property {'SETUP' | 'FULL' | 'READ_ONLY'} license_mode Always `FULL` until the licence work (DEC-54).
 * @property {number | null} token_warning_days_left Always null until the licence work (DEC-54).
 * @property {string} min_app_version The oldest mobile app version the port accepts (`x.y.z`); older apps get 426.
 */

/**
 * The signed-in user (CT-03). One active role (DEC-36); `role` is null when the user has none.
 * @typedef {object} UserProfile
 * @property {number} id
 * @property {string} name
 * @property {'PORT_GM' | 'PORT_STAFF' | 'MARINE_SAFETY_OFFICER' | 'PILOTAGE_MANAGER' | 'PILOTAGE_OFFICER' | 'MARINE_PILOT' | 'TUG_MANAGER' | 'TUG_OFFICER' | 'TUG_MASTER' | 'TERMINAL_ADMIN' | 'TERMINAL_OFFICER' | 'TERMINAL_SUPERVISOR' | null} role
 * @property {Array<number>} terminal_ids The terminal of a TERMINAL role; empty for every other role.
 * @property {boolean} must_change_password
 */

/**
 * @typedef {'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'SAFETY_EXCEPTION' | 'REJECTED_ATTEMPT'} AuditAction
 */
export const AUDIT_ACTIONS = Object.freeze([
  'CREATE',
  'UPDATE',
  'DELETE',
  'STATUS_CHANGE',
  'SAFETY_EXCEPTION',
  'REJECTED_ATTEMPT',
])

/**
 * One audit row. `before_state` and `after_state` hold the changed fields; CREATE has no before, DELETE no after, a refusal holds `route`, `status`, `code`, `reason` and `username` in `after_state`.
 * @typedef {object} AuditLogEntry
 * @property {number} id
 * @property {{ id: number, name: string, username: string } | null} actor Null for the system or a worker.
 * @property {string} entity_type
 * @property {number | null} entity_id
 * @property {AuditAction} action
 * @property {Record<string, unknown> | null} before_state
 * @property {Record<string, unknown> | null} after_state
 * @property {DateTime} occurred_at
 */

// ---- Endpoints (paths are relative to /api/v1) ----

/**
 * Body of POST /auth/login.
 * @typedef {LoginRequest} AuthLoginBody
 */

/**
 * Answer of POST /auth/login (200).
 * @typedef {UserProfile} AuthLoginResponse
 */

/**
 * Body of POST /auth/mobile/login.
 * @typedef {MobileLoginRequest} AuthMobileLoginBody
 */

/**
 * Answer of POST /auth/mobile/login (200).
 * @typedef {MobileSignIn} AuthMobileLoginResponse
 */

/**
 * Answer of GET /auth/me (200).
 * @typedef {UserProfile} AuthMeResponse
 */

/**
 * Body of POST /auth/change-password.
 * @typedef {ChangePasswordRequest} AuthChangePasswordBody
 */

/**
 * Answer of POST /auth/change-password (200).
 * @typedef {UserProfile} AuthChangePasswordResponse
 */

/**
 * Query of GET /audit-logs.
 * @typedef {object} AuditLogsListQuery
 * @property {number} [page] Page number, from 1. A page past the end returns 200 with empty data; out of range is 422.
 * @property {number} [per_page] Items per page. Out of range is 422 (never clamped).
 * @property {string} [entity_type] Table name of the changed record, for example `berths`.
 * @property {number} [entity_id] Id of the changed record. Use with `entity_type`.
 * @property {number} [actor_id] The user who made the change.
 * @property {AuditAction} [action]
 * @property {DateTime} [from] Rows at or after this instant. ISO 8601 with `Z` or an offset; a time without one is 422. Not after `to`.
 * @property {DateTime} [to] Rows at or before this instant. Same format as `from`.
 * @property {string} [q] Text search on the actor, a case-insensitive part of the username or name.
 */

/**
 * Answer of GET /audit-logs (200).
 * @typedef {object} AuditLogsListResponse
 * @property {Array<AuditLogEntry>} data
 * @property {PageMeta} meta
 */

/**
 * Answer of GET /system/info (200).
 * @typedef {SystemInfo} SystemInfoResponse
 */

export const OPERATIONS = Object.freeze({
  authLogin: { method: 'POST', path: '/auth/login' },
  authMobileLogin: { method: 'POST', path: '/auth/mobile/login' },
  authMe: { method: 'GET', path: '/auth/me' },
  authChangePassword: { method: 'POST', path: '/auth/change-password' },
  authLogout: { method: 'POST', path: '/auth/logout' },
  auditLogsList: { method: 'GET', path: '/audit-logs' },
  systemInfo: { method: 'GET', path: '/system/info' },
})
