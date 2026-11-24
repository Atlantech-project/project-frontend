import { describe, it, expect, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import PrimeVue from 'primevue/config'
import { http as mswHttp } from 'msw'
import { i18n } from '@/i18n'
import en from '@/i18n/en.json'
import { createQueryClient } from '@/app/queryClient'
import { db, problem, signInAs } from '@/mocks/handlers'
import { server } from '@/mocks/server'
import { routes } from '@/app/router'
import { ROLES } from '@/app/roles'
import AuditPage from './AuditPage.vue'

function mountPage() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(AuditPage, {
    global: {
      plugins: [
        pinia,
        i18n,
        [PrimeVue, { unstyled: true }],
        [VueQueryPlugin, { queryClient: createQueryClient() }],
      ],
    },
  })
}

const rows = (w) => w.findAll('tbody tr')

describe('P-29 Port Audit & Change History', () => {
  it('is a Port Admin page', () => {
    const route = routes.find((r) => r.name === 'audit')
    expect(route.meta).toMatchObject({ pageId: 'P-29', roles: [ROLES.PORT_GM] })
  })

  it('lists the newest changes with time, actor, entity and action', async () => {
    signInAs('port.gm')
    db.auditLogs.forEach((row) => (row.occurred_at = new Date().toISOString()))
    const w = mountPage()
    await vi.waitFor(() => expect(rows(w)).toHaveLength(25))
    expect(rows(w)[0].text()).toContain('Port General Manager')
    expect(rows(w)[0].text()).toContain('User #1')
    expect(rows(w)[0].text()).toContain(en.audit.actions.CREATE)
    expect(w.text()).toContain('1–25 of 45 changes')
  })

  it('pages through the history', async () => {
    signInAs('port.gm')
    db.auditLogs.forEach((row) => (row.occurred_at = new Date().toISOString()))
    const w = mountPage()
    await vi.waitFor(() => expect(rows(w)).toHaveLength(25))
    await w
      .findAll('button')
      .find((b) => b.text() === en.audit.table.next)
      .trigger('click')
    await vi.waitFor(() => expect(w.text()).toContain('26–45 of 45 changes'))
    expect(rows(w)).toHaveLength(20)
  })

  it('filters by entity type and action', async () => {
    signInAs('port.gm')
    db.auditLogs.forEach((row) => (row.occurred_at = new Date().toISOString()))
    const w = mountPage()
    await vi.waitFor(() => expect(rows(w)).toHaveLength(25))
    await w.find('#audit-entity').setValue('berths')
    await vi.waitFor(() => expect(w.text()).toContain('of 22 changes'))
    expect(rows(w).every((row) => row.text().includes('Berth #'))).toBe(true)
  })

  it('offers to clear the filters when nothing matches', async () => {
    signInAs('port.gm')
    const w = mountPage()
    // The fixtures are from October 2026, outside the default last 30 days.
    await vi.waitFor(() => expect(w.text()).toContain(en.audit.empty.filteredTitle))
    await w
      .findAll('button')
      .find((b) => b.text() === en.audit.empty.clear)
      .trigger('click')
    await vi.waitFor(() => expect(rows(w)).toHaveLength(25))
  })

  it('says so when the history is empty', async () => {
    signInAs('port.gm')
    db.auditLogs = []
    const w = mountPage()
    await vi.waitFor(() => expect(w.text()).toContain(en.audit.empty.filteredTitle))
    await w.find('#audit-range').setValue('0')
    await vi.waitFor(() => expect(w.text()).toContain(en.audit.empty.title))
  })

  it('shows an error with a retry', async () => {
    signInAs('port.gm')
    server.use(mswHttp.get('*/api/v1/audit-logs', () => problem(503, 'SERVICE_UNAVAILABLE')))
    const w = mountPage()
    await vi.waitFor(() => expect(w.text()).toContain(en.audit.error), { timeout: 4000 })
    expect(w.text()).toContain(en.states.retry)
  })

  it('opens the before and after values of one change, and goes back', async () => {
    signInAs('port.gm')
    db.auditLogs = [
      {
        id: 9,
        actor: { id: 1, name: 'Port General Manager', username: 'port.gm' },
        entity_type: 'berths',
        entity_id: 3,
        action: 'UPDATE',
        before_state: { draft_depth: 13.5, max_loa: 290 },
        after_state: { draft_depth: 14, max_loa: 300 },
        occurred_at: new Date().toISOString(),
      },
      {
        id: 8,
        actor: null,
        entity_type: 'users',
        entity_id: null,
        action: 'REJECTED_ATTEMPT',
        before_state: null,
        after_state: {
          route: 'auth.login',
          status: 401,
          code: 'INVALID_CREDENTIALS',
          reason: 'Wrong password',
        },
        occurred_at: new Date().toISOString(),
      },
    ]
    const w = mountPage()
    await vi.waitFor(() => expect(rows(w)).toHaveLength(2))
    expect(rows(w)[0].text()).toContain('Draft depth: 13.5 → 14 (+1 more)')
    expect(rows(w)[1].text()).toContain(en.audit.system)
    expect(rows(w)[1].text()).toContain(en.audit.actions.REJECTED_ATTEMPT)
    expect(rows(w)[1].text()).toContain('Wrong password')

    await rows(w)[0].find('button').trigger('click')
    await flushPromises()
    expect(w.text()).toContain(en.audit.details.summary)
    expect(w.text()).toContain('2 fields changed')
    expect(w.text()).toContain('Max loa')
    expect(w.text()).toContain('290')
    expect(w.text()).toContain('300')

    await w
      .findAll('button')
      .find((b) => b.text() === en.audit.details.back)
      .trigger('click')
    expect(rows(w)).toHaveLength(2)
  })
})
