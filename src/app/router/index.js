import { createRouter, createWebHistory } from 'vue-router'
import { applyTheme } from '@/composables/useTheme'
import { useSessionStore } from '@/stores/session'
import { createAuthGuard } from './guard'

// Each feature exports its own routes; meta.pageId links a route to the Screens spec (P-xx).
// Pages need a signed-in web user unless meta.public; meta.roles narrows them further (FE-021).
export const routes = [
  {
    path: '/',
    name: 'landing',
    meta: { ownHeader: true, public: true },
    component: () => import('@/app/pages/LandingPage.vue'),
  },
  {
    path: '/login',
    name: 'login',
    meta: { ownHeader: true, pageId: 'P-16', public: true },
    component: () => import('@/features/auth/PortLoginPage.vue'),
  },
  {
    path: '/change-password',
    name: 'change-password',
    meta: { ownHeader: true, pageId: 'P-16' },
    component: () => import('@/features/auth/ChangePasswordPage.vue'),
  },
  {
    path: '/access-denied',
    name: 'access-denied',
    meta: { ownHeader: true, pageId: 'P-20' },
    component: () => import('@/features/auth/AccessDeniedPage.vue'),
  },
  {
    path: '/error',
    name: 'error',
    meta: { public: true },
    component: () => import('@/app/pages/ErrorPage.vue'),
  },
  // Dev builds only: preview of the shared loading, empty and error states.
  ...(import.meta.env.DEV
    ? [
        {
          path: '/dev/states',
          name: 'dev-states',
          meta: { public: true },
          component: () => import('@/app/pages/StatesPreviewPage.vue'),
        },
      ]
    : []),
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    meta: { public: true },
    component: () => import('@/app/pages/NotFoundPage.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Links like /#how land on their section, below the fixed landing navigation.
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, top: 72 }
    return { top: 0 }
  },
})

router.beforeEach(createAuthGuard(() => useSessionStore()))

// Every page shows the visitor's chosen look, light or dark.
router.afterEach(() => applyTheme())

// A page that fails to load (for example after a new deploy) shows the error page.
router.onError((error, to) => {
  console.error(error)
  if (to?.name !== 'error') router.replace({ name: 'error' })
})
