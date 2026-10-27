import { describe, it, expect } from 'vitest'
import { routes } from './index'

describe('routes', () => {
  it('has the static pages', () => {
    const names = routes.map((r) => r.name)
    expect(names).toEqual(expect.arrayContaining(['landing', 'error', 'not-found']))
    expect(routes.find((r) => r.name === 'landing').path).toBe('/')
  })

  it('keeps the not-found catch-all last', () => {
    expect(routes.at(-1).name).toBe('not-found')
  })

  it('keeps the public pages in the light brand look', () => {
    for (const name of ['landing', 'error', 'not-found']) {
      expect(routes.find((r) => r.name === name).meta.theme).toBe('light')
    }
  })
})
