import { describe, it, expect } from 'vitest'
import { HOME, afterSignIn, safeRedirect } from './redirect'

describe('safeRedirect', () => {
  it('keeps a page on this site', () => {
    expect(safeRedirect('/admin/users?page=2')).toBe('/admin/users?page=2')
  })

  it('never sends a signed-in user to the landing page', () => {
    expect(safeRedirect('/')).toBe(HOME)
    expect(safeRedirect(undefined)).toBe(HOME)
  })

  it('refuses other sites', () => {
    expect(safeRedirect('//evil.example')).toBe(HOME)
    expect(safeRedirect('https://evil.example')).toBe(HOME)
  })
})

describe('afterSignIn', () => {
  it('sends field roles to P-20', () => {
    expect(afterSignIn({ canUseWeb: false }, '/home')).toEqual({
      name: 'access-denied',
      query: { reason: 'mobileOnly' },
    })
  })
})
