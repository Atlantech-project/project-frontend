<script setup>
import { useI18n } from 'vue-i18n'
import AtlIcon from '@/components/AtlIcon.vue'
import { vReveal } from '@/composables/reveal'

const { t } = useI18n()

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
const yard = Array.from({ length: 28 }, (_, i) => [0, 0.35, 0.7, 1][(i * 7 + (i % 5)) % 4])

// Cards light up under the pointer.
function spotlight(event) {
  const card = event.currentTarget
  const rect = card.getBoundingClientRect()
  card.style.setProperty('--atl-mx', `${event.clientX - rect.left}px`)
  card.style.setProperty('--atl-my', `${event.clientY - rect.top}px`)
}
</script>

<template>
  <section id="features" class="scroll-mt-4 bg-bg px-4 py-24 sm:py-32">
    <div class="mx-auto max-w-6xl">
      <div v-reveal class="mx-auto max-w-3xl text-center">
        <p
          class="text-sm font-semibold tracking-[0.25em] rtl:tracking-normal text-accent-text uppercase"
        >
          {{ t('landing.features.eyebrow') }}
        </p>
        <h2
          class="mt-3 font-display text-4xl leading-tight font-semibold tracking-tight text-text sm:text-6xl"
        >
          {{ t('landing.features.title') }}
        </h2>
        <p class="mt-4 text-lg text-muted">{{ t('landing.features.body') }}</p>
      </div>

      <div class="mt-14 grid gap-5 lg:grid-cols-3">
        <!-- Safe entry windows -->
        <article
          v-reveal
          class="atl-card atl-card--dark bg-navy text-offwhite lg:col-span-2"
          @pointermove="spotlight"
        >
          <AtlIcon name="window" :size="28" class="text-teal-light" />
          <h3 class="mt-4 font-display text-2xl font-semibold">
            {{ t('landing.features.items.windows.title') }}
          </h3>
          <p class="mt-2 max-w-md text-offwhite/70">
            {{ t('landing.features.items.windows.body') }}
          </p>
          <div class="mt-8 flex h-24 items-end gap-1" dir="ltr" aria-hidden="true">
            <span
              v-for="(bar, i) in tide"
              :key="i"
              class="atl-bar flex-1 rounded-t-sm"
              :class="bar.blocked ? 'bg-danger' : 'bg-teal-light'"
              :style="{ height: `${bar.height}%`, '--atl-i': i }"
            />
          </div>
          <div class="mt-3 flex gap-4 text-xs text-offwhite/70">
            <span class="flex items-center gap-1.5">
              <span class="size-2.5 rounded-sm bg-teal-light" />{{ t('landing.features.safe') }}
            </span>
            <span class="flex items-center gap-1.5">
              <span class="size-2.5 rounded-sm bg-danger" />{{ t('landing.features.blocked') }}
            </span>
          </div>
        </article>

        <!-- Smart recommendations -->
        <article
          v-reveal="120"
          class="atl-card border border-line bg-surface text-text lg:row-span-2"
          @pointermove="spotlight"
        >
          <AtlIcon name="spark" :size="28" class="text-accent-text" />
          <h3 class="mt-4 font-display text-2xl font-semibold">
            {{ t('landing.features.items.recommendations.title') }}
          </h3>
          <p class="mt-2 text-muted">{{ t('landing.features.items.recommendations.body') }}</p>
          <ul class="mt-8 grid gap-3" aria-hidden="true">
            <li
              v-for="(o, i) in options"
              :key="o.berth"
              class="rounded-[var(--atl-radius)] border border-line p-4"
              :class="{ 'border-teal bg-primary-soft/40': i === 0 }"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="font-display font-semibold">{{ o.berth }}</span>
                <span
                  v-if="i === 0"
                  class="rounded-full bg-teal px-2 py-0.5 text-[11px] font-semibold text-offwhite"
                >
                  {{ t('landing.features.best') }}
                </span>
                <span class="ms-auto font-display font-semibold tabular-nums">{{ o.score }}</span>
              </div>
              <p class="mt-0.5 text-xs text-muted">
                {{ t('landing.features.option', { tugs: o.tugs }) }}
              </p>
              <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-3">
                <span
                  class="atl-score block h-full rounded-full bg-teal"
                  :style="{ width: `${o.score}%`, '--atl-i': i }"
                />
              </div>
            </li>
          </ul>
        </article>

        <!-- Requests and resources -->
        <article
          v-for="(key, i) in ['requests', 'resources']"
          :key="key"
          v-reveal="i * 120"
          class="atl-card border border-line bg-surface text-text"
          @pointermove="spotlight"
        >
          <span
            class="grid size-12 place-items-center rounded-[var(--atl-radius)] bg-primary-soft text-teal"
          >
            <AtlIcon :name="key === 'requests' ? 'ship' : 'anchor'" />
          </span>
          <h3 class="mt-5 font-display text-xl font-semibold">
            {{ t(`landing.features.items.${key}.title`) }}
          </h3>
          <p class="mt-2 text-muted">{{ t(`landing.features.items.${key}.body`) }}</p>
        </article>

        <!-- Container yard -->
        <article
          v-reveal
          class="atl-card border border-line bg-surface text-text"
          @pointermove="spotlight"
        >
          <AtlIcon name="grid" :size="28" class="text-teal" />
          <h3 class="mt-4 font-display text-xl font-semibold">
            {{ t('landing.features.items.yard.title') }}
          </h3>
          <p class="mt-2 text-muted">{{ t('landing.features.items.yard.body') }}</p>
          <div class="mt-6 grid grid-cols-7 gap-1.5" aria-hidden="true">
            <span
              v-for="(fill, i) in yard"
              :key="i"
              class="atl-box aspect-square rounded-[3px] bg-teal"
              :style="{ '--atl-fill': 0.15 + fill * 0.85, '--atl-i': i }"
            />
          </div>
        </article>

        <!-- Live tracking -->
        <article
          v-reveal="120"
          class="atl-card atl-card--dark bg-gradient-to-br from-teal to-navy text-offwhite lg:col-span-2"
          @pointermove="spotlight"
        >
          <AtlIcon name="pulse" :size="28" class="text-offwhite" />
          <h3 class="mt-4 font-display text-2xl font-semibold">
            {{ t('landing.features.items.tracking.title') }}
          </h3>
          <p class="mt-2 max-w-md text-offwhite/75">
            {{ t('landing.features.items.tracking.body') }}
          </p>
          <svg class="mt-6 h-20 w-full" viewBox="0 0 600 80" preserveAspectRatio="none">
            <path
              class="atl-pulse"
              pathLength="100"
              d="M0 50 H140 L160 50 L175 18 L195 70 L212 40 L230 50 H380 L398 50 L412 24 L430 66 L446 46 L460 50 H600"
              fill="none"
              stroke="var(--atl-off-white)"
              stroke-width="2.5"
              stroke-linejoin="round"
              stroke-linecap="round"
            />
          </svg>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.atl-card {
  position: relative;
  overflow: hidden;
  padding: 2rem;
  border-radius: var(--atl-radius-lg);
  transition:
    transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1),
    box-shadow 0.5s;
}

.atl-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    420px circle at var(--atl-mx, -500px) var(--atl-my, -500px),
    rgb(64 126 140 / 0.12),
    transparent 60%
  );
  pointer-events: none;
}

.atl-card--dark::after {
  background: radial-gradient(
    420px circle at var(--atl-mx, -500px) var(--atl-my, -500px),
    rgb(229 225 221 / 0.1),
    transparent 60%
  );
}

.atl-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 60px -24px rgb(8 58 79 / 0.35);
}

/* The visuals build up once their card has revealed (v-reveal adds .is-visible). */
.atl-bar {
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 0.8s cubic-bezier(0.2, 0.7, 0.2, 1);
  transition-delay: calc(var(--atl-i) * 35ms + 200ms);
}

.atl-score {
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 1.2s cubic-bezier(0.2, 0.7, 0.2, 1);
  transition-delay: calc(var(--atl-i) * 150ms + 300ms);
}

:dir(rtl) .atl-score {
  transform-origin: right;
}

.atl-box {
  opacity: 0;
  transition: opacity 0.6s;
  transition-delay: calc(var(--atl-i) * 30ms + 200ms);
}

.atl-pulse {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
}

.is-visible .atl-bar,
.is-visible .atl-score {
  transform: none;
}

.is-visible .atl-box {
  opacity: var(--atl-fill);
}

.is-visible .atl-pulse {
  animation: atl-trace 3.2s ease-in-out infinite;
}

@keyframes atl-trace {
  60%,
  100% {
    stroke-dashoffset: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .atl-card,
  .atl-bar,
  .atl-score,
  .atl-box {
    transition: none;
  }
  .atl-bar,
  .atl-score {
    transform: none;
  }
  .atl-box {
    opacity: var(--atl-fill);
  }
  .atl-pulse {
    stroke-dashoffset: 0;
    animation: none !important;
  }
}
</style>
