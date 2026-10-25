import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import PrimeVue from 'primevue/config'

import App from './App.vue'
import { router } from './app/router'
import { i18n } from './i18n'
import './styles/main.css'

const queryClient = new QueryClient({
  defaultOptions: {
    // SSE events tell us when data changes (CT-05), so no background refetch on focus.
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
})

createApp(App)
  .use(createPinia())
  .use(router)
  .use(i18n)
  .use(VueQueryPlugin, { queryClient })
  // Unstyled: components get their look from the brand tokens via pass-through (FE-016).
  .use(PrimeVue, { unstyled: true })
  .mount('#app')
