import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import PrimeVue from 'primevue/config'
import { i18n } from '@/i18n'
import en from '@/i18n/en.json'
import { ApiError } from '@/api/errors'
import { loginMessage } from './loginMessages'

vi.mock('@/api/system', () => ({ fetchSystemInfo: vi.fn() }))
vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  fetchMe: vi.fn(),
  logout: vi.fn(),
  changePassword: vi.fn(),
}))

const { fetchSystemInfo } = await import('@/api/system')
const auth = await import('@/api/auth')
const { default: PortLoginPage } = await import('./PortLoginPage.vue')

const staff = {
  id: 1,
  name: 'Port Staff',
  role: 'PORT_STAFF',
  terminal_ids: [],
  must_change_password: false,
}

async function mountPage(path = '/login') {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', component: PortLoginPage },
      { path: '/:any(.*)*', component: { template: '<p>next</p>' } },
    ],
  })
  await router.push(path)
  const queryClient = new QueryClient()
  const w = mount(PortLoginPage, {
    global: {
      plugins: [
        pinia,
        router,
        i18n,
        [VueQueryPlugin, { queryClient }],
        [PrimeVue, { unstyled: true }],
      ],
    },
  })
  await flushPromises()
  return { w, router }
}

beforeEach(() => {
  vi.clearAllMocks()
  fetchSystemInfo.mockResolvedValue({ port_name: 'Alexandria Port' })
})

describe('P-16 Port Login', () => {
  it('shows the port from system/info', async () => {
    const { w } = await mountPage()
    expect(w.text()).toContain('Alexandria Port')
    expect(w.text()).toContain(en.login.messages.staffOnly.title)
  })

  it('still works when system/info fails', async () => {
    fetchSystemInfo.mockRejectedValue(new ApiError({ code: 'SERVICE_UNAVAILABLE' }))
    const { w } = await mountPage()
    expect(w.text()).not.toContain(en.login.currentPort)
    expect(w.text()).toContain(en.login.deploymentGeneric)
  })

  it('asks for both fields before calling the API', async () => {
    const { w } = await mountPage()
    await w.find('form').trigger('submit')
    expect(auth.login).not.toHaveBeenCalled()
    expect(w.text()).toContain(en.login.required.username)
    expect(w.text()).toContain(en.login.required.password)
  })

  it('signs in with the trimmed username and goes to the redirect', async () => {
    auth.login.mockResolvedValue(staff)
    const { w, router } = await mountPage('/login?redirect=/vessels')
    await w.find('input[name=username]').setValue('  port.staff ')
    await w.find('input[name=password]').setValue('secret123')
    await w.find('form').trigger('submit')
    await flushPromises()
    expect(auth.login).toHaveBeenCalledWith({ username: 'port.staff', password: 'secret123' })
    expect(router.currentRoute.value.fullPath).toBe('/vessels')
  })

  it('ignores a redirect to another site', async () => {
    auth.login.mockResolvedValue(staff)
    const { w, router } = await mountPage('/login?redirect=//evil.example')
    await w.find('input[name=username]').setValue('port.staff')
    await w.find('input[name=password]').setValue('secret123')
    await w.find('form').trigger('submit')
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/')
  })

  it('shows the wrong-password message and clears the password', async () => {
    auth.login.mockRejectedValue(new ApiError({ status: 401, code: 'UNAUTHENTICATED' }))
    const { w } = await mountPage()
    await w.find('input[name=username]').setValue('n.hassan')
    await w.find('input[name=password]').setValue('wrong')
    await w.find('form').trigger('submit')
    await flushPromises()
    expect(w.find('[role=alert]').text()).toContain(en.login.messages.invalidCredentials.title)
    expect(w.find('input[name=password]').element.value).toBe('')
  })
})

describe('loginMessage', () => {
  it('maps API errors and an ended session to the P-16 states', () => {
    const e = (code) => new ApiError({ code })
    expect(loginMessage()).toBe('staffOnly')
    expect(loginMessage({ error: e('UNAUTHENTICATED') })).toBe('invalidCredentials')
    expect(loginMessage({ error: e('ACCOUNT_DISABLED') })).toBe('accountDisabled')
    expect(loginMessage({ error: e('TOO_MANY_ATTEMPTS') })).toBe('tooManyAttempts')
    expect(loginMessage({ error: e('NETWORK_ERROR') })).toBe('network')
    expect(loginMessage({ error: e('SERVER_ERROR') })).toBe('generic')
    expect(loginMessage({ endedReason: 'SESSION_EXPIRED' })).toBe('sessionExpired')
  })
})
