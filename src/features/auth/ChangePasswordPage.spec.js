import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import PrimeVue from 'primevue/config'
import { i18n } from '@/i18n'
import en from '@/i18n/en.json'
import { ApiError } from '@/api/errors'
import { isStrongEnough } from './passwordRules'

vi.mock('@/api/system', () => ({
  fetchSystemInfo: vi.fn().mockResolvedValue({ port_name: 'Alexandria Port' }),
}))
vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  fetchMe: vi.fn(),
  logout: vi.fn(),
  changePassword: vi.fn(),
}))

const auth = await import('@/api/auth')
const { useSessionStore } = await import('@/stores/session')
const { default: ChangePasswordPage } = await import('./ChangePasswordPage.vue')

const firstLogin = {
  id: 2,
  name: 'Port Staff',
  role: 'PORT_STAFF',
  terminal_ids: [],
  must_change_password: true,
}
const changed = { ...firstLogin, must_change_password: false }

async function mountPage({ signIn = true } = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const session = useSessionStore()
  if (signIn) {
    auth.login.mockResolvedValue(firstLogin)
    await session.login({ username: 'port.staff', password: 'Temp12345' })
  } else {
    auth.fetchMe.mockResolvedValue(firstLogin)
  }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/change-password', component: ChangePasswordPage },
      { path: '/login', name: 'login', component: { template: '<p>login</p>' } },
      { path: '/:any(.*)*', component: { template: '<p>next</p>' } },
    ],
  })
  await router.push('/change-password')
  const w = mount(ChangePasswordPage, {
    global: {
      plugins: [
        pinia,
        router,
        i18n,
        [VueQueryPlugin, { queryClient: new QueryClient() }],
        [PrimeVue, { unstyled: true }],
      ],
    },
  })
  await flushPromises()
  return { w, router }
}

async function fill(w, password, confirmation = password) {
  await w.find('input[name=new-password]').setValue(password)
  await w.find('input[name=confirm-password]').setValue(confirmation)
  await w.find('form').trigger('submit')
  await flushPromises()
}

beforeEach(() => vi.clearAllMocks())

describe('first sign-in password change', () => {
  it('shows two fields and sends the temporary password from the sign-in', async () => {
    auth.changePassword.mockResolvedValue(changed)
    const { w, router } = await mountPage()
    expect(w.find('input[name=current-password]').exists()).toBe(false)
    expect(w.text()).toContain(en.changePassword.messages.firstLogin.title)
    await fill(w, 'NewPass2026')
    expect(auth.changePassword).toHaveBeenCalledWith({
      currentPassword: 'Temp12345',
      newPassword: 'NewPass2026',
      confirmation: 'NewPass2026',
    })
    expect(router.currentRoute.value.fullPath).toBe('/')
  })

  it('stops a weak password and a mismatch before calling the API', async () => {
    const { w } = await mountPage()
    await fill(w, 'short1')
    expect(w.text()).toContain(en.validation.password)
    await fill(w, 'onlyletters')
    expect(w.text()).toContain(en.validation.password)
    await fill(w, 'NewPass2026', 'NewPass2027')
    expect(w.find('[role=alert]').text()).toContain(en.changePassword.messages.mismatch.title)
    expect(auth.changePassword).not.toHaveBeenCalled()
  })

  it('asks for the temporary password after a reload', async () => {
    auth.changePassword.mockResolvedValue(changed)
    const { w } = await mountPage({ signIn: false })
    await w.find('input[name=current-password]').setValue('Temp12345')
    await fill(w, 'NewPass2026')
    expect(auth.changePassword).toHaveBeenCalledWith(
      expect.objectContaining({ currentPassword: 'Temp12345' }),
    )
  })

  it('puts API rule errors on their fields and asks for the current password if it was rejected', async () => {
    auth.changePassword.mockRejectedValue(
      new ApiError({
        status: 422,
        code: 'VALIDATION_FAILED',
        fieldErrors: {
          current_password: ['validation.current_password'],
          new_password: ['validation.different'],
        },
      }),
    )
    const { w } = await mountPage()
    await fill(w, 'NewPass2026')
    expect(w.find('input[name=current-password]').exists()).toBe(true)
    expect(w.text()).toContain(en.validation.current_password)
    expect(w.text()).toContain(en.validation.different)
  })

  it('sends a signed-out visitor to the sign-in page', async () => {
    auth.fetchMe.mockRejectedValue(new ApiError({ status: 401, code: 'UNAUTHENTICATED' }))
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/change-password', component: ChangePasswordPage },
        { path: '/login', name: 'login', component: { template: '<p>login</p>' } },
      ],
    })
    await router.push('/change-password')
    mount(ChangePasswordPage, {
      global: {
        plugins: [
          pinia,
          router,
          i18n,
          [VueQueryPlugin, { queryClient: new QueryClient() }],
          [PrimeVue, { unstyled: true }],
        ],
      },
    })
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/login')
  })
})

describe('isStrongEnough', () => {
  it('needs 8 characters with letters and numbers, in any script', () => {
    expect(isStrongEnough('abc12345')).toBe(true)
    expect(isStrongEnough('abc1234')).toBe(false)
    expect(isStrongEnough('abcdefgh')).toBe(false)
    expect(isStrongEnough('12345678')).toBe(false)
    expect(isStrongEnough('مرحبا123')).toBe(true)
  })
})
