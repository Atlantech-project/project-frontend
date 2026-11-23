import { describe, it, expect, vi, afterEach } from 'vitest'
import { http as mswHttp } from 'msw'
import en from '@/i18n/en.json'
import { routes } from '@/app/router'
import { ROLES } from '@/app/roles'
import { db, problem } from '@/mocks/handlers'
import { server } from '@/mocks/server'
import { userParams } from './users'
import { bodyButton, mountAt } from './testing'

const rows = (w) => w.findAll('tbody tr')

afterEach(() => (document.body.innerHTML = ''))

describe('P-23 User Management', () => {
  it('is a Port Admin page', () => {
    const route = routes.find((r) => r.name === 'users')
    expect(route.meta).toMatchObject({ pageId: 'P-23', roles: [ROLES.PORT_GM] })
  })

  it('sends only the filters that are set', () => {
    expect(userParams({ q: ' ', status: '', page: 1 })).toEqual({ page: 1, per_page: 25 })
    expect(userParams({ q: 'nadia', status: 'inactive', page: 2 })).toEqual({
      page: 2,
      per_page: 25,
      q: 'nadia',
      is_active: 0,
    })
  })

  it('lists the users by name with role, terminal and status', async () => {
    const { wrapper: w } = await mountAt('/admin/users')
    await vi.waitFor(() => expect(rows(w)).toHaveLength(5))
    expect(rows(w)[0].text()).toContain('Former Staff')
    expect(rows(w)[0].text()).toContain(en.status.INACTIVE)
    const terminalAdmin = rows(w).find((r) => r.text().includes('terminal.admin'))
    expect(terminalAdmin.text()).toContain(en.roles.TERMINAL_ADMIN)
    expect(terminalAdmin.text()).toContain('Terminal 1')
    expect(w.text()).toContain('5 users')
  })

  it('offers Deactivate on active users only', async () => {
    const { wrapper: w } = await mountAt('/admin/users')
    await vi.waitFor(() => expect(rows(w)).toHaveLength(5))
    const former = rows(w).find((r) => r.text().includes('former.staff'))
    expect(former.text()).not.toContain(en.users.table.deactivate)
    const staff = rows(w).find((r) => r.text().includes('port.staff'))
    expect(staff.text()).toContain(en.users.table.deactivate)
  })

  it('filters by account status', async () => {
    const { wrapper: w } = await mountAt('/admin/users')
    await vi.waitFor(() => expect(rows(w)).toHaveLength(5))
    await w.find('#users-status').setValue('inactive')
    await vi.waitFor(() => expect(rows(w)).toHaveLength(1))
    expect(rows(w)[0].text()).toContain('former.staff')
  })

  it('offers to clear the filters when nothing matches', async () => {
    const { wrapper: w } = await mountAt('/admin/users')
    await vi.waitFor(() => expect(rows(w)).toHaveLength(5))
    await w.find('input[type="search"]').setValue('nobody')
    await vi.waitFor(() => expect(w.text()).toContain(en.users.empty.filteredTitle), {
      timeout: 2000,
    })
    await w
      .findAll('button')
      .find((b) => b.text() === en.users.empty.clear)
      .trigger('click')
    await vi.waitFor(() => expect(rows(w)).toHaveLength(5), { timeout: 2000 })
  })

  it('deactivates a user after the confirmation', async () => {
    const { wrapper: w } = await mountAt('/admin/users')
    await vi.waitFor(() => expect(rows(w)).toHaveLength(5))
    const staff = rows(w).find((r) => r.text().includes('port.staff'))
    await staff.findAll('button').at(-1).trigger('click')
    await vi.waitFor(() => expect(document.body.textContent).toContain(en.users.deactivate.title))
    bodyButton(en.users.deactivate.confirm, { last: true }).click()
    await vi.waitFor(() =>
      expect(db.users.find((u) => u.username === 'port.staff').active).toBe(false),
    )
    await vi.waitFor(() => {
      const row = rows(w).find((r) => r.text().includes('port.staff'))
      expect(row.text()).toContain(en.status.INACTIVE)
    })
  })

  it('explains why the last active Port Admin cannot be deactivated', async () => {
    db.users.find((u) => u.username === 'port.staff').role = 'PORT_GM'
    db.users.find((u) => u.username === 'port.staff').active = false
    const { wrapper: w } = await mountAt('/admin/users', { as: 'port.staff' })
    await vi.waitFor(() => expect(rows(w)).toHaveLength(5))
    const gm = rows(w).find((r) => r.text().includes('port.gm'))
    await gm.findAll('button').at(-1).trigger('click')
    await vi.waitFor(() => expect(document.body.textContent).toContain(en.users.deactivate.title))
    bodyButton(en.users.deactivate.confirm, { last: true }).click()
    await vi.waitFor(() =>
      expect(document.body.textContent).toContain(en.users.deactivate.refusedTitle),
    )
    expect(db.users.find((u) => u.username === 'port.gm').active).toBe(true)
  })

  it('shows an error with a retry', async () => {
    server.use(mswHttp.get('*/api/v1/users', () => problem(503, 'SERVICE_UNAVAILABLE')))
    const { wrapper: w } = await mountAt('/admin/users')
    await vi.waitFor(() => expect(w.text()).toContain(en.users.error), { timeout: 4000 })
    expect(w.text()).toContain(en.states.retry)
  })
})
