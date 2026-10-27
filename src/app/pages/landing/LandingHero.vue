<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AtlIcon from '@/components/AtlIcon.vue'
import { range, useScrollProgress } from '@/composables/useScrollProgress'
import PortPreview from './PortPreview.vue'

const { t } = useI18n()
const section = ref(null)
const progress = useScrollProgress(section)

const ease = (p) => 1 - Math.pow(1 - p, 3)

// As the page scrolls, the headline drifts back and fades while the product window
// rises from below, straightens and grows to full size.
const titleStyle = computed(() => {
  const p = range(progress.value, 0.02, 0.4)
  return { opacity: 1 - p, transform: `translateY(${-90 * p}px) scale(${1 - 0.12 * p})` }
})

const previewStyle = computed(() => {
  const p = ease(range(progress.value, 0, 0.62))
  return {
    transform: `perspective(1800px) translateY(${(1 - p) * 56}svh) rotateX(${(1 - p) * 26}deg) scale(${0.84 + 0.16 * p})`,
  }
})

const toastShown = computed(() => progress.value > 0.6)

// Depth contours, as on a nautical chart of the port approach.
const contours = Array.from({ length: 10 }, (_, k) => {
  const points = Array.from({ length: 73 }, (_, i) => {
    const a = (i / 72) * Math.PI * 2
    const r = 90 + k * 78 + 26 * Math.sin(a * 3 + k * 0.7) + 14 * Math.cos(a * 5 - k)
    return `${(1180 + r * 1.35 * Math.cos(a)).toFixed(1)} ${(760 + r * Math.sin(a)).toFixed(1)}`
  })
  return `M${points.join(' L')} Z`
})
</script>

<!-- Hero: a tall section whose stage stays pinned while the scroll drives the reveal. -->
<template>
  <section id="top" ref="section" class="atl-hero relative h-[230svh] bg-navy text-offwhite">
    <div class="atl-hero__stage sticky top-0 h-svh overflow-hidden">
      <svg
        class="absolute inset-0 size-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <path
          v-for="(d, k) in contours"
          :key="k"
          :d="d"
          fill="none"
          stroke="var(--atl-light-teal)"
          :stroke-opacity="0.16 - k * 0.012"
        />
      </svg>

      <div
        class="atl-hero__title absolute inset-x-0 top-[13svh] z-10 px-4 text-center"
        :style="titleStyle"
      >
        <h1
          class="font-display text-5xl leading-[1.04] font-semibold tracking-tight sm:text-7xl lg:text-8xl"
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
        class="atl-hero__preview absolute inset-x-0 top-1/2 z-20 mx-auto w-[min(1040px,92vw)] -translate-y-1/2"
        :style="previewStyle"
      >
        <PortPreview />
        <div
          class="absolute -bottom-6 start-6 flex items-center gap-3 rounded-[var(--atl-radius)] bg-offwhite px-4 py-3 text-navy shadow-xl transition duration-700"
          :class="toastShown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'"
        >
          <span class="grid size-9 place-items-center rounded-full bg-gold/20 text-accent-text">
            <AtlIcon name="spark" :size="20" />
          </span>
          <div>
            <p class="text-sm font-semibold">{{ t('landing.preview.toastTitle') }}</p>
            <p class="text-xs text-navy/70">{{ t('landing.preview.toastBody') }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.atl-hero__preview {
  will-change: transform;
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

/* Less motion: no pinned reveal, the headline and the window simply stack. */
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
  .atl-hero__title,
  .atl-hero__preview {
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
