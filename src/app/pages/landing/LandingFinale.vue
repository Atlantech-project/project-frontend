<script setup>
import { useI18n } from 'vue-i18n'
import AtlantechLogo from '@/brand/AtlantechLogo.vue'
import AtlIcon from '@/components/AtlIcon.vue'
import AtlWave from '@/components/AtlWave.vue'
import { vReveal } from '@/composables/reveal'

const { t } = useI18n()
</script>

<template>
  <section class="relative overflow-hidden bg-navy px-4 pt-36 pb-28 text-center text-offwhite">
    <AtlWave animated class="absolute inset-x-0 top-0 h-14 rotate-180" base="var(--atl-bg)" />
    <div class="atl-finale-glow" aria-hidden="true" />
    <div class="relative mx-auto grid max-w-4xl justify-items-center gap-8">
      <div v-reveal class="atl-finale-logo">
        <AtlantechLogo shape="symbol" tone="reversed" :height="88" />
      </div>
      <h2
        v-reveal="150"
        class="font-display text-5xl leading-[1.05] font-semibold tracking-tight sm:text-7xl"
      >
        <span class="block">{{ t('landing.finale.line1') }}</span>
        <span class="atl-gradient-text block pb-2">{{ t('landing.finale.line2') }}</span>
      </h2>
      <a
        v-reveal="300"
        href="#top"
        class="inline-flex items-center gap-2 rounded-full border border-offwhite/30 px-6 py-3 font-semibold transition hover:bg-offwhite/10"
      >
        <AtlIcon name="arrow" :size="18" class="rotate-180" />
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

<style scoped>
.atl-finale-glow {
  position: absolute;
  inset: 30% 20% auto;
  height: 60%;
  background: radial-gradient(ellipse, rgb(64 126 140 / 0.45), transparent 65%);
  filter: blur(40px);
  pointer-events: none;
}

.atl-finale-logo {
  animation: atl-float 5s ease-in-out infinite;
}

@keyframes atl-float {
  50% {
    translate: 0 -10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .atl-finale-logo {
    animation: none;
  }
}
</style>
