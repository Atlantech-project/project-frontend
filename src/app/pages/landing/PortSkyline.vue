<script setup>
import { computed } from 'vue'
import AtlWave from '@/components/AtlWave.vue'

const props = defineProps({
  // How far the ship has sailed, from 0 (out of sight past the right edge) to 1 (gone past the left edge).
  sail: { type: Number, default: 1 },
  // How far the moon has risen behind the cranes (0 to 1); at 0 it is fully below the horizon.
  moon: { type: Number, default: 1 },
  // How many of the port's lights are on (0 to 1); they switch on one after another.
  lights: { type: Number, default: 1 },
})

const cranes = [
  { x: 250, fill: 'var(--atl-light-teal)' },
  { x: 470, fill: 'var(--atl-muted-gold)' },
  { x: 1040, fill: 'var(--atl-light-teal)' },
]
const palette = ['#a58d66', '#407e8c', '#c0d5d6', '#e5e1dd', '#2c6b78', '#8c7552']
// Container stacks on the quay: [x, columns, rows].
const stacks = [
  [40, 5, 3],
  [1220, 6, 3],
]
const boxes = stacks.flatMap(([x, cols, rows], s) =>
  Array.from({ length: cols * rows }, (_, i) => ({
    x: x + (i % cols) * 30,
    y: 254 - Math.floor(i / cols) * 15,
    fill: palette[(i * 5 + s * 3 + Math.floor(i / cols)) % palette.length],
  })),
)
const cargo = Array.from({ length: 24 }, (_, i) => ({
  x: 640 + (i % 12) * 30,
  y: 222 - Math.floor(i / 12) * 15,
  fill: palette[(i * 7 + 2) % palette.length],
}))

// Floodlights on each crane's apex and beam ends, switched on from left to right.
// Where two cranes' beams meet, they share one lamp.
const lamps = cranes
  .flatMap((c) => [
    [c.x - 62, 113],
    [c.x + 36, 54],
    [c.x + 158, 113],
  ])
  .sort((a, b) => a[0] - b[0])
  .filter(([x], i, all) => i === 0 || x - all[i - 1][0] > 30)
const lampOn = (i) => props.lights > (i + 0.5) / lamps.length
const moonY = computed(() => (1 - props.moon) * 420)

const ship = computed(() => `translate(${860 - props.sail * 2000} 0)`)
// The wake shows only while the ship is moving.
const wake = computed(() => (props.sail > 0.02 && props.sail < 0.98 ? 0.7 : 0))
</script>

<!-- The port at dusk: shore, cranes, container stacks and a ship sailing across the harbour. -->
<template>
  <div class="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true">
    <svg
      class="block h-[26svh] w-full overflow-visible sm:h-[36svh]"
      viewBox="0 0 1440 300"
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <clipPath id="atl-horizon"><rect y="-400" width="1440" height="632" /></clipPath>
        <radialGradient id="atl-moon-halo">
          <stop offset="0.35" stop-color="#e5e1dd" stop-opacity="0.22" />
          <stop offset="1" stop-color="#e5e1dd" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="atl-lamp-glow">
          <stop offset="0" stop-color="#f6e2b8" stop-opacity="0.75" />
          <stop offset="1" stop-color="#f6e2b8" stop-opacity="0" />
        </radialGradient>
      </defs>
      <g>
        <g clip-path="url(#atl-horizon)">
          <g :transform="`translate(0 ${moonY})`" :opacity="moon > 0 ? 1 : 0">
            <circle cx="1120" cy="-60" r="120" fill="url(#atl-moon-halo)" />
            <circle cx="1120" cy="-60" r="48" fill="#e5e1dd" />
            <circle cx="1102" cy="-74" r="9" fill="#c0d5d6" opacity="0.7" />
            <circle cx="1136" cy="-46" r="6" fill="#c0d5d6" opacity="0.6" />
            <circle cx="1130" cy="-80" r="4" fill="#c0d5d6" opacity="0.6" />
            <circle cx="1108" cy="-40" r="3" fill="#c0d5d6" opacity="0.5" />
          </g>
        </g>
        <path
          d="M0 230 C 160 200, 280 214, 420 206 S 720 180, 900 200 S 1260 190, 1440 214 V300 H0Z"
          fill="#2c6b78"
          opacity="0.45"
        />
      </g>
      <g>
        <g v-for="c in cranes" :key="c.x" :transform="`translate(${c.x} 0)`" :fill="c.fill">
          <rect x="0" y="118" width="8" height="152" />
          <rect x="64" y="118" width="8" height="152" />
          <path d="M4 200 L68 160 M4 160 L68 200" :stroke="c.fill" stroke-width="3" />
          <rect x="-70" y="108" width="236" height="10" />
          <path d="M0 108 L36 54 L72 108 Z" fill="none" :stroke="c.fill" stroke-width="5" />
          <path d="M36 54 L-70 108 M36 54 L166 108" :stroke="c.fill" stroke-width="1.5" />
          <rect x="22" y="118" width="26" height="14" rx="2" />
        </g>
        <rect
          v-for="(b, i) in boxes"
          :key="i"
          :x="b.x"
          :y="b.y"
          width="28"
          height="14"
          rx="1.5"
          :fill="b.fill"
        />
        <rect x="0" y="268" width="1440" height="32" fill="#06303f" />
        <g
          v-for="([x, y], i) in lamps"
          :key="`lamp-${i}`"
          class="atl-lamp"
          :opacity="lampOn(i) ? 1 : 0"
        >
          <circle :cx="x" :cy="y" r="16" fill="url(#atl-lamp-glow)" />
          <circle :cx="x" :cy="y" r="3.5" fill="#fff3d6" />
        </g>
      </g>
      <g :transform="ship" class="atl-ship">
        <rect
          v-for="(b, i) in cargo"
          :key="i"
          :x="b.x"
          :y="b.y"
          width="28"
          height="14"
          rx="1.5"
          :fill="b.fill"
        />
        <rect x="1010" y="186" width="44" height="50" rx="3" fill="#e5e1dd" />
        <rect
          x="1016"
          y="194"
          width="32"
          height="6"
          rx="1"
          class="atl-lamp"
          :fill="lights > 0.5 ? '#f6e2b8' : '#083a4f'"
        />
        <path d="M600 236 H1100 L1076 292 H630 Z" fill="#041f2b" />
        <path d="M604 246 H1096" stroke="#a58d66" stroke-width="3" />
        <path
          d="M1084 286 C 1150 280, 1220 292, 1300 284 M1090 294 C 1170 290, 1250 298, 1340 292"
          stroke="#e5e1dd"
          stroke-width="2"
          stroke-linecap="round"
          fill="none"
          class="transition-opacity duration-500"
          :opacity="wake"
        />
      </g>
    </svg>
    <AtlWave animated base="var(--atl-light-teal)" class="absolute inset-x-0 bottom-0 h-12" />
  </div>
</template>

<style scoped>
.atl-ship {
  animation: atl-ship-bob 5s ease-in-out infinite;
}

.atl-lamp {
  transition:
    opacity 0.5s,
    fill 0.5s;
}

@keyframes atl-ship-bob {
  50% {
    translate: 0 3px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .atl-ship {
    animation: none;
  }
}
</style>
