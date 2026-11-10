// Writes src/api/types.gen.js from contracts/port-api.yaml (FE-035): JSDoc types for every schema
// and endpoint, plus the endpoint list and the enums as plain constants. JavaScript only.
//   pnpm api:types   write the file        pnpm api:check   fail when the file is out of date
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as prettier from 'prettier'
import { loadSpec, operations } from './api-contract.mjs'

export const TYPES_FILE = resolve(import.meta.dirname, '../src/api/types.gen.js')

const refName = (ref) => ref.split('/').pop()
const pascal = (id) => id[0].toUpperCase() + id.slice(1)
// ErrorCode -> ERROR_CODES
const constName = (name) => `${name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase()}S`
const literal = (value) => (typeof value === 'string' ? `'${value}'` : String(value))
const safeKey = (key) => (/^[A-Za-z_$][\w$]*$/.test(key) ? key : `'${key}'`)
const oneLine = (text) => String(text).replace(/\s+/g, ' ').replace(/\*\//g, '* /').trim()

// A schema as a JSDoc type expression.
export function typeOf(schema) {
  if (!schema) return 'unknown'
  if (schema.$ref) return refName(schema.$ref)
  let type
  if (schema.allOf) type = schema.allOf.map(typeOf).join(' & ')
  else if (schema.anyOf || schema.oneOf)
    type = (schema.anyOf ?? schema.oneOf).map(typeOf).join(' | ')
  else if (schema.enum)
    type = schema.enum
      .filter((v) => v !== null)
      .map(literal)
      .join(' | ')
  else if (schema.type === 'integer' || schema.type === 'number') type = 'number'
  else if (schema.type === 'string' || schema.type === 'boolean') type = schema.type
  else if (schema.type === 'array') type = `Array<${typeOf(schema.items)}>`
  else if (schema.properties) {
    const required = schema.required ?? []
    const fields = Object.entries(schema.properties).map(
      ([key, child]) => `${safeKey(key)}${required.includes(key) ? '' : '?'}: ${typeOf(child)}`,
    )
    type = `{ ${fields.join(', ')} }`
  } else if (schema.type === 'object') {
    const extra = schema.additionalProperties
    type = `Record<string, ${extra && extra !== true ? typeOf(extra) : 'unknown'}>`
  } else type = 'unknown'
  return schema.nullable ? `${type} | null` : type
}

function typedef(name, schema, description = schema.description) {
  const lines = ['/**']
  if (description) lines.push(` * ${oneLine(description)}`)
  if (schema.properties && !schema.nullable) {
    const required = schema.required ?? []
    lines.push(` * @typedef {object} ${name}`)
    for (const [key, child] of Object.entries(schema.properties)) {
      const label = required.includes(key) ? key : `[${key}]`
      const note = child.description ? ` ${oneLine(child.description)}` : ''
      lines.push(` * @property {${typeOf(child)}} ${label}${note}`)
    }
  } else lines.push(` * @typedef {${typeOf(schema)}} ${name}`)
  lines.push(' */')
  return lines.join('\n')
}

export async function generate(spec = loadSpec()) {
  const out = [
    '// GENERATED from contracts/port-api.yaml by scripts/api-types.mjs. Do not edit by hand:',
    '// change the contract file and run `pnpm api:types`. Types are JSDoc only (no TypeScript).',
    '',
    `export const API_VERSION = '${spec.info.version}'`,
    '',
    '// ---- Schemas ----',
  ]

  for (const [name, schema] of Object.entries(spec.components.schemas)) {
    out.push('', typedef(name, schema))
    if (schema.type === 'string' && schema.enum)
      out.push(
        `export const ${constName(name)} = Object.freeze([${schema.enum.map(literal).join(', ')}])`,
      )
  }

  out.push('', '// ---- Endpoints (paths are relative to /api/v1) ----')
  const ops = operations(spec)
  for (const op of ops) {
    const name = pascal(op.id)
    if (op.query.length) {
      const schema = {
        properties: Object.fromEntries(
          op.query.map((p) => [p.name, { ...p.schema, description: p.description }]),
        ),
        required: op.query.filter((p) => p.required).map((p) => p.name),
      }
      out.push('', typedef(`${name}Query`, schema, `Query of ${op.method} ${op.path}.`))
    }
    if (op.body) out.push('', typedef(`${name}Body`, op.body, `Body of ${op.method} ${op.path}.`))
    if (op.response)
      out.push(
        '',
        typedef(
          `${name}Response`,
          op.response,
          `Answer of ${op.method} ${op.path} (${op.status}).`,
        ),
      )
  }

  out.push('', 'export const OPERATIONS = Object.freeze({')
  for (const op of ops) out.push(`  ${op.id}: { method: '${op.method}', path: '${op.path}' },`)
  out.push('})', '')

  const options = await prettier.resolveConfig(TYPES_FILE)
  return prettier.format(out.join('\n'), { ...options, filepath: TYPES_FILE })
}

const current = () => {
  try {
    return readFileSync(TYPES_FILE, 'utf8')
  } catch {
    return ''
  }
}

if (process.argv[1] === import.meta.filename) {
  const text = await generate()
  if (process.argv.includes('--check')) {
    if (current() !== text) {
      console.error('src/api/types.gen.js is out of date with contracts/port-api.yaml.')
      console.error('Run `pnpm api:types` and fix what the contract change breaks.')
      process.exit(1)
    }
    console.log('API types are up to date.')
  } else {
    writeFileSync(TYPES_FILE, text)
    console.log(`Wrote src/api/types.gen.js (API ${loadSpec().info.version}).`)
  }
}
