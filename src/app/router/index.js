import { createRouter, createWebHistory } from 'vue-router'

// Each feature exports its own routes; meta.pageId links a route to the Screens spec (P-xx).
// Role guards and P-20 Access Denied come with FE-021.
export const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/features/home/pages/HomePage.vue'),
    meta: { pageId: null },
  },
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
