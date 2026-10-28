<script setup>
import mask from '@/brand/logos/atlantech-symbol-mono-white.png'

defineProps({
  size: { type: Number, default: 96 },
  // 'light' sits on a light background, 'dark' on navy.
  tone: { type: String, default: 'light' },
})
</script>

<!-- The ATLANTECH symbol filling and emptying with water, like a tide. Used while things load. -->
<template>
  <div
    class="atl-tide"
    :class="`atl-tide--${tone}`"
    :style="{ width: `${size}px`, '--atl-tide-mask': `url(${mask})` }"
    aria-hidden="true"
  >
    <div class="atl-tide__water" />
  </div>
</template>

<style scoped>
.atl-tide {
  position: relative;
  aspect-ratio: 640 / 455;
  overflow: hidden;
  mask: var(--atl-tide-mask) center / contain no-repeat;
  -webkit-mask: var(--atl-tide-mask) center / contain no-repeat;
}

.atl-tide--light {
  background: color-mix(in srgb, var(--atl-deep-navy) 12%, transparent);
}

.atl-tide--dark {
  background: color-mix(in srgb, var(--atl-off-white) 16%, transparent);
}

.atl-tide__water {
  position: absolute;
  inset: auto 0 0;
  height: 70%;
  background: linear-gradient(var(--atl-mid-teal), var(--atl-deep-navy));
  animation: atl-tide 3.2s ease-in-out infinite alternate;
}

.atl-tide--dark .atl-tide__water {
  background: linear-gradient(var(--atl-light-teal), var(--atl-mid-teal));
}

/* The moving surface: a gold crest over a teal swell, tiled so it can slide forever. */
.atl-tide__water::before {
  content: '';
  position: absolute;
  inset: -10px 0 auto;
  height: 12px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 12'%3E%3Cpath d='M0 6 Q10 0 20 6 T40 6 V12 H0Z' fill='%23a58d66'/%3E%3C/svg%3E")
    repeat-x 0 0 / 40px 12px;
  animation: atl-surf 1.4s linear infinite;
}

@keyframes atl-tide {
  from {
    height: 18%;
  }
  to {
    height: 88%;
  }
}

@keyframes atl-surf {
  to {
    background-position-x: 40px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .atl-tide__water,
  .atl-tide__water::before {
    animation: none;
  }
}
</style>
