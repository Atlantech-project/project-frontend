import { describe, it, expect, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { i18n } from '@/i18n'
import en from '@/i18n/en.json'

vi.mock('@/api/auth', () => ({
  logout: vi.fn().mockResolvedValue(),
  fetchMe: vi.fn(),
  login: vi.fn(),
  changePassword: vi.fn(),
}))
vi.mock('@/api/system', () => ({
  fetchSystemInfo: vi.fn().mockResolvedValue({ port_name: 'Alexandria Port' }),
}))
const auth = await import('@/api/auth')
const { useSessionStore } = await import('@/stores/session')
const { default: AppShell } = await import('./AppShell.vue')

async function mountShell(role = 'PORT_GM') {
  const pinia = createPinia()
  setActivePinia(pinia)
  useSessionStore().user = {
    id: 1,
    name: 'N. Hassan',
    role,
    terminal_ids: [],
    must_change_password: false,
  }
  const page = { template: '<p>page</p>' }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/home', component: page, meta: { titleKey: 'nav.home' } },
      { path: '/admin/users', component: page, meta: { titleKey: 'nav.users' } },
      { path: '/login', name: 'login', component: page },
      { path: '/:any(.*)*', name: 'not-found', component: page },
    ],
  })
  await router.push('/home')
  const w = mount(AppShell, {
    slots: { default: '<p>content</p>' },
    global: {
      plugins: [pinia, router, i18n, [VueQueryPlugin, { queryClient: new QueryClient() }]],
    },
  })
  await flushPromises()
  return { w, router }
}

describe('app shell', () => {
  it('shows the page title, port, user and the page content', async () => {
    const { w } = await mountShell()
    expect(w.find('h1').text()).toBe(en.nav.home)
    expect(w.text()).toContain('Alexandria Port')
    expect(w.text()).toContain('N. Hassan')
    expect(w.text()).toContain(en.roles.PORT_GM)
    expect(w.text()).toContain('content')
  })

  it("lists only the role's pages that exist", async () => {
    const links = (await mountShell('PORT_GM')).w.findAll('nav a').map((a) => a.text())
    expect(links).toEqual([en.nav.home, en.nav.users])
    const staff = (await mountShell('PORT_STAFF')).w.findAll('nav a').map((a) => a.text())
    expect(staff).toEqual([en.nav.home])
  })

  it('marks the current page', async () => {
    const { w } = await mountShell()
    expect(w.find('nav a[aria-current="page"]').text()).toBe(en.nav.home)
  })

  it('logs out to the sign-in page', async () => {
    const { w, router } = await mountShell()
    const button = w.findAll('aside button').find((b) => b.text() === en.shell.signOut)
    await button.trigger('click')
    await flushPromises()
    expect(auth.logout).toHaveBeenCalled()
    expect(router.currentRoute.value.path).toBe('/login')
  })
})
