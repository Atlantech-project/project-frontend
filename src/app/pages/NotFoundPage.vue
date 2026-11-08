<script setup>
import { useI18n } from 'vue-i18n'
import AtlIcon from '@/components/AtlIcon.vue'
import AtlWave from '@/components/AtlWave.vue'

const { t } = useI18n()
</script>

<!-- "Off course": a compass replaces the 0 in 404. -->
<template>
  <section
    class="relative grid min-h-[calc(100vh-48px)] place-items-center overflow-hidden bg-page px-4 pb-24"
  >
    <div class="grid max-w-xl justify-items-center gap-5 text-center">
      <div
        class="flex items-center gap-2 font-display text-8xl font-semibold text-brand sm:text-9xl"
        aria-hidden="true"
      >
        <span>4</span>
        <svg class="atl-compass size-20 sm:size-24" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="var(--color-teal-500)"
            stroke-width="6"
          />
          <circle
            cx="50"
            cy="50"
            r="34"
            fill="none"
            stroke="var(--color-teal-200)"
            stroke-width="2"
          />
          <g class="atl-compass__needle">
            <path d="M50 18 L58 50 L50 50 Z" fill="var(--color-gold-500)" />
            <path d="M50 18 L42 50 L50 50 Z" fill="var(--color-gold-500)" opacity="0.75" />
            <path d="M50 82 L58 50 L50 50 Z" fill="var(--color-navy-800)" opacity="0.75" />
            <path d="M50 82 L42 50 L50 50 Z" fill="var(--color-navy-800)" />
          </g>
          <circle cx="50" cy="50" r="5" fill="var(--color-navy-800)" />
        </svg>
        <span>4</span>
      </div>
      <h1 class="type-h1 text-fg">{{ t('notFound.title') }}</h1>
      <p class="text-fg-secondary">{{ t('notFound.body') }}</p>
      <RouterLink
        to="/"
        class="inline-flex items-center gap-2 rounded-control bg-brand px-5 py-3 font-semibold text-fg-inverse transition-colors hover:bg-brand-hover focus-visible:shadow-focus focus-visible:outline-none"
      >
        <AtlIcon name="home" :size="18" />
        {{ t('notFound.back') }}
      </RouterLink>
    </div>
    <AtlWave animated class="absolute inset-x-0 bottom-0 h-16" />
  </section>
</template>

<style scoped>
.atl-compass__needle {
  transform-origin: 50px 50px;
  animation: atl-search 4s ease-in-out infinite;
}

@keyframes atl-search {
  0%,
  100% {
    transform: rotate(-35deg);
  }
  30% {
    transform: rotate(50deg);
  }
  60% {
    transform: rotate(-10deg);
  }
  80% {
    transform: rotate(25deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .atl-compass__needle {
    animation: none;
  }
}
</style>
