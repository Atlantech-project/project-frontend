<script setup>
import { useI18n } from 'vue-i18n'
import AtlIcon from '@/components/AtlIcon.vue'

const { t } = useI18n()

// The three root causes from the project context, each tied to a brand colour.
const causes = [
  { key: 'isolated', icon: 'grid', accent: 'border-navy', tile: 'bg-navy text-offwhite' },
  { key: 'future', icon: 'ship', accent: 'border-teal', tile: 'bg-teal text-offwhite' },
  { key: 'sea', icon: 'pulse', accent: 'border-gold', tile: 'bg-gold text-navy' },
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
        <p class="mt-4 text-lg text-muted">{{ t('landing.problem.body') }}</p>
      </div>
      <ul class="mt-14 grid gap-6 md:grid-cols-3">
        <li
          v-for="c in causes"
          :key="c.key"
          class="rounded-[var(--atl-radius-lg)] border-t-4 bg-bg p-7"
          :class="c.accent"
        >
          <span class="grid size-11 place-items-center rounded-[var(--atl-radius)]" :class="c.tile">
            <AtlIcon :name="c.icon" :size="22" />
          </span>
          <h3 class="mt-5 font-display text-xl font-semibold text-text">
            {{ t(`landing.problem.items.${c.key}.title`) }}
          </h3>
          <p class="mt-2 leading-relaxed text-muted">
            {{ t(`landing.problem.items.${c.key}.body`) }}
          </p>
        </li>
      </ul>
      <p class="mt-10 max-w-3xl font-display text-xl font-semibold text-text sm:text-2xl">
        {{ t('landing.problem.result') }}
      </p>
    </div>
  </section>
</template>
