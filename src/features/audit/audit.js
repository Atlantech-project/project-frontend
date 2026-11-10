// Audit log helpers for P-29 (FE-050). Rows come from GET /audit-logs (port-api.yaml AuditLogEntry).
import { createResource } from '@/api/resource'

export const auditLogs = createResource('/audit-logs')

export const PAGE_SIZE = 25

// AuditAction in port-api.yaml.
export const AUDIT_ACTIONS = Object.freeze([
  'CREATE',
  'UPDATE',
  'DELETE',
  'STATUS_CHANGE',
  'SAFETY_EXCEPTION',
  'REJECTED_ATTEMPT',
])

// entity_type is the table name of the changed record. These are the ones the filter offers;
// a row of any other table still shows, with its table name.
export const ENTITY_TYPES = Object.freeze([
  'users',
  'user_devices',
  'port_profiles',
  'port_settings',
  'port_shifts',
  'terminals',
  'berths',
  'navigation_channels',
  'safety_constraints',
  'pilot_profiles',
  'tugboats',
  'tug_master_profiles',
  'berthing_requests',
  'operational_plans',
])

// Date range choices, in days back from now; 0 means all time.
export const RANGES = Object.freeze([1, 7, 30, 0])
export const DEFAULT_RANGE = 30

// Query for the API from the filter form. Empty filters are left out.
export function auditParams({ q, entityType, action, range, page }, now = new Date()) {
  const params = { page, per_page: PAGE_SIZE }
  const text = q?.trim()
  if (text) params.q = text
  if (entityType) params.entity_type = entityType
  if (action) params.action = action
  if (range > 0) params.from = new Date(now.getTime() - range * 86_400_000).toISOString()
  return params
}

// A stored value as text for the before/after table.
export function formatValue(value) {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

// The fields of one audit row with their before and after values, changed fields only.
export function fieldChanges(entry) {
  const before = entry.before_state ?? {}
  const after = entry.after_state ?? {}
  const fields = [...new Set([...Object.keys(before), ...Object.keys(after)])]
  return fields
    .filter((field) => JSON.stringify(before[field]) !== JSON.stringify(after[field]))
    .map((field) => ({
      field,
      before: formatValue(before[field]),
      after: formatValue(after[field]),
    }))
}

// "berths" -> "Berths": a readable name for a table or column without a translation.
export function humanize(name) {
  const words = String(name).replaceAll('_', ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}
