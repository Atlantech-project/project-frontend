import { describe, it, expect } from 'vitest'
import en from '@/i18n/en.json'
import ar from '@/i18n/ar.json'
import vocabulary from './status-vocabulary.json'
import { STATUS_TONES, statusColumns, statusTone } from './statuses'

const values = [...new Set(Object.values(statusColumns()).flat())]

describe('status registry (CT-21)', () => {
  it('covers the status columns of the shared vocabulary', () => {
    expect(Object.keys(statusColumns())).toEqual(
      expect.arrayContaining([
        'berthing_requests.status',
        'recommendations.status',
        'terminal_recommendations.lifecycle_status',
        'plan_components.derived_status',
        'tugboats.status',
      ]),
    )
    expect(Object.keys(statusColumns())).not.toContain('tugboats.tug_power_unit')
  })

  it.each(values)('%s has a tone and an English and Arabic label', (value) => {
    expect(STATUS_TONES[value]).toBeDefined()
    expect(en.status[value]).toBeTruthy()
    expect(ar.status[value]).toBeTruthy()
  })

  it('has no tones or labels for values the vocabulary no longer has', () => {
    expect(Object.keys(STATUS_TONES).sort()).toEqual([...values].sort())
    expect(Object.keys(en.status).sort()).toEqual([...values].sort())
  })

  it('matches the Figma P-34 badges and falls back to neutral', () => {
    expect(statusTone('SUBMITTED')).toBe('info')
    expect(statusTone('PLAN_CONFIRMED')).toBe('info')
    expect(statusTone('COMPLETED')).toBe('success')
    expect(statusTone('SOMETHING_NEW')).toBe('neutral')
    expect(vocabulary.version).toBe('1.0')
  })
})
