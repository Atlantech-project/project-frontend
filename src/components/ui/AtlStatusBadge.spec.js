import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { i18n } from '@/i18n'
import AtlStatusBadge from './AtlStatusBadge.vue'

const badge = (value) => mount(AtlStatusBadge, { props: { value }, global: { plugins: [i18n] } })

describe('AtlStatusBadge', () => {
  it('shows the label in the tone of its status', () => {
    const w = badge('NEEDS_REVISION')
    expect(w.text()).toBe('Needs revision')
    expect(w.classes()).toContain('bg-status-warning-bg')
  })

  it('shows an unknown status readably, in neutral', () => {
    const w = badge('NEW_STATE_FROM_API')
    expect(w.text()).toBe('New state from api')
    expect(w.classes()).toContain('bg-status-neutral-bg')
  })
})
