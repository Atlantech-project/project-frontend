// v-reveal: adds `is-in` the first time an element scrolls into view; reveal.css animates it.
//   v-reveal           rise, fade and sharpen in
//   v-reveal="2"       stagger: waits 2 steps before starting
let observer = null

function reducedMotion() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

function watch(el) {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-in')
        observer.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -6% 0px' },
  )
  observer.observe(el)
}

export const vReveal = {
  mounted(el, { value }) {
    el.classList.add('atl-reveal')
    if (value != null) el.style.setProperty('--atl-i', value)
    // No observer (tests) or less motion wanted: show it straight away.
    if (typeof IntersectionObserver === 'undefined' || reducedMotion()) el.classList.add('is-in')
    else watch(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
