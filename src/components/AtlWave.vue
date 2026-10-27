<script setup>
const props = defineProps({
  animated: { type: Boolean, default: false },
  // Colour of the lowest layer; set it to the next section's background to blend into it.
  base: { type: String, default: 'var(--atl-deep-navy)' },
})

// The brand wave motif: four layers in the palette (light teal, gold, mid teal, navy).
// Each layer is two copies of one 1200-wide period, so sliding it by half loops seamlessly.
const layers = [
  {
    d: 'M0 38 C 200 10, 400 10, 600 32 S 1000 56, 1200 38',
    fill: 'var(--atl-light-teal)',
    opacity: 0.55,
    speed: 18,
  },
  {
    d: 'M0 46 C 220 22, 420 24, 640 40 S 1010 58, 1200 46',
    fill: 'var(--atl-muted-gold)',
    opacity: 1,
    speed: 14,
  },
  {
    d: 'M0 52 C 240 34, 460 36, 680 48 S 1030 62, 1200 52',
    fill: 'var(--atl-mid-teal)',
    opacity: 1,
    speed: 11,
  },
  {
    d: 'M0 57 C 260 46, 500 48, 720 55 S 1050 64, 1200 57',
    fill: null,
    opacity: 1,
    speed: 8,
  },
]

function tile(d) {
  const shifted = d.replace(
    /(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g,
    (_, x, y) => `${+x + 1200} ${y}`,
  )
  return `${d} L1200 60 L0 60 Z M${shifted.slice(1)} L2400 60 L1200 60 Z`
}
</script>

<template>
  <svg
    class="atl-wave block w-full"
    :class="{ 'atl-wave--animated': animated }"
    viewBox="0 0 1200 60"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path
      v-for="(layer, i) in layers"
      :key="i"
      :d="tile(layer.d)"
      :fill="layer.fill ?? props.base"
      :opacity="layer.opacity"
      :style="{ animationDuration: `${layer.speed}s` }"
    />
  </svg>
</template>

<style scoped>
.atl-wave--animated path {
  animation-name: atl-wave-slide;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes atl-wave-slide {
  to {
    transform: translateX(-1200px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .atl-wave--animated path {
    animation: none;
  }
}
</style>
