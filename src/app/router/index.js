import { createRouter, createWebHistory } from 'vue-router'

// Each feature exports its own routes; meta.pageId links a route to the Screens spec (P-xx).
// Role guards and P-20 Access Denied come with FE-021.
export const routes = [
  {
    path: '/',
    name: 'landing',
    meta: { ownHeader: true },
    component: () => import('@/app/pages/LandingPage.vue'),
  },
  {
    path: '/error',
    name: 'error',
    component: () => import('@/app/pages/ErrorPage.vue'),
  },
  // Dev builds only: preview of the shared loading, empty and error states.
  ...(import.meta.env.DEV
    ? [
        {
          path: '/dev/states',
          name: 'dev-states',
          component: () => import('@/app/pages/StatesPreviewPage.vue'),
        },
      ]
    : []),
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/app/pages/NotFoundPage.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// A page that fails to load (for example after a new deploy) shows the error page.
router.onError((error, to) => {
  console.error(error)
  if (to?.name !== 'error') router.replace({ name: 'error' })
})
