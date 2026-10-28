<script setup>
import { useI18n } from 'vue-i18n'
import AtlIcon from '@/components/AtlIcon.vue'
import AtlWave from '@/components/AtlWave.vue'

const { t } = useI18n()

function reload() {
  window.location.assign(import.meta.env.BASE_URL)
}
</script>

<!-- Full-page error ("rough waters"), shown when the app itself fails, for example a page that won't load. -->
<template>
  <section
    role="alert"
    class="relative grid min-h-[calc(100vh-48px)] place-items-center overflow-hidden bg-navy px-4 pb-24 text-offwhite"
  >
    <div class="grid max-w-xl justify-items-center gap-5 text-center">
      <svg class="size-32" viewBox="0 0 120 120" aria-hidden="true">
        <g class="atl-beam">
          <path d="M60 30 L118 14 L118 46 Z" fill="var(--atl-muted-gold)" opacity="0.35" />
          <path d="M60 30 L2 14 L2 46 Z" fill="var(--atl-muted-gold)" opacity="0.35" />
        </g>
        <path d="M50 104 L54 40 H66 L70 104 Z" fill="var(--atl-off-white)" />
        <path d="M52 70 H68 M51 86 H69" stroke="var(--atl-danger)" stroke-width="6" />
        <rect x="52" y="24" width="16" height="16" rx="3" fill="var(--atl-muted-gold)" />
        <path d="M48 24 L60 14 L72 24 Z" fill="var(--atl-off-white)" />
        <path
          d="M40 104 H80"
          stroke="var(--atl-off-white)"
          stroke-width="4"
          stroke-linecap="round"
        />
      </svg>
      <h1 class="font-display text-3xl font-semibold">{{ t('error.title') }}</h1>
      <p class="text-offwhite/80">{{ t('error.body') }}</p>
      <div class="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-[var(--atl-radius-sm)] bg-gold px-5 py-3 font-semibold text-navy transition hover:brightness-110"
          @click="reload"
        >
          <AtlIcon name="refresh" :size="18" />
          {{ t('states.retry') }}
        </button>
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 rounded-[var(--atl-radius-sm)] border border-offwhite/30 px-5 py-3 font-semibold transition hover:bg-offwhite/10"
        >
          <AtlIcon name="home" :size="18" />
          {{ t('error.back') }}
        </RouterLink>
      </div>
    </div>
    <AtlWave animated class="absolute inset-x-0 bottom-0 h-16" />
  </section>
</template>

<style scoped>
.atl-beam {
  transform-origin: 60px 30px;
  animation: atl-sweep 3s ease-in-out infinite;
}

@keyframes atl-sweep {
  0%,
  100% {
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .atl-beam {
    animation: none;
  }
}
</style>
