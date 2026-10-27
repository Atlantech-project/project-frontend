<script setup>
import { useI18n } from 'vue-i18n'
import AtlCountUp from '@/components/AtlCountUp.vue'
import AtlWave from '@/components/AtlWave.vue'
import { vReveal } from '@/composables/reveal'

const { t } = useI18n()

const numbers = [
  { key: 'steps', to: 4 },
  { key: 'modules', to: 6 },
  { key: 'languages', to: 2 },
  { key: 'approval', to: 100, suffix: '%' },
]
</script>

<template>
  <section class="relative bg-navy px-4 pt-32 pb-24 text-offwhite">
    <AtlWave animated base="var(--atl-bg)" class="absolute inset-x-0 top-0 h-14 rotate-180" />
    <div class="mx-auto max-w-6xl">
      <h2
        v-reveal
        class="mx-auto max-w-3xl text-center font-display text-4xl leading-tight font-semibold tracking-tight sm:text-5xl"
      >
        {{ t('landing.numbers.title') }}
      </h2>
      <dl class="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        <div
          v-for="(n, i) in numbers"
          :key="n.key"
          v-reveal="i * 120"
          class="border-t border-offwhite/15 pt-6 text-center"
        >
          <dt class="sr-only">{{ t(`landing.numbers.items.${n.key}`) }}</dt>
          <dd class="atl-gradient-text font-display text-5xl font-semibold sm:text-7xl">
            <AtlCountUp :to="n.to" :suffix="n.suffix" />
          </dd>
          <dd class="mt-2 text-offwhite/70" aria-hidden="true">
            {{ t(`landing.numbers.items.${n.key}`) }}
          </dd>
        </div>
      </dl>
    </div>
  </section>
</template>
