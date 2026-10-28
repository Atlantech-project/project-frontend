import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { i18n } from '@/i18n'
import en from '@/i18n/en.json'
import AtlLoadingState from './AtlLoadingState.vue'
import AtlEmptyState from './AtlEmptyState.vue'
import AtlErrorState from './AtlErrorState.vue'

const opts = { global: { plugins: [i18n] } }

describe('screen states', () => {
  it('loading announces itself with the default message', () => {
    const w = mount(AtlLoadingState, opts)
    expect(w.attributes('role')).toBe('status')
    expect(w.text()).toContain(en.states.loading)
  })

  it('empty shows its own title and the actions slot', () => {
    const w = mount(AtlEmptyState, {
      ...opts,
      props: { title: 'No vessels' },
      slots: { default: '<button>Add</button>' },
    })
    expect(w.text()).toContain('No vessels')
    expect(w.find('button').text()).toBe('Add')
  })

  it('error shows Retry only when retryable and emits retry', async () => {
    expect(mount(AtlErrorState, opts).find('button').exists()).toBe(false)
    const w = mount(AtlErrorState, { ...opts, props: { retryable: true } })
    expect(w.attributes('role')).toBe('alert')
    await w.find('button').trigger('click')
    expect(w.emitted('retry')).toHaveLength(1)
  })
})
