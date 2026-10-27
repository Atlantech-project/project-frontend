<script setup>
import { computed } from 'vue'
import AtlWave from '@/components/AtlWave.vue'

const props = defineProps({
  // Scroll progress of the hero (0 to 1); the layers drift at different speeds.
  progress: { type: Number, default: 0 },
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
  [660, 7, 4],
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

// The port sinks and fades as the product window rises, so the two never overlap.
const fade = computed(() => ({
  opacity: 1 - Math.min(1, Math.max(0, (props.progress - 0.1) / 0.3)),
}))
const far = computed(() => `translate(0 ${props.progress * 40})`)
const near = computed(() => `translate(0 ${props.progress * 160})`)
const ship = computed(() => `translate(${-props.progress * 220} ${props.progress * 60})`)
</script>

<!-- The port at dusk: shore, cranes, container stacks and a ship coming in. -->
<template>
  <div class="pointer-events-none absolute inset-x-0 bottom-0" :style="fade" aria-hidden="true">
    <svg class="block h-[36svh] w-full" viewBox="0 0 1440 300" preserveAspectRatio="xMidYMax slice">
      <g :transform="far">
        <circle cx="1120" cy="150" r="58" fill="var(--atl-muted-gold)" opacity="0.9" />
        <circle
          cx="1120"
          cy="150"
          r="82"
          fill="none"
          stroke="var(--atl-muted-gold)"
          stroke-opacity="0.35"
          stroke-width="10"
        />
        <path
          d="M0 230 C 160 200, 280 214, 420 206 S 720 180, 900 200 S 1260 190, 1440 214 V300 H0Z"
          fill="#2c6b78"
          opacity="0.45"
        />
      </g>
      <g :transform="near">
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
        <rect x="1016" y="194" width="32" height="6" rx="1" fill="#083a4f" />
        <path d="M600 236 H1100 L1076 292 H630 Z" fill="#041f2b" />
        <path d="M604 246 H1096" stroke="#a58d66" stroke-width="3" />
      </g>
    </svg>
    <AtlWave animated base="var(--atl-light-teal)" class="absolute inset-x-0 bottom-0 h-12" />
  </div>
</template>

<style scoped>
.atl-ship {
  animation: atl-ship-bob 5s ease-in-out infinite;
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
