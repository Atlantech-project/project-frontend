import { describe, it, expect, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import PrimeVue from 'primevue/config'
import { i18n } from '@/i18n'
import en from '@/i18n/en.json'

vi.mock('@/api/auth', () => ({
  logout: vi.fn().mockResolvedValue(),
  fetchMe: vi.fn(),
  login: vi.fn(),
  changePassword: vi.fn(),
}))
const auth = await import('@/api/auth')
const { useSessionStore } = await import('@/stores/session')
const { default: HomePage } = await import('./HomePage.vue')

async function mountHome() {
  const pinia = createPinia()
  setActivePinia(pinia)
  useSessionStore().user = {
    id: 3,
    name: 'Port Staff',
    role: 'PORT_STAFF',
    terminal_ids: [],
    must_change_password: false,
  }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/home', component: HomePage },
      { path: '/login', name: 'login', component: { template: '<p>login</p>' } },
    ],
  })
  await router.push('/home')
  const w = mount(HomePage, {
    global: { plugins: [pinia, router, i18n, [PrimeVue, { unstyled: true }]] },
  })
  return { w, router }
}

describe('temporary home page', () => {
  it('greets the user with their role', async () => {
    const { w } = await mountHome()
    expect(w.text()).toContain('Welcome, Port Staff')
    expect(w.text()).toContain(en.home.roles.PORT_STAFF)
  })

  it('signs out to the sign-in page', async () => {
    const { w, router } = await mountHome()
    await w.find('button').trigger('click')
    await flushPromises()
    expect(auth.logout).toHaveBeenCalled()
    expect(router.currentRoute.value.path).toBe('/login')
  })
})
