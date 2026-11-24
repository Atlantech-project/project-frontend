import { describe, it, expect, vi, afterEach } from 'vitest'
import { http as mswHttp } from 'msw'
import en from '@/i18n/en.json'
import { routes } from '@/app/router'
import { ROLES } from '@/app/roles'
import { db, problem } from '@/mocks/handlers'
import { server } from '@/mocks/server'
import { bodyButton, mountAt } from '@/features/users/testing'

const rows = (w) => w.findAll('tbody tr')
const device = (id) => db.devices.find((d) => d.id === id)

afterEach(() => (document.body.innerHTML = ''))

describe('P-25 Registered Devices', () => {
  it('is a Port Admin page', () => {
    const route = routes.find((r) => r.name === 'user-devices')
    expect(route.meta).toMatchObject({ pageId: 'P-25', roles: [ROLES.PORT_GM] })
  })

  it("lists the user's devices, newest first", async () => {
    const { wrapper: w } = await mountAt('/admin/users/4/devices')
    await vi.waitFor(() => expect(rows(w)).toHaveLength(3))
    expect(w.text()).toContain('Pilot One')
    expect(w.text().replace(/\s+/g, ' ')).toContain(
      '3 registered devices · 2 active sessions · 1 revoked session',
    )
    expect(rows(w)[0].text()).toContain(en.status.REVOKED)
    expect(rows(w)[0].text()).toContain(en.devices.restore)
    expect(rows(w)[1].text()).toContain(en.devices.platforms.IOS)
    expect(rows(w)[1].text()).toContain('2.4.1')
    expect(rows(w)[1].text()).toContain(en.devices.revoke)
  })

  it('revokes one device after the confirmation', async () => {
    const { wrapper: w } = await mountAt('/admin/users/4/devices')
    await vi.waitFor(() => expect(rows(w)).toHaveLength(3))
    await rows(w)[1].find('button').trigger('click')
    await vi.waitFor(() => expect(document.body.textContent).toContain(en.devices.confirm.title))
    bodyButton(en.devices.revoke, { last: true }).click()
    await vi.waitFor(() => expect(w.text()).toContain(en.devices.done.revokeTitle))
    expect(device(2).revoked_at).not.toBeNull()
    expect(device(1).revoked_at).toBeNull()
    await vi.waitFor(() => expect(rows(w)[1].text()).toContain(en.status.REVOKED))
  })

  it('revokes all devices at once', async () => {
    const { wrapper: w } = await mountAt('/admin/users/4/devices')
    await vi.waitFor(() => expect(rows(w)).toHaveLength(3))
    bodyButton(en.devices.revokeAll).click()
    await vi.waitFor(() => expect(document.body.textContent).toContain(en.devices.confirm.allTitle))
    bodyButton(en.devices.revokeAll, { last: true }).click()
    await vi.waitFor(() => expect(w.text()).toContain('2 devices were signed out.'))
    expect(db.devices.every((d) => d.revoked_at)).toBe(true)
  })

  it('restores a revoked device', async () => {
    const { wrapper: w } = await mountAt('/admin/users/4/devices')
    await vi.waitFor(() => expect(rows(w)).toHaveLength(3))
    await rows(w)[0].find('button').trigger('click')
    await vi.waitFor(() => expect(w.text()).toContain(en.devices.done.restoreTitle))
    expect(device(3).revoked_at).toBeNull()
  })

  it('says so when the user has no devices', async () => {
    const { wrapper: w } = await mountAt('/admin/users/2/devices')
    await vi.waitFor(() => expect(w.text()).toContain(en.devices.empty.title))
    expect(w.text()).toContain('No device sessions are recorded for Port Staff.')
  })

  it('tells the user when a revoke fails', async () => {
    server.use(
      mswHttp.post('*/api/v1/users/:user/devices/:device/revoke', () =>
        problem(503, 'SERVICE_UNAVAILABLE'),
      ),
    )
    const { wrapper: w } = await mountAt('/admin/users/4/devices')
    await vi.waitFor(() => expect(rows(w)).toHaveLength(3))
    await rows(w)[1].find('button').trigger('click')
    await vi.waitFor(() => expect(document.body.textContent).toContain(en.devices.confirm.title))
    bodyButton(en.devices.revoke, { last: true }).click()
    await vi.waitFor(() => expect(w.text()).toContain(en.devices.failed))
    expect(device(2).revoked_at).toBeNull()
  })

  it('shows the device count on P-24 with a link to P-25', async () => {
    const { wrapper: w } = await mountAt('/admin/users/4')
    await vi.waitFor(() => expect(w.text()).toContain('3 registered devices'))
    const link = w.findAll('a').find((a) => a.text().includes(en.devices.card.view))
    expect(link.attributes('href')).toBe('/admin/users/4/devices')
  })
})
