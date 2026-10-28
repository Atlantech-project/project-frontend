import { onBeforeUnmount, onMounted, ref } from 'vue'

export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))

// Maps a progress value from [start, end] to [0, 1].
export const range = (progress, start, end) => clamp((progress - start) / (end - start))

/**
 * How far the page has scrolled through an element, from 0 to 1.
 * 'sticky': 0 when its top reaches the top of the viewport, 1 when its bottom reaches the bottom
 * (for a tall section with a sticky stage inside). 'pass': 0 when its top enters at the bottom,
 * 1 when its bottom leaves at the top.
 */
export function useScrollProgress(target, { mode = 'sticky' } = {}) {
  const progress = ref(0)
  let frame = 0

  function measure() {
    frame = 0
    const el = target.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    const viewport = window.innerHeight
    const distance = mode === 'sticky' ? rect.height - viewport : rect.height + viewport
    const travelled = mode === 'sticky' ? -rect.top : viewport - rect.top
    progress.value = distance > 0 ? clamp(travelled / distance) : 0
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(measure)
  }

  onMounted(() => {
    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    if (frame) cancelAnimationFrame(frame)
  })

  return progress
}
