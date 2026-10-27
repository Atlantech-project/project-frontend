<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { range, useScrollProgress } from '@/composables/useScrollProgress'
import PortSkyline from './PortSkyline.vue'

const { t } = useI18n()
const section = ref(null)
const progress = useScrollProgress(section)
const reduced =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const smooth = (p) => p * p * (3 - 2 * p)

// The headline stays while the scroll sails the ship across the harbour, from the open sea
// on the right to the far left of the port.
const sail = computed(() => (reduced ? 1 : smooth(range(progress.value, 0.02, 0.92))))
</script>

<!-- Hero: a tall section whose stage stays pinned while the scroll sails the ship. -->
<template>
  <section id="top" ref="section" class="atl-hero relative h-[200svh] text-offwhite">
    <div class="atl-hero__stage atl-sky sticky top-0 h-svh overflow-hidden">
      <PortSkyline class="atl-hero__skyline" :sail="sail" />

      <div class="atl-hero__title absolute inset-x-0 top-[max(15svh,5.5rem)] z-10 px-4 text-center">
        <h1
          class="font-display text-4xl leading-[1.04] font-semibold tracking-tight sm:text-7xl lg:text-8xl"
        >
          <span class="atl-rise block" style="--atl-rise-delay: 120ms">
            {{ t('landing.hero.line1') }}
          </span>
          <span class="atl-rise block" style="--atl-rise-delay: 260ms">
            {{ t('landing.hero.line2') }}
          </span>
        </h1>
        <p
          class="atl-rise mx-auto mt-5 max-w-xl text-lg text-offwhite/75 sm:text-xl"
          style="--atl-rise-delay: 420ms"
        >
          {{ t('landing.hero.body') }}
        </p>
        <div
          class="atl-rise mt-8 flex flex-wrap justify-center gap-3"
          style="--atl-rise-delay: 560ms"
        >
          <a
            href="#how"
            class="rounded-full bg-offwhite px-6 py-3 font-semibold text-navy transition-colors hover:bg-white"
          >
            {{ t('landing.hero.ctaHow') }}
          </a>
          <a
            href="#features"
            class="rounded-full border border-offwhite/30 px-6 py-3 font-semibold transition-colors hover:bg-offwhite/10"
          >
            {{ t('landing.hero.ctaFeatures') }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Dusk over the port: flat deep navy sky, the sun drawn flat in the skyline scene. */
.atl-sky {
  background: var(--atl-deep-navy);
}

.atl-rise {
  animation: atl-rise 1.1s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  animation-delay: var(--atl-rise-delay, 0ms);
}

@keyframes atl-rise {
  from {
    opacity: 0;
    transform: translateY(28px);
    filter: blur(8px);
  }
}

/* Less motion: no pinned reveal; the headline and the port simply stack. */
@media (prefers-reduced-motion: reduce) {
  .atl-hero {
    height: auto;
  }
  .atl-hero__stage {
    position: relative;
    height: auto;
    display: grid;
    gap: 3rem;
    padding: 5rem 0 6rem;
  }
  .atl-hero__skyline {
    position: relative;
    order: 3;
  }
  .atl-hero__title,
  .atl-hero__skyline {
    position: relative;
    inset: auto;
    opacity: 1 !important;
    transform: none !important;
    translate: none;
  }
  .atl-rise {
    animation: none;
  }
}
</style>
