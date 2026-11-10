import { describe, it, expect } from 'vitest'
import { auditParams, fieldChanges, formatValue, humanize, PAGE_SIZE } from './audit'

describe('auditParams', () => {
  const now = new Date('2026-11-10T12:00:00.000Z')

  it('sends only the filters that are set', () => {
    expect(auditParams({ q: '  ', entityType: '', action: '', range: 0, page: 1 }, now)).toEqual({
      page: 1,
      per_page: PAGE_SIZE,
    })
  })

  it('turns the form into API filters, with the range as a UTC instant', () => {
    expect(
      auditParams(
        { q: ' port.gm ', entityType: 'berths', action: 'UPDATE', range: 7, page: 3 },
        now,
      ),
    ).toEqual({
      page: 3,
      per_page: PAGE_SIZE,
      q: 'port.gm',
      entity_type: 'berths',
      action: 'UPDATE',
      from: '2026-11-03T12:00:00.000Z',
    })
  })
})

describe('fieldChanges', () => {
  it('lists changed fields only, with before and after', () => {
    const entry = {
      before_state: { name: 'Berth 3', draft_depth: 13.5, status: 'ACTIVE' },
      after_state: { name: 'Berth 3', draft_depth: 14, status: 'ACTIVE' },
    }
    expect(fieldChanges(entry)).toEqual([{ field: 'draft_depth', before: '13.5', after: '14' }])
  })

  it('handles a create (no before) and a delete (no after)', () => {
    expect(fieldChanges({ before_state: null, after_state: { name: 'A' } })).toEqual([
      { field: 'name', before: '—', after: 'A' },
    ])
    expect(fieldChanges({ before_state: { name: 'A' }, after_state: null })).toEqual([
      { field: 'name', before: 'A', after: '—' },
    ])
  })
})

describe('formatValue and humanize', () => {
  it('shows empty values as a dash and objects as JSON', () => {
    expect(formatValue(null)).toBe('—')
    expect(formatValue(false)).toBe('false')
    expect(formatValue([1, 2])).toBe('[1,2]')
  })

  it('makes table and column names readable', () => {
    expect(humanize('yard_blocks')).toBe('Yard blocks')
  })
})
