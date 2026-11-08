import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import PrimeVue from 'primevue/config'

import App from './App.vue'
import { loadConfig } from './app/config'
import { createQueryClient } from './app/queryClient'
import { router } from './app/router'
import { redirectOnSignOut } from './app/router/guard'
import { i18n, setLocale } from './i18n'
import { installSessionHandling } from './stores/session'
import './styles/main.css'

const queryClient = createQueryClient()

const config = await loadConfig()
setLocale(config.defaultLocale)

const pinia = createPinia()
// Signing out drops the previous user's cached data.
installSessionHandling(pinia, {
  onSignedOut: () => {
    queryClient.clear()
    redirectOnSignOut(router)()
  },
})

createApp(App)
  .use(pinia)
  .use(router)
  .use(i18n)
  .use(VueQueryPlugin, { queryClient })
  // Unstyled: components get their look from the brand tokens via pass-through (FE-016).
  .use(PrimeVue, { unstyled: true })
  .mount('#app')
