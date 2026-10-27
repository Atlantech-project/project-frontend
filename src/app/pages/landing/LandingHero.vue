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

const ease = (p) => 1 - Math.pow(1 - p, 3)

// As the page scrolls, the headline drifts back and fades, the port grows into view
// and the ship sails in until it lies alongside its berth.
const titleStyle = computed(() => {
  const p = range(progress.value, 0.02, 0.22)
  return { opacity: 1 - p, transform: `translateY(${-90 * p}px) scale(${1 - 0.12 * p})` }
})

// Wide screens zoom into the port; narrow ones keep the whole ship in view.
const zoom = typeof window !== 'undefined' && window.innerWidth >= 768 ? 0.32 : 0
const sceneStyle = computed(() => {
  const p = ease(range(progress.value, 0.04, 0.5))
  return { transform: `scale(${1 + zoom * p})` }
})

const dock = computed(() => (reduced ? 1 : ease(range(progress.value, 0.1, 0.8))))

// The vessel's status follows the ship, the same steps the dashboard shows.
const status = computed(() => {
  if (dock.value >= 1) return 'alongside'
  if (dock.value > 0.66) return 'berthing'
  if (dock.value > 0.3) return 'pilot'
  return 'approach'
})
const statusShown = computed(() => reduced || progress.value > 0.2)
</script>

<!-- Hero: a tall section whose stage stays pinned while the scroll drives the reveal. -->
<template>
  <section id="top" ref="section" class="atl-hero relative h-[240svh] text-offwhite">
    <div class="atl-hero__stage atl-sky sticky top-0 h-svh overflow-hidden">
      <PortSkyline class="atl-hero__skyline" :dock="dock" :style="sceneStyle" />

      <div
        class="atl-hero__title absolute inset-x-0 top-[max(15svh,5.5rem)] z-10 px-4 text-center"
        :style="titleStyle"
      >
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

      <div
        class="atl-hero__status absolute inset-x-0 bottom-[34svh] z-20 sm:bottom-[54svh] flex justify-center px-4 transition duration-700"
        :class="statusShown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'"
        aria-hidden="true"
      >
        <div
          class="flex items-center gap-4 rounded-[var(--atl-radius-lg)] bg-offwhite px-5 py-4 text-navy shadow-xl"
        >
          <span
            class="relative grid size-11 place-items-center rounded-full transition-colors duration-500"
            :class="status === 'alongside' ? 'bg-teal text-offwhite' : 'bg-gold/25 text-navy'"
          >
            <svg
              v-if="status === 'alongside'"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
            <span v-else class="atl-hero__ping size-3 rounded-full bg-gold" />
          </span>
          <div class="min-w-[15rem]">
            <p class="font-display text-lg font-semibold">{{ t('landing.hero.vessel') }}</p>
            <p class="text-[15px] text-navy/80">{{ t(`landing.hero.status.${status}`) }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.atl-hero__skyline {
  transform-origin: 50% 100%;
  will-change: transform;
}

.atl-hero__ping {
  animation: atl-ping 1.6s ease-out infinite;
}

@keyframes atl-ping {
  0% {
    box-shadow: 0 0 0 0 rgb(165 141 102 / 0.6);
  }
  100% {
    box-shadow: 0 0 0 12px rgb(165 141 102 / 0);
  }
}

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

/* Less motion: no pinned reveal; the headline, the status and the docked ship simply stack. */
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
  .atl-hero__status,
  .atl-hero__skyline {
    position: relative;
    inset: auto;
    opacity: 1 !important;
    transform: none !important;
    translate: none;
  }
  .atl-rise,
  .atl-hero__ping {
    animation: none;
  }
}
</style>
