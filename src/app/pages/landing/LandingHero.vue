<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
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
// on the right until it leaves the port on the left. The ship eases towards the scroll
// position instead of jumping with it, so it glides at its own slow pace.
const target = () => (reduced ? 1 : smooth(range(progress.value, 0.02, 0.92)))
const sail = ref(target())
// The port's lights switch on as the ship arrives, then night turns to dawn.
const lights = computed(() => range(sail.value, 0.02, 0.32))
const dawn = computed(() => range(sail.value, 0.3, 1))
let frame = 0

function glide() {
  const gap = target() - sail.value
  sail.value = Math.abs(gap) < 0.0005 ? target() : sail.value + gap * 0.035
  frame = sail.value === target() ? 0 : requestAnimationFrame(glide)
}

watch(progress, () => {
  if (!frame) frame = requestAnimationFrame(glide)
})

onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>

<!-- Hero: a tall section whose stage stays pinned while the scroll sails the ship. -->
<template>
  <section id="top" ref="section" class="atl-hero relative h-[320svh] text-offwhite">
    <div class="atl-hero__stage atl-sky sticky top-0 h-svh overflow-hidden">
      <div class="atl-hero__dawn absolute inset-0" :style="{ opacity: dawn }" aria-hidden="true" />
      <div
        class="atl-hero__stars absolute inset-0"
        :style="{ opacity: 1 - dawn }"
        aria-hidden="true"
      />
      <PortSkyline class="atl-hero__skyline" :sail="sail" :dawn="dawn" :lights="lights" />

      <div class="atl-hero__title absolute inset-x-0 top-[max(15svh,5.5rem)] z-10 px-4 text-center">
        <h1
          class="font-display text-4xl leading-[1.04] font-semibold tracking-tight sm:text-7xl lg:text-8xl rtl:sm:text-6xl rtl:lg:text-7xl"
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
            class="atl-glass rounded-full px-6 py-3 font-semibold transition-colors hover:bg-offwhite/10"
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

/* First light: the sky warms towards gold on the horizon while the top stays deep navy. */
.atl-hero__dawn {
  background: linear-gradient(
    180deg,
    var(--atl-deep-navy) 0%,
    #0f4a60 38%,
    #2f6f80 64%,
    #b49770 100%
  );
}

.atl-hero__stars {
  background-image:
    radial-gradient(1.5px 1.5px at 12% 18%, rgb(229 225 221 / 0.8), transparent 60%),
    radial-gradient(1px 1px at 27% 42%, rgb(229 225 221 / 0.6), transparent 60%),
    radial-gradient(1.5px 1.5px at 41% 9%, rgb(229 225 221 / 0.7), transparent 60%),
    radial-gradient(1px 1px at 58% 31%, rgb(229 225 221 / 0.6), transparent 60%),
    radial-gradient(1.5px 1.5px at 73% 14%, rgb(229 225 221 / 0.8), transparent 60%),
    radial-gradient(1px 1px at 86% 38%, rgb(229 225 221 / 0.5), transparent 60%),
    radial-gradient(1px 1px at 93% 7%, rgb(229 225 221 / 0.7), transparent 60%),
    radial-gradient(1px 1px at 5% 52%, rgb(229 225 221 / 0.5), transparent 60%),
    radial-gradient(1.5px 1.5px at 66% 55%, rgb(229 225 221 / 0.5), transparent 60%),
    radial-gradient(1px 1px at 35% 60%, rgb(229 225 221 / 0.4), transparent 60%);
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
