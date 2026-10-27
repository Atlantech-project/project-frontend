<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// The three root causes from the project context, each keyed to a brand colour.
const causes = [
  { key: 'isolated', swatch: 'bg-navy', span: 'max-w-xl lg:col-span-5' },
  { key: 'future', swatch: 'bg-teal', span: 'max-w-xl lg:col-span-7 lg:pt-12' },
  { key: 'sea', swatch: 'bg-gold', span: 'max-w-3xl lg:col-span-12 lg:pt-4' },
]
</script>

<template>
  <section id="why" class="scroll-mt-16 bg-surface px-4 py-24 sm:py-28">
    <div class="mx-auto max-w-6xl">
      <div class="max-w-3xl">
        <h2
          class="font-display text-3xl leading-tight font-semibold tracking-tight text-text sm:text-5xl"
        >
          {{ t('landing.problem.title') }}
        </h2>
        <p class="mt-4 text-lg text-text">{{ t('landing.problem.body') }}</p>
      </div>
      <ul class="mt-16 grid gap-10 lg:grid-cols-12">
        <li v-for="c in causes" :key="c.key" :class="c.span">
          <span class="block size-3 rounded-sm" :class="c.swatch" aria-hidden="true" />
          <h3 class="mt-4 font-display text-2xl font-semibold text-text">
            {{ t(`landing.problem.items.${c.key}.title`) }}
          </h3>
          <p class="mt-3 text-lg leading-relaxed text-text">
            {{ t(`landing.problem.items.${c.key}.body`) }}
          </p>
        </li>
      </ul>
      <p
        class="mt-16 rounded-[var(--atl-radius-lg)] bg-navy px-8 py-7 font-display text-xl font-semibold text-offwhite sm:text-2xl"
      >
        {{ t('landing.problem.result') }}
      </p>
    </div>
  </section>
</template>
