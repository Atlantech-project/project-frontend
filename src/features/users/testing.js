// Mounts a users page inside a real router for the FE-045 tests. Test use only.
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { VueQueryPlugin } from '@tanstack/vue-query'
import PrimeVue from 'primevue/config'
import { i18n } from '@/i18n'
import { createQueryClient } from '@/app/queryClient'
import { routes } from '@/app/router'
import { signInAs } from '@/mocks/handlers'
import { useSessionStore } from '@/stores/session'

export async function mountAt(path, { as = 'port.gm' } = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  useSessionStore().user = signInAs(as)
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  await router.isReady()
  const wrapper = mount(
    { template: '<RouterView />' },
    {
      global: {
        plugins: [
          pinia,
          router,
          i18n,
          [PrimeVue, { unstyled: true }],
          [VueQueryPlugin, { queryClient: createQueryClient() }],
        ],
      },
      attachTo: document.body,
    },
  )
  return { wrapper, router }
}

// A button anywhere on the page, dialogs included (they open in document.body).
export function bodyButton(text, { last = false } = {}) {
  const found = [...document.body.querySelectorAll('button')].filter((b) =>
    b.textContent.includes(text),
  )
  return last ? found.at(-1) : found[0]
}
