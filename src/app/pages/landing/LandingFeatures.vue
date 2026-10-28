<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AtlIcon from '@/components/AtlIcon.vue'
import AtlWave from '@/components/AtlWave.vue'
import { useScrollProgress } from '@/composables/useScrollProgress'
import CountUp from './CountUp.vue'
import { vSpotlight, vTilt } from './glass'
import { vReveal } from './reveal'

const { t, locale } = useI18n()

// Sample visuals (illustration only, not live data).
const tide = Array.from({ length: 24 }, (_, i) => ({
  height: 34 + 26 * Math.sin((i / 24) * Math.PI * 2 + 0.6),
  blocked: [6, 7, 8, 17, 18].includes(i),
}))
const options = [
  { berth: 'B-03', tugs: 2, score: 92 },
  { berth: 'B-05', tugs: 2, score: 78 },
  { berth: 'B-01', tugs: 3, score: 64 },
]
const others = [
  { key: 'requests', icon: 'window', swatch: 'bg-navy text-offwhite' },
  { key: 'resources', icon: 'anchor', swatch: 'bg-teal text-offwhite' },
  { key: 'yard', icon: 'grid', swatch: 'bg-gold text-navy' },
  { key: 'tracking', icon: 'pulse', swatch: 'bg-teal-light text-navy' },
]

// The stage stays pinned while scrolling down slides the cards sideways, one pixel of scroll
// for one pixel of travel. With less motion the cards simply wrap onto rows.
const section = ref(null)
const rail = ref(null)
const track = ref(null)
const progress = useScrollProgress(section)
const pinned = ref(false)
const overflow = ref(0)
let resize = null

function measure() {
  const wrap = rail.value
  if (!wrap || !track.value) return
  const style = getComputedStyle(wrap)
  const pad = parseFloat(style.paddingInlineStart) + parseFloat(style.paddingInlineEnd)
  overflow.value = Math.max(0, track.value.scrollWidth + pad - wrap.clientWidth)
}

onMounted(() => {
  pinned.value = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  measure()
  if (typeof ResizeObserver !== 'undefined') {
    resize = new ResizeObserver(measure)
    resize.observe(rail.value)
  }
})

onBeforeUnmount(() => resize?.disconnect())

// RTL pages read right to left, so the later cards come in from the left.
const shift = computed(() => {
  const x = progress.value * overflow.value
  return locale.value === 'ar' ? x : -x
})
</script>

<!-- The two decisions ATLANTECH helps with most get a real product fragment; the rest are cards
     that slide in sideways while the section is pinned. -->
<template>
  <section
    id="features"
    ref="section"
    class="atl-feat relative scroll-mt-16 bg-surface"
    :class="{ 'atl-feat--pinned': pinned }"
    :style="pinned ? { height: `calc(100svh + ${overflow}px)` } : null"
  >
    <div class="atl-feat__stage relative overflow-hidden">
      <AtlWave
        animated
        base="var(--atl-bg)"
        class="absolute inset-x-0 bottom-0 h-[44%] opacity-60"
      />

      <div
        class="relative mx-auto flex w-full max-w-6xl flex-wrap items-end justify-between gap-6 px-4"
      >
        <div class="max-w-2xl">
          <h2
            v-reveal
            class="font-display text-4xl leading-tight font-semibold tracking-tight text-text sm:text-5xl"
          >
            {{ t('landing.features.title') }}
          </h2>
          <p v-reveal="1" class="mt-4 text-lg text-text">{{ t('landing.features.body') }}</p>
        </div>
        <div
          v-if="pinned && overflow"
          class="h-1 w-32 overflow-hidden rounded-full bg-line"
          aria-hidden="true"
        >
          <span
            class="block h-full origin-left rounded-full bg-gold rtl:origin-right"
            :style="{ transform: `scaleX(${progress})` }"
          />
        </div>
      </div>

      <div ref="rail" class="atl-feat__rail relative mt-10">
        <div
          ref="track"
          class="atl-feat__track flex gap-6"
          :style="pinned ? { transform: `translateX(${shift}px)` } : null"
        >
          <article
            v-spotlight
            v-tilt
            v-reveal
            data-ui
            class="atl-feat__card atl-feat__card--wide rounded-[var(--atl-radius-lg)] bg-navy p-8 text-offwhite"
          >
            <h3 class="font-display text-2xl font-semibold">
              {{ t('landing.features.items.windows.title') }}
            </h3>
            <p class="mt-2 max-w-md text-offwhite/90">
              {{ t('landing.features.items.windows.body') }}
            </p>
            <div class="mt-10 flex h-28 items-end gap-1" dir="ltr" aria-hidden="true">
              <span
                v-for="(bar, i) in tide"
                :key="i"
                class="atl-grow-y flex-1 rounded-t-sm"
                :class="bar.blocked ? 'bg-danger' : 'bg-teal-light'"
                :style="{ height: `${bar.height}%`, '--atl-b': i }"
              />
            </div>
            <div class="mt-3 flex gap-5 text-sm text-offwhite/75">
              <span class="flex items-center gap-2">
                <span class="size-2.5 rounded-sm bg-teal-light" />{{ t('landing.features.safe') }}
              </span>
              <span class="flex items-center gap-2">
                <span class="size-2.5 rounded-sm bg-danger" />{{ t('landing.features.blocked') }}
              </span>
            </div>
          </article>

          <article
            v-spotlight
            v-tilt
            v-reveal="1"
            data-ui
            class="atl-feat__card atl-feat__card--wide atl-glass atl-glass--light rounded-[var(--atl-radius-lg)] bg-gold/15 p-8 text-text"
          >
            <h3 class="font-display text-2xl font-semibold">
              {{ t('landing.features.items.recommendations.title') }}
            </h3>
            <p class="mt-2 max-w-md text-text">
              {{ t('landing.features.items.recommendations.body') }}
            </p>
            <ol class="mt-8 grid gap-4" aria-hidden="true">
              <li v-for="(o, i) in options" :key="o.berth">
                <div class="flex items-baseline gap-3">
                  <span class="font-display text-lg font-semibold whitespace-nowrap">{{
                    o.berth
                  }}</span>
                  <span class="text-sm text-muted">
                    {{ t('landing.features.option', { tugs: o.tugs }) }}
                  </span>
                  <span
                    v-if="i === 0"
                    class="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-text"
                  >
                    {{ t('landing.features.best') }}
                  </span>
                  <CountUp
                    :value="o.score"
                    :delay="400 + i * 160"
                    class="ms-auto font-display font-semibold"
                  />
                </div>
                <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
                  <span
                    class="atl-grow-x block h-full rounded-full"
                    :class="i === 0 ? 'bg-teal' : 'bg-gold'"
                    :style="{ width: `${o.score}%`, '--atl-b': i }"
                  />
                </div>
              </li>
            </ol>
          </article>

          <article
            v-for="(f, i) in others"
            :key="f.key"
            v-spotlight
            v-tilt
            v-reveal="2 + i"
            class="atl-feat__card atl-glass atl-glass--light flex flex-col rounded-[var(--atl-radius-lg)] p-8"
          >
            <span
              class="grid size-12 place-items-center rounded-full"
              :class="f.swatch"
              aria-hidden="true"
            >
              <AtlIcon :name="f.icon" :size="22" />
            </span>
            <h3 class="mt-auto pt-10 font-display text-xl font-semibold text-text">
              {{ t(`landing.features.items.${f.key}.title`) }}
            </h3>
            <p class="mt-2 text-text">{{ t(`landing.features.items.${f.key}.body`) }}</p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.atl-feat__stage {
  padding-block: 6rem 8rem;
}

/* The rail lines its first card up with the content column, then runs off the edge. */
.atl-feat__rail {
  padding-inline: max(1rem, calc((100vw - 72rem) / 2 + 1rem));
}

.atl-feat__card {
  flex: none;
  width: min(20rem, 78vw);
}

.atl-feat__card--wide {
  width: min(34rem, 86vw);
}

.atl-feat--pinned .atl-feat__stage {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100svh;
  padding-block: 4.5rem 2rem;
}

.atl-feat--pinned .atl-feat__track {
  width: max-content;
  will-change: transform;
}

/* Less motion: no pinning, the cards wrap. */
.atl-feat:not(.atl-feat--pinned) .atl-feat__track {
  flex-wrap: wrap;
}
</style>
