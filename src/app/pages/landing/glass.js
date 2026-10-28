// v-spotlight: tracks the pointer over a card so glass.css can light the spot under it.
function move(event) {
  const el = event.currentTarget
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--atl-mx', `${event.clientX - rect.left}px`)
  el.style.setProperty('--atl-my', `${event.clientY - rect.top}px`)
}

export const vSpotlight = {
  mounted(el) {
    el.classList.add('atl-spot')
    el.addEventListener('pointermove', move)
  },
  unmounted(el) {
    el.removeEventListener('pointermove', move)
  },
}
