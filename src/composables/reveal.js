// v-reveal: fades and lifts an element in the first time it scrolls into view.
// v-reveal="150" delays it by 150ms, for staggering a row of cards.
const observers = new WeakMap()

export const vReveal = {
  mounted(el, binding) {
    el.classList.add('atl-reveal')
    if (binding.value) el.style.setProperty('--atl-reveal-delay', `${binding.value}ms`)

    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible')
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.classList.add('is-visible')
        observer.disconnect()
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )
    observer.observe(el)
    observers.set(el, observer)
  },
  unmounted(el) {
    observers.get(el)?.disconnect()
  },
}
