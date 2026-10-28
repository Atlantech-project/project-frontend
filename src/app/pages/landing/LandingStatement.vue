<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AtlWave from '@/components/AtlWave.vue'
import { range, useScrollProgress } from '@/composables/useScrollProgress'

const { t } = useI18n()
const section = ref(null)
const progress = useScrollProgress(section)
const reduced =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// The tide rises through the words as the reader scrolls, like the logo filling on the boot screen.
const level = computed(() => (reduced ? 1 : range(progress.value, 0.06, 0.86)))
// Height of the water (and of its gold crest just above it), wave included.
const water = (extra) =>
  `calc(${level.value * 100}% + ${Math.min(1, level.value * 20) * (14 + extra)}px)`
</script>

<template>
  <section ref="section" class="atl-statement relative h-[240svh] bg-teal-light text-navy">
    <div class="sticky top-0 grid h-svh place-items-center px-4 pt-16">
      <div
        class="relative max-w-5xl font-display text-[clamp(1.5rem,min(3.4vw,4.4svh),2.25rem)] leading-snug font-semibold tracking-tight"
      >
        <p class="text-navy/20">{{ t('landing.statement') }}</p>
        <div
          class="atl-tide atl-tide--crest absolute inset-x-0 bottom-0"
          :style="{ height: water(5) }"
          aria-hidden="true"
        >
          <p class="absolute inset-x-0 bottom-0 text-gold">{{ t('landing.statement') }}</p>
        </div>
        <div
          class="atl-tide absolute inset-x-0 bottom-0"
          :style="{ height: water(0) }"
          aria-hidden="true"
        >
          <p class="atl-tide__text absolute inset-x-0 bottom-0">{{ t('landing.statement') }}</p>
        </div>
      </div>
    </div>
    <AtlWave animated base="var(--atl-surface)" class="absolute inset-x-0 bottom-0 h-16" />
  </section>
</template>

<style scoped>
/* The water: a wavy surface on top, solid below, sliding sideways like a swell. */
.atl-tide {
  overflow: hidden;
  --atl-surface-wave: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 14'%3E%3Cpath d='M0 7 Q30 0 60 7 T120 7 V14 H0Z'/%3E%3C/svg%3E");
  mask-image: var(--atl-surface-wave), linear-gradient(#000, #000);
  mask-repeat: repeat-x, no-repeat;
  mask-size:
    120px 14px,
    100% calc(100% - 13px);
  mask-position:
    0 0,
    0 13px;
  animation: atl-swell 3.2s linear infinite;
}

.atl-tide--crest {
  animation-duration: 4.4s;
}

.atl-tide__text {
  background: linear-gradient(180deg, var(--atl-mid-teal), var(--atl-deep-navy) 70%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

@keyframes atl-swell {
  to {
    mask-position:
      120px 0,
      0 13px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .atl-statement {
    height: auto;
    padding: 6rem 0 8rem;
  }
  .atl-statement > div {
    position: relative;
    height: auto;
  }
  .atl-tide {
    animation: none;
  }
}
</style>
