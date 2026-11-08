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
const { default: AccessDeniedPage } = await import('./AccessDeniedPage.vue')

async function mountAt(path) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/access-denied', component: AccessDeniedPage },
      { path: '/login', name: 'login', component: { template: '<p>login</p>' } },
      { path: '/home', component: { template: '<p>home</p>' } },
    ],
  })
  await router.push(path)
  const w = mount(AccessDeniedPage, {
    global: { plugins: [pinia, router, i18n, [PrimeVue, { unstyled: true }]] },
  })
  return { w, router }
}

describe('P-20 Access Denied', () => {
  it('explains missing permissions and goes back home', async () => {
    const { w, router } = await mountAt('/access-denied?reason=permissions')
    expect(w.text()).toContain(en.accessDenied.reasons.permissions)
    await w.find('button').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/home')
  })

  it('tells a field role to use the mobile app and signs out', async () => {
    const { w, router } = await mountAt('/access-denied?reason=mobileOnly')
    expect(w.text()).toContain(en.accessDenied.reasons.mobileOnly)
    expect(w.find('button').text()).toContain(en.accessDenied.signOut)
    await w.find('button').trigger('click')
    await flushPromises()
    expect(auth.logout).toHaveBeenCalled()
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('falls back to the permissions reason for an unknown one', async () => {
    const { w } = await mountAt('/access-denied?reason=<script>')
    expect(w.text()).toContain(en.accessDenied.reasons.permissions)
  })
})
