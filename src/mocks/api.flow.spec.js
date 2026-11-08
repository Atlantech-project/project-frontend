// The real API client, session store and data loaders against the mock API (FE-034).
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { http as mswHttp } from 'msw'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { resetCsrfCookie } from '@/api/http'
import { fetchSystemInfo } from '@/api/system'
import { createResource } from '@/api/resource'
import { createQueryClient } from '@/app/queryClient'
import { useResourceList } from '@/composables/useResource'
import { useSessionStore } from '@/stores/session'
import { server } from './server'
import { problem, signInAs } from './handlers'
import { NEW_PASSWORD, TEMP_PASSWORD } from './fixtures'

beforeEach(() => {
  resetCsrfCookie()
  setActivePinia(createPinia())
})

describe('sign-in against the mock API', () => {
  it('reads the port name', async () => {
    await expect(fetchSystemInfo()).resolves.toEqual({ port_name: 'Alexandria Port' })
  })

  it('rejects a wrong password with the API error code', async () => {
    const session = useSessionStore()
    await expect(session.login({ username: 'port.gm', password: 'nope' })).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHENTICATED',
    })
    expect(session.isSignedIn).toBe(false)
  })

  it('refuses a disabled account', async () => {
    const session = useSessionStore()
    await expect(
      session.login({ username: 'former.staff', password: TEMP_PASSWORD }),
    ).rejects.toMatchObject({ code: 'ACCOUNT_DISABLED' })
  })

  it('first sign-in: must change the password, then can work', async () => {
    const session = useSessionStore()
    await session.login({ username: 'port.gm', password: TEMP_PASSWORD })
    expect(session.mustChangePassword).toBe(true)

    await expect(
      session.changePassword({ newPassword: 'short1', confirmation: 'short1' }),
    ).rejects.toMatchObject({ code: 'VALIDATION_FAILED' })

    await session.changePassword({ newPassword: NEW_PASSWORD, confirmation: NEW_PASSWORD })
    expect(session.mustChangePassword).toBe(false)
    expect(session.role).toBe('PORT_GM')
  })

  it('restores the session after a reload and ends it on logout', async () => {
    signInAs('port.staff')
    const session = useSessionStore()
    await session.restore()
    expect(session.user.name).toBe('Port Staff')
    await session.logout()
    expect(session.isSignedIn).toBe(false)
    await session.restore({ force: true })
    expect(session.isSignedIn).toBe(false)
  })
})

describe('lists against the mock API', () => {
  const auditLogs = createResource('/audit-logs')

  function mountList(params) {
    let list
    mount(
      defineComponent({
        setup() {
          list = useResourceList(auditLogs, params)
          return () => null
        },
      }),
      { global: { plugins: [[VueQueryPlugin, { queryClient: createQueryClient() }]] } },
    )
    return list
  }

  it('loads a filtered page with its meta', async () => {
    signInAs('port.gm')
    const list = mountList({ page: 2, per_page: 10, entity_type: 'berths' })
    await vi.waitFor(() => expect(list.items.value).toHaveLength(10))
    expect(list.items.value.every((row) => row.entity_type === 'berths')).toBe(true)
    expect(list.meta.value).toEqual({ page: 2, per_page: 10, total: 22 })
  })

  it('one answer can be swapped for a test, e.g. a server failure', async () => {
    signInAs('port.gm')
    server.use(mswHttp.get('*/api/v1/audit-logs', () => problem(503, 'SERVICE_UNAVAILABLE')))
    await expect(auditLogs.list()).rejects.toMatchObject({
      status: 503,
      code: 'SERVICE_UNAVAILABLE',
    })
  })
})
