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

// v-tilt: the card leans a few degrees towards the pointer, as if the glass were held in the hand.
// Mouse only; touch and less motion keep it flat.
function lean(event) {
  if (event.pointerType !== 'mouse') return
  const el = event.currentTarget
  const rect = el.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width - 0.5
  const y = (event.clientY - rect.top) / rect.height - 0.5
  // Wide cards lean less, so their far edge never swings out too far.
  const k = Math.min(1, 420 / rect.width)
  el.style.setProperty('--atl-tx', `${(-y * 7 * k).toFixed(2)}deg`)
  el.style.setProperty('--atl-ty', `${(x * 9 * k).toFixed(2)}deg`)
}

function settle(event) {
  event.currentTarget.style.setProperty('--atl-tx', '0deg')
  event.currentTarget.style.setProperty('--atl-ty', '0deg')
}

export const vTilt = {
  mounted(el) {
    el.classList.add('atl-tilt')
    el.addEventListener('pointermove', lean)
    el.addEventListener('pointerleave', settle)
  },
  unmounted(el) {
    el.removeEventListener('pointermove', lean)
    el.removeEventListener('pointerleave', settle)
  },
}
