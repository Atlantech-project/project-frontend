import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { i18n } from '@/i18n'
import en from '@/i18n/en.json'
import { useSessionStore } from '@/stores/session'
import HomePage from './HomePage.vue'

describe('temporary home page', () => {
  it('greets the user with their role', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    useSessionStore().user = {
      id: 3,
      name: 'Port Staff',
      role: 'PORT_STAFF',
      terminal_ids: [],
      must_change_password: false,
    }
    const w = mount(HomePage, { global: { plugins: [pinia, i18n] } })
    expect(w.text()).toContain('Welcome, Port Staff')
    expect(w.text()).toContain(en.roles.PORT_STAFF)
  })
})
