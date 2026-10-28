import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const src = join(import.meta.dirname, '..')
const css = readFileSync(join(import.meta.dirname, 'foundations.css'), 'utf8')

// --name: value; pairs from the @theme block, with var() aliases resolved.
const raw = Object.fromEntries(
  [...css.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]),
)
const token = (name) => {
  const value = raw[name]
  if (value === undefined) throw new Error(`Unknown token --${name}`)
  const alias = value.match(/^var\(--([\w-]+)\)$/)
  return alias ? token(alias[1]) : value
}

const luminance = (hex) => {
  const [r, g, b] = hex
    .slice(1)
    .match(/../g)
    .map((c) => parseInt(c, 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// WCAG AA: 4.5:1 for text, 3:1 for UI parts such as focus rings.
const TEXT = 4.5
const UI = 3
const pairs = [
  ...['fg', 'fg-secondary', 'fg-muted', 'fg-link', 'fg-accent'].flatMap((fg) =>
    ['page', 'card', 'subtle'].map((bg) => [fg, bg, TEXT]),
  ),
  ['fg', 'fill', TEXT],
  ['fg', 'brand-tint', TEXT],
  ['fg-inverse', 'inverse', TEXT],
  ['fg-inverse', 'brand', TEXT],
  ['fg-inverse', 'brand-hover', TEXT],
  ['fg-inverse', 'brand-pressed', TEXT],
  ['card', 'brand-secondary', TEXT],
  ['card', 'brand-secondary-hover', TEXT],
  ...['info', 'success', 'warning', 'danger', 'neutral'].flatMap((s) => [
    [`status-${s}-fg`, `status-${s}-bg`, TEXT],
    [`status-${s}-fg`, 'card', TEXT],
  ]),
  ['edge-focus', 'card', UI],
  ['edge-focus', 'page', UI],
]

describe('design foundations', () => {
  it.each(pairs)('--color-%s on --color-%s meets %s:1', (fg, bg, min) => {
    expect(contrast(token(`color-${fg}`), token(`color-${bg}`))).toBeGreaterThanOrEqual(min)
  })

  it('keeps the brand kit radius (8 / 12 / 16 px)', () => {
    expect([token('radius-control'), token('radius-card'), token('radius-panel')]).toEqual([
      '8px',
      '12px',
      '16px',
    ])
  })
})

// Pages use tokens only. The landing page is exempt: it is the public site and keeps its own art.
const EXEMPT = ['app/pages/landing/']
const RAW_COLOUR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/

const vueFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return vueFiles(path)
    return path.endsWith('.vue') ? [path] : []
  })

describe('pages use tokens only', () => {
  const files = vueFiles(src)
    .map((path) => relative(src, path).replaceAll('\\', '/'))
    .filter((path) => !path.startsWith('brand/') && !EXEMPT.some((dir) => path.startsWith(dir)))

  it.each(files)('%s has no raw colours', (path) => {
    const lines = readFileSync(join(src, path), 'utf8')
      .split('\n')
      .map((text, i) => `${i + 1}: ${text.trim()}`)
      .filter((line) => RAW_COLOUR.test(line))
    expect(lines).toEqual([])
  })
})
