import { describe, it, expect, vi, afterEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import en from '@/i18n/en.json'
import { routes } from '@/app/router'
import { ROLES } from '@/app/roles'
import { db } from '@/mocks/handlers'
import { createErrors } from './users'
import { bodyButton, mountAt } from './testing'

afterEach(() => (document.body.innerHTML = ''))

const byUsername = (username) => db.users.find((u) => u.username === username)

describe('P-24 User Details', () => {
  it('is a Port Admin page for create and edit', () => {
    for (const name of ['user-new', 'user-details']) {
      const route = routes.find((r) => r.name === name)
      expect(route.meta).toMatchObject({ pageId: 'P-24', roles: [ROLES.PORT_GM] })
    }
  })

  it('checks the create form before sending it', () => {
    expect(createErrors({ name: '', username: 'Bad Name', role: '', terminalId: '' })).toEqual({
      name: 'validation.required',
      username: 'users.form.usernameRule',
    })
    expect(
      createErrors({ name: 'Omar', username: 'omar.h', role: 'TERMINAL_OFFICER', terminalId: '' }),
    ).toEqual({ terminal_id: 'validation.required' })
    expect(
      createErrors({ name: 'Omar', username: 'omar.h', role: 'TERMINAL_OFFICER', terminalId: '2' }),
    ).toEqual({})
  })

  it('creates a user with a role and shows the one-time password once', async () => {
    const { wrapper: w, router } = await mountAt('/admin/users/new')
    expect(w.text()).toContain(en.users.form.createTitle)
    await w.find('#user-name').setValue('Omar Hassan')
    await w.find('#user-username').setValue('omar.hassan')
    await w.find('#user-role').setValue('TERMINAL_OFFICER')
    await w.find('#user-terminal').setValue('2')
    await w.find('form').trigger('submit')
    await vi.waitFor(() => expect(document.body.textContent).toContain(en.users.created.title))
    expect(document.querySelector('[data-testid="one-time-password"]').textContent).toBe(
      'OneTime-Pass-2026-xyz',
    )
    const saved = byUsername('omar.hassan')
    expect(saved).toMatchObject({ role: 'TERMINAL_OFFICER', terminal_ids: [2], active: true })

    bodyButton(en.users.created.done).click()
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('user-details'))
    expect(router.currentRoute.value.params.id).toBe(String(saved.id))
  })

  it('shows the server checks on the form', async () => {
    const { wrapper: w } = await mountAt('/admin/users/new')
    await w.find('#user-name').setValue('Someone')
    await w.find('#user-username').setValue('port.staff')
    await w.find('form').trigger('submit')
    await vi.waitFor(() => expect(w.text()).toContain(en.errors.validation_failed))
  })

  it('loads a user with name and username fixed, and the role history', async () => {
    const { wrapper: w } = await mountAt('/admin/users/3')
    await vi.waitFor(() => expect(w.text()).toContain(en.users.form.editTitle))
    expect(w.find('#user-name').element.value).toBe('Terminal Admin')
    expect(w.find('#user-name').attributes('disabled')).toBeDefined()
    expect(w.find('#user-username').attributes('disabled')).toBeDefined()
    expect(w.find('#user-role').element.value).toBe('TERMINAL_ADMIN')
    expect(w.find('#user-terminal').element.value).toBe('1')
    expect(w.text()).toContain(en.users.history.title)
    expect(w.text()).toContain(en.users.history.current)
  })

  it('shows the role history when opened from the list', async () => {
    const { wrapper: w, router } = await mountAt('/admin/users')
    await vi.waitFor(() => expect(w.findAll('tbody tr')).toHaveLength(5))
    await router.push('/admin/users/3')
    await vi.waitFor(() => expect(w.text()).toContain(en.users.history.title))
    expect(w.text()).toContain(en.users.history.current)
  })

  it('changes the role and goes back to the list', async () => {
    const { wrapper: w, router } = await mountAt('/admin/users/2')
    await vi.waitFor(() => expect(w.find('#user-role').exists()).toBe(true))
    await w.find('#user-role').setValue('PILOTAGE_OFFICER')
    await w.find('form').trigger('submit')
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('users'))
    expect(byUsername('port.staff').role).toBe('PILOTAGE_OFFICER')
  })

  it('activates an inactive user from the status field', async () => {
    const { wrapper: w, router } = await mountAt('/admin/users/5')
    await vi.waitFor(() => expect(w.find('#user-status').exists()).toBe(true))
    expect(w.find('#user-status').element.value).toBe('inactive')
    await w.find('#user-status').setValue('active')
    await w.find('form').trigger('submit')
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('users'))
    expect(byUsername('former.staff').active).toBe(true)
  })

  it("won't let the Port Admin switch off their own account", async () => {
    const { wrapper: w } = await mountAt('/admin/users/1')
    await vi.waitFor(() => expect(w.find('#user-status').exists()).toBe(true))
    expect(w.find('#user-status').attributes('disabled')).toBeDefined()
    expect(w.text()).toContain(en.users.form.selfHint)
  })

  it('tells the user when someone else changed the record first', async () => {
    const { wrapper: w } = await mountAt('/admin/users/2')
    await vi.waitFor(() => expect(w.find('#user-role').exists()).toBe(true))
    byUsername('port.staff').version = 'v2-9'
    await w.find('#user-role').setValue('TUG_OFFICER')
    await w.find('form').trigger('submit')
    await vi.waitFor(() => expect(document.body.textContent).toContain(en.conflict.body))
    bodyButton(en.conflict.reload).click()
    await vi.waitFor(() => expect(document.body.textContent).not.toContain(en.conflict.body))
    await flushPromises()
    expect(w.find('#user-role').element.value).toBe('PORT_STAFF')
    expect(byUsername('port.staff').role).toBe('PORT_STAFF')
  })
})
