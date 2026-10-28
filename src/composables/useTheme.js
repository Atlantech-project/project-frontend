import { ref } from 'vue'

// Light or dark look, chosen by the visitor and remembered on this device.
// Until they choose, the page follows the system setting.
const KEY = 'atl-theme'

function stored() {
  try {
    const value = localStorage.getItem(KEY)
    return value === 'dark' || value === 'light' ? value : null
  } catch {
    return null
  }
}

function system() {
  return typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export const theme = ref(stored() ?? system())

export function applyTheme() {
  document.documentElement.dataset.theme = theme.value
}

// Switching spreads the new look out in a circle from the button (where the browser supports
// view transitions and the visitor allows motion); otherwise it simply changes.
export function toggleTheme(event) {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  try {
    localStorage.setItem(KEY, theme.value)
  } catch {
    // Private mode or blocked storage: the choice lasts for this visit only.
  }

  const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || calm || !event) return applyTheme()

  const x = event.clientX
  const y = event.clientY
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
  const swap = document.startViewTransition(applyTheme)
  swap.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      {
        duration: 650,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        pseudoElement: '::view-transition-new(root)',
      },
    )
  })
}
