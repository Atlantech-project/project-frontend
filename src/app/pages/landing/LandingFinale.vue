<script setup>
import { useI18n } from 'vue-i18n'
import AtlantechLogo from '@/brand/AtlantechLogo.vue'
import AtlWave from '@/components/AtlWave.vue'

const { t } = useI18n()
</script>

<template>
  <section class="relative bg-teal px-4 pt-36 pb-28 text-center text-offwhite">
    <AtlWave animated base="var(--atl-bg)" class="absolute inset-x-0 top-0 h-14 rotate-180" />
    <div class="mx-auto grid max-w-4xl justify-items-center gap-8">
      <AtlantechLogo shape="symbol" tone="reversed" :height="88" />
      <h2 class="font-display text-5xl leading-[1.05] font-semibold tracking-tight sm:text-7xl">
        <span class="block">{{ t('landing.finale.line1') }}</span>
        <span class="block">{{ t('landing.finale.line2') }}</span>
      </h2>
      <a
        href="#top"
        class="rounded-full bg-offwhite px-6 py-3 font-semibold text-navy transition-colors hover:bg-white"
      >
        {{ t('landing.finale.top') }}
      </a>
    </div>
  </section>
  <footer class="border-t border-offwhite/10 bg-navy px-4 py-8 text-offwhite">
    <div
      class="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-start"
    >
      <AtlantechLogo shape="wordmark" tone="reversed" :height="28" />
      <p class="text-sm text-offwhite/70">{{ t('landing.footer') }}</p>
    </div>
  </footer>
</template>
