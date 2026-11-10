import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { i18n } from '@/i18n'
import en from '@/i18n/en.json'
import { navigationFor } from '@/app/navigation'
import { useSessionStore } from '@/stores/session'
import HomePage from './HomePage.vue'
import { MAX_SHORTCUTS, SUMMARY_CARDS, shortcutsFor } from './widgets'

const Blank = { template: '<div />' }

async function mountHome(user, extraRoutes = []) {
  const pinia = createPinia()
  setActivePinia(pinia)
  useSessionStore().user = { id: 3, must_change_password: false, terminal_ids: [], ...user }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/home', name: 'home', component: Blank },
      ...extraRoutes,
      { path: '/:pathMatch(.*)*', name: 'not-found', component: Blank },
    ],
  })
  router.push('/home')
  await router.isReady()
  return mount(HomePage, { global: { plugins: [pinia, i18n, router] } })
}

describe('P-17 Home Dashboard', () => {
  it('shows who is signed in, with their role and a port-wide scope', async () => {
    const w = await mountHome({ name: 'Port Staff', role: 'PORT_STAFF' })
    expect(w.text()).toContain('Port Staff')
    expect(w.text()).toContain(en.roles.PORT_STAFF)
    expect(w.text()).toContain(en.home.scope.port)
  })

  it('tells terminal users they see their terminals only', async () => {
    const w = await mountHome({ name: 'T Admin', role: 'TERMINAL_ADMIN', terminal_ids: [2] })
    expect(w.text()).toContain(en.home.scope.terminal)
    expect(w.text()).not.toContain(en.home.scope.port)
  })

  it('shows every summary card with no data yet, and empty feeds', async () => {
    const w = await mountHome({ name: 'Port Staff', role: 'PORT_STAFF' })
    for (const card of SUMMARY_CARDS) {
      expect(w.text()).toContain(en.home.summary[card.id].title)
    }
    expect(w.text()).toContain(en.home.summary.noData)
    expect(w.text()).toContain(en.home.notifications.empty)
    expect(w.text()).toContain(en.home.updates.empty)
  })

  it('has no shortcuts while Home is the only page', async () => {
    const w = await mountHome({ name: 'Port Staff', role: 'PORT_STAFF' })
    expect(w.findAll('a')).toHaveLength(0)
    expect(w.text()).toContain(en.home.actions.empty)
  })

  it('links to the pages of the role that exist', async () => {
    const w = await mountHome({ name: 'Port Staff', role: 'PORT_STAFF' }, [
      { path: '/notifications', name: 'notifications', component: Blank },
    ])
    const links = w.findAll('a')
    expect(links).toHaveLength(1)
    expect(links[0].attributes('href')).toBe('/notifications')
    expect(links[0].text()).toBe(`View ${en.nav.notifications}`)
  })
})

describe('shortcutsFor', () => {
  it('leaves Home out and stops at the limit', () => {
    const items = shortcutsFor(navigationFor('PORT_GM'), () => true)
    expect(items).toHaveLength(MAX_SHORTCUTS)
    expect(items.map((item) => item.pageId)).not.toContain('P-17')
  })
})
