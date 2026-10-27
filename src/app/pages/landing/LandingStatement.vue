<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AtlWave from '@/components/AtlWave.vue'
import { range, useScrollProgress } from '@/composables/useScrollProgress'

const { t } = useI18n()
const section = ref(null)
const progress = useScrollProgress(section)

const words = computed(() => t('landing.statement').split(' '))

// Each word lights up in turn as the reader scrolls past.
function opacity(i) {
  const start = 0.05 + (i / words.value.length) * 0.75
  return 0.16 + 0.84 * range(progress.value, start, start + 0.12)
}
</script>

<template>
  <section ref="section" class="atl-statement relative h-[240svh] bg-navy text-offwhite">
    <div class="sticky top-0 grid h-svh place-items-center px-4">
      <p
        class="max-w-5xl font-display text-3xl leading-tight font-semibold tracking-tight sm:text-5xl lg:text-6xl"
      >
        <span v-for="(word, i) in words" :key="i" :style="{ opacity: opacity(i) }">
          {{ word }}{{ ' ' }}
        </span>
      </p>
    </div>
    <AtlWave animated base="var(--atl-bg)" class="absolute inset-x-0 bottom-0 h-16" />
  </section>
</template>

<style scoped>
.atl-statement span {
  transition: opacity 0.2s linear;
}

@media (prefers-reduced-motion: reduce) {
  .atl-statement {
    height: auto;
    padding: 6rem 0 8rem;
  }
  .atl-statement > div {
    position: relative;
    height: auto;
  }
  .atl-statement span {
    opacity: 1 !important;
  }
}
</style>
