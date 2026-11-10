// The API contract (FE-035): reads contracts/port-api.yaml, the copy of the backend's OpenAPI file
// (PortHub contracts/openapi/port-api.yaml), and gives the tests a small schema checker.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parse } from 'yaml'

export const SPEC_FILE = resolve(import.meta.dirname, '../contracts/port-api.yaml')
export const API_PREFIX = '/api/v1'

export function loadSpec(file = SPEC_FILE) {
  return parse(readFileSync(file, 'utf8'))
}

// '#/components/schemas/UserProfile' -> the schema object.
export function resolveRef(spec, ref) {
  return ref
    .replace(/^#\//, '')
    .split('/')
    .reduce((node, key) => node?.[key], spec)
}

export const deref = (spec, node) => (node?.$ref ? deref(spec, resolveRef(spec, node.$ref)) : node)

// Every operation as { id, method, path, query, body, response }, paths without /api/v1.
export function operations(spec) {
  const list = []
  for (const [fullPath, methods] of Object.entries(spec.paths)) {
    for (const [method, op] of Object.entries(methods)) {
      if (!op?.operationId) continue
      const params = [...(methods.parameters ?? []), ...(op.parameters ?? [])].map((p) =>
        deref(spec, p),
      )
      const ok = Object.entries(op.responses).find(([status]) => status.startsWith('2'))
      list.push({
        id: op.operationId,
        method: method.toUpperCase(),
        path: fullPath.replace(API_PREFIX, ''),
        query: params.filter((p) => p.in === 'query'),
        body: op.requestBody?.content?.['application/json']?.schema ?? null,
        status: ok ? Number(ok[0]) : null,
        response: (ok && deref(spec, ok[1]).content?.['application/json']?.schema) || null,
      })
    }
  }
  return list
}

const typeOf = (value) =>
  value === null
    ? 'null'
    : Array.isArray(value)
      ? 'array'
      : Number.isInteger(value)
        ? 'integer'
        : typeof value

// Checks a value against a schema; returns a list of problems ('$.meta.total: expected integer').
// Covers what port-api.yaml uses: type, nullable, enum, required, properties, items, allOf, anyOf.
export function schemaErrors(spec, schemaOrRef, value, at = '$') {
  const schema = deref(spec, schemaOrRef)
  if (!schema) return []
  if (value === null) return schema.nullable ? [] : [`${at}: must not be null`]
  if (schema.allOf) return schema.allOf.flatMap((part) => schemaErrors(spec, part, value, at))
  if (schema.anyOf) {
    const results = schema.anyOf.map((part) => schemaErrors(spec, part, value, at))
    return results.some((r) => !r.length) ? [] : results[0]
  }

  const errors = []
  const actual = typeOf(value)
  const type = schema.type ?? (schema.properties ? 'object' : undefined)
  if (type && actual !== type && !(type === 'number' && actual === 'integer'))
    return [`${at}: expected ${type}, got ${actual}`]
  if (schema.enum && !schema.enum.includes(value))
    errors.push(`${at}: ${JSON.stringify(value)} is not one of ${schema.enum.join(', ')}`)

  if (actual === 'array' && schema.items)
    value.forEach((item, i) =>
      errors.push(...schemaErrors(spec, schema.items, item, `${at}[${i}]`)),
    )

  if (actual === 'object') {
    for (const key of schema.required ?? [])
      if (!(key in value)) errors.push(`${at}.${key}: missing`)
    for (const [key, child] of Object.entries(schema.properties ?? {}))
      if (key in value) errors.push(...schemaErrors(spec, child, value[key], `${at}.${key}`))
  }
  return errors
}
