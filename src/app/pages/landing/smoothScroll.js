import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { onBeforeUnmount, onMounted } from 'vue'

// Smooth scrolling for the landing page: the wheel glides and eases to a stop instead of
// stepping. In-page links glide too, stopping where each section's scroll margin says.
// With less motion the page keeps the browser's own scrolling.
export function useSmoothScroll() {
  let lenis = null

  function onClick(event) {
    const link = event.target.closest?.('a[href^="#"]')
    if (!link || event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const id = link.getAttribute('href').slice(1)
    const target = id ? document.getElementById(id) : null
    if (!target) return
    event.preventDefault()
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0
    lenis.scrollTo(id === 'top' ? 0 : target, { offset: -margin, duration: 1.6 })
  }

  onMounted(() => {
    // Lenis needs ResizeObserver; without it (old browsers, tests) the page scrolls natively.
    if (typeof ResizeObserver === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    lenis = new Lenis({ lerp: 0.085, autoRaf: true })
    document.addEventListener('click', onClick)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', onClick)
    lenis?.destroy()
    lenis = null
  })
}
