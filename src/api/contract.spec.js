// The app against the API contract (FE-035). contracts/port-api.yaml is a copy of the backend's
// OpenAPI file; when the backend changes it, these tests fail in CI until the app follows.
import { describe, it, expect, beforeEach } from 'vitest'
import { ROLES } from '@/app/roles'
import { db, signInAs } from '@/mocks/handlers'
import { NEW_PASSWORD, TEMP_PASSWORD } from '@/mocks/fixtures'
import { loadSpec, operations, schemaErrors } from '../../scripts/api-contract.mjs'
import { generate } from '../../scripts/api-types.mjs'
import { changePassword, fetchMe, login } from './auth'
import { http, resetCsrfCookie } from './http'
import { fetchSystemInfo } from './system'
import { createResource } from './resource'
import { ERROR_CODES, OPERATIONS } from './types.gen'
import generated from './types.gen.js?raw'

const spec = loadSpec()
const ops = operations(spec)
const responseOf = (id) => ops.find((op) => op.id === id).response

// The app's own source (no tests, no mock API, not the generated file).
const sources = Object.entries(
  import.meta.glob('/src/**/*.{js,vue}', { query: '?raw', import: 'default', eager: true }),
).filter(([file]) => !/\.spec\.js$|\/mocks\/|types\.gen\.js$/.test(file))

// Every `http.get('/x')` and `createResource('/x')` in the app, as 'GET /x'.
function endpointsUsed() {
  const used = new Set()
  for (const [, code] of sources) {
    for (const [, method, path] of code.matchAll(
      /\bhttp\.(get|post|put|patch|delete)\(\s*'([^']+)'/g,
    ))
      used.add(`${method.toUpperCase()} ${path}`)
    for (const [, path] of code.matchAll(/\bcreateResource\(\s*'([^']+)'/g)) used.add(`GET ${path}`)
  }
  return [...used].sort()
}

beforeEach(() => resetCsrfCookie())

describe('generated API types', () => {
  it('are up to date with contracts/port-api.yaml (run `pnpm api:types`)', async () => {
    expect(generated).toBe(await generate(spec))
  })

  it('list every endpoint of the contract', () => {
    expect(Object.keys(OPERATIONS)).toEqual(ops.map((op) => op.id))
    expect(OPERATIONS.authLogin).toEqual({ method: 'POST', path: '/auth/login' })
  })
})

describe('the app follows the contract', () => {
  const known = Object.values(OPERATIONS).map((op) => `${op.method} ${op.path}`)

  it('finds the endpoints the app calls', () => {
    expect(endpointsUsed()).toEqual(expect.arrayContaining(['GET /auth/me', 'POST /auth/login']))
  })

  it.each(endpointsUsed())('%s exists in the contract', (endpoint) => {
    expect(known).toContain(endpoint)
  })

  it('knows the same roles as the API', () => {
    const roles = spec.components.schemas.UserProfile.properties.role.enum.filter(Boolean)
    expect(Object.values(ROLES).sort()).toEqual([...roles].sort())
  })

  it('only uses error codes the API has', () => {
    const codes = sources.flatMap(([, code]) =>
      [...code.matchAll(/code === '([A-Z_]+)'|^\s+\d{3}: '([A-Z_]+)',$/gm)].map(
        (m) => m[1] ?? m[2],
      ),
    )
    expect(codes.length).toBeGreaterThan(5)
    expect(ERROR_CODES).toEqual(expect.arrayContaining([...new Set(codes)]))
  })
})

describe('the mock API answers in the shape of the contract', () => {
  it('system info', async () => {
    expect(schemaErrors(spec, responseOf('systemInfo'), await fetchSystemInfo())).toEqual([])
  })

  it('sign-in, profile and change password', async () => {
    const profile = await login({ username: 'port.gm', password: TEMP_PASSWORD })
    expect(schemaErrors(spec, responseOf('authLogin'), profile)).toEqual([])
    expect(schemaErrors(spec, responseOf('authMe'), await fetchMe())).toEqual([])
    const changed = await changePassword({
      currentPassword: TEMP_PASSWORD,
      newPassword: NEW_PASSWORD,
      confirmation: NEW_PASSWORD,
    })
    expect(schemaErrors(spec, responseOf('authChangePassword'), changed)).toEqual([])
  })

  it('audit log list', async () => {
    signInAs('port.gm')
    const { data: body } = await http.get('/audit-logs', { params: { per_page: 5 } })
    expect(body.data).toHaveLength(5)
    expect(schemaErrors(spec, responseOf('auditLogsList'), body)).toEqual([])
    const { items, meta } = await createResource('/audit-logs').list({ per_page: 5 })
    expect({ items: items.length, total: meta.total }).toEqual({ items: 5, total: body.meta.total })
  })

  it('errors are problem+json', async () => {
    const error = await http.get('/auth/me', { skipSessionLost: true }).catch((e) => e)
    expect(schemaErrors(spec, { $ref: '#/components/schemas/Problem' }, error.problem)).toEqual([])
    signInAs('port.gm')
    const invalid = await changePassword({}).catch((e) => e)
    expect(invalid.isValidation).toBe(true)
    expect(
      schemaErrors(spec, { $ref: '#/components/schemas/ValidationProblem' }, invalid.problem),
    ).toEqual([])
  })

  it('the checker reports a wrong shape', () => {
    const row = { ...db.auditLogs[0], action: 'RENAMED', occurred_at: undefined }
    delete row.occurred_at
    expect(
      schemaErrors(spec, { $ref: '#/components/schemas/AuditLogEntry' }, { ...row, id: 'x' }),
    ).toEqual([
      '$.occurred_at: missing',
      '$.id: expected integer, got string',
      expect.stringContaining('$.action: "RENAMED" is not one of'),
    ])
  })
})
