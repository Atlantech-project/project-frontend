import { describe, it, expect } from 'vitest'
import { NAVIGATION, navigationFor, pageAccess } from './navigation'
import { ROLES, FIELD_ROLES, WEB_ROLES, isWebRole } from './roles'
import en from '@/i18n/en.json'
import ar from '@/i18n/ar.json'

const pageIds = (role) => navigationFor(role).flatMap((s) => s.items.map((i) => i.pageId))

function lookup(messages, key) {
  return key.split('.').reduce((node, part) => node?.[part], messages)
}

describe('roles', () => {
  it('splits the twelve port roles into web and field roles', () => {
    expect(Object.keys(ROLES)).toHaveLength(12)
    expect(WEB_ROLES).toHaveLength(9)
    expect(FIELD_ROLES.every((r) => !isWebRole(r))).toBe(true)
  })
})

describe('navigationFor', () => {
  it('gives the Port Admin the admin pages and plans, not the berthing pages', () => {
    const ids = pageIds(ROLES.PORT_GM)
    expect(ids).toEqual(expect.arrayContaining(['P-17', 'P-23', 'P-29', 'P-62', 'P-39']))
    expect(ids).not.toContain('P-34')
  })

  it('gives Port Authority Staff the vessel journey pages', () => {
    expect(pageIds(ROLES.PORT_STAFF)).toEqual(
      expect.arrayContaining(['P-34', 'P-31', 'P-33', 'P-39', 'P-41']),
    )
  })

  it('marks read-only pages', () => {
    const plans = navigationFor(ROLES.TERMINAL_OFFICER)
      .flatMap((s) => s.items)
      .find((i) => i.pageId === 'P-39')
    expect(plans.readOnly).toBe(true)
    expect(pageAccess('P-43', ROLES.PILOTAGE_OFFICER)).toBe('read')
    expect(pageAccess('P-43', ROLES.PILOTAGE_MANAGER)).toBe('edit')
  })

  it('keeps the Marine Safety Officer off the port state page (not listed for R13)', () => {
    const ids = pageIds(ROLES.MARINE_SAFETY_OFFICER)
    expect(ids).toContain('P-59')
    expect(ids).not.toContain('P-18')
  })

  it('drops empty sections', () => {
    const sections = navigationFor(ROLES.TUG_OFFICER).map((s) => s.id)
    expect(sections).toEqual(['general', 'tugs'])
  })

  it('gives field roles and unknown roles no web menu', () => {
    for (const role of [...FIELD_ROLES, 'NOT_A_ROLE', undefined]) {
      expect(navigationFor(role)).toEqual([])
    }
  })

  it('has unique page IDs and paths', () => {
    const items = NAVIGATION.flatMap((s) => s.items)
    expect(new Set(items.map((i) => i.pageId)).size).toBe(items.length)
    expect(new Set(items.map((i) => i.path)).size).toBe(items.length)
  })

  it('has an English and Arabic label for every section and item', () => {
    const keys = NAVIGATION.flatMap((s) => [s.labelKey, ...s.items.map((i) => i.labelKey)])
    for (const key of keys) {
      expect(lookup(en, key), key).toBeTypeOf('string')
      expect(lookup(ar, key), key).toBeTypeOf('string')
    }
  })
})
