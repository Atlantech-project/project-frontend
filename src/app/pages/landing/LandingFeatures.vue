<script setup>
import { useI18n } from 'vue-i18n'
import { vReveal } from './reveal'

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
const others = [
  { key: 'requests', swatch: 'bg-navy' },
  { key: 'resources', swatch: 'bg-teal' },
  { key: 'yard', swatch: 'bg-gold' },
  { key: 'tracking', swatch: 'bg-teal-light' },
]
</script>

<!-- The two decisions ATLANTECH helps with most get a real product fragment; the rest are a plain list. -->
<template>
  <section id="features" class="scroll-mt-16 bg-surface px-4 py-24 sm:py-32">
    <div class="mx-auto max-w-6xl">
      <div class="max-w-2xl">
        <h2
          v-reveal:line
          class="font-display text-4xl leading-tight font-semibold tracking-tight text-text sm:text-5xl"
        >
          {{ t('landing.features.title') }}
        </h2>
        <p v-reveal="1" class="mt-4 text-lg text-text">{{ t('landing.features.body') }}</p>
      </div>

      <div class="mt-14 grid gap-6 lg:grid-cols-2">
        <article v-reveal data-ui class="rounded-[var(--atl-radius-lg)] bg-navy p-8 text-offwhite">
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
          v-reveal="1"
          data-ui
          class="rounded-[var(--atl-radius-lg)] bg-gold/15 p-8 text-text"
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
                <span class="ms-auto font-display font-semibold tabular-nums">{{ o.score }}</span>
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
      </div>

      <ul class="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2">
        <li v-for="(f, i) in others" :key="f.key" v-reveal="i % 2" class="max-w-sm">
          <span class="block size-3 rounded-sm" :class="f.swatch" aria-hidden="true" />
          <h3 class="mt-4 font-display text-xl font-semibold text-text">
            {{ t(`landing.features.items.${f.key}.title`) }}
          </h3>
          <p class="mt-2 text-text">{{ t(`landing.features.items.${f.key}.body`) }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>
