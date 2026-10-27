<script setup>
import { useI18n } from 'vue-i18n'
import AtlantechLogo from '@/brand/AtlantechLogo.vue'

const { t } = useI18n()

const executors = [
  { key: 'tos', example: 'tosExample' },
  { key: 'pms', example: 'pmsExample' },
  { key: 'field', example: 'fieldExample' },
]
</script>

<!-- ATLANTECH is an advisory layer above the port's execution systems (Master Context, section 2). -->
<template>
  <section class="bg-bg px-4 py-24 sm:py-28">
    <div class="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
      <div>
        <h2
          class="font-display text-3xl leading-tight font-semibold tracking-tight text-text sm:text-5xl"
        >
          {{ t('landing.systems.title') }}
        </h2>
        <p class="mt-4 text-lg text-muted">{{ t('landing.systems.body') }}</p>
        <blockquote
          class="mt-8 border-s-4 border-gold ps-5 font-display text-xl leading-snug font-semibold text-text sm:text-2xl"
        >
          {{ t('landing.systems.principle') }}
        </blockquote>
      </div>

      <div aria-hidden="true">
        <div
          class="flex items-center gap-4 rounded-[var(--atl-radius-lg)] bg-navy p-5 text-offwhite shadow-lg"
        >
          <AtlantechLogo shape="symbol" tone="reversed" :height="44" />
          <div>
            <p class="font-display text-lg font-semibold">ATLANTECH</p>
            <p class="text-sm text-offwhite/70">{{ t('landing.systems.layer') }}</p>
          </div>
        </div>
        <div class="grid justify-items-center py-3">
          <span class="h-6 w-0.5 bg-line-strong" />
          <span class="rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-accent-text">
            {{ t('landing.systems.approved') }}
          </span>
          <span class="h-6 w-0.5 bg-line-strong" />
        </div>
        <div class="grid gap-3 sm:grid-cols-3">
          <div
            v-for="e in executors"
            :key="e.key"
            class="rounded-[var(--atl-radius)] border border-line bg-surface p-4"
          >
            <p class="font-semibold text-text">{{ t(`landing.systems.${e.key}`) }}</p>
            <p class="mt-1 text-sm text-muted">{{ t(`landing.systems.${e.example}`) }}</p>
            <span
              class="mt-3 inline-block rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-text"
            >
              {{ t('landing.systems.execute') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
