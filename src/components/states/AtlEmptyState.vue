<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  title: { type: String, default: '' },
  message: { type: String, default: '' },
})

const { t } = useI18n()
</script>

<!-- Shown when a list or page has nothing to show. Actions go in the default slot. -->
<template>
  <div class="grid justify-items-center gap-3 px-4 py-12 text-center">
    <slot name="icon">
      <!-- An empty berth on calm water -->
      <svg width="132" height="80" viewBox="0 0 132 80" fill="none" aria-hidden="true">
        <rect x="4" y="58" width="124" height="18" rx="3" fill="var(--atl-light-teal)" />
        <rect
          x="38"
          y="30"
          width="56"
          height="22"
          rx="4"
          stroke="var(--atl-mid-teal)"
          stroke-width="2"
          stroke-dasharray="5 5"
        />
        <circle cx="30" cy="54" r="3" fill="var(--atl-muted-gold)" />
        <circle cx="102" cy="54" r="3" fill="var(--atl-muted-gold)" />
        <path
          d="M4 18 q8 -5 16 0 t16 0 M96 12 q8 -5 16 0 t16 0"
          stroke="var(--atl-mid-teal)"
          stroke-width="2"
          stroke-linecap="round"
          opacity="0.5"
        />
      </svg>
    </slot>
    <h2 class="font-display text-lg font-semibold text-text">
      {{ title || t('states.emptyTitle') }}
    </h2>
    <p class="max-w-md text-muted">{{ message || t('states.emptyBody') }}</p>
    <div v-if="$slots.default" class="mt-2 flex flex-wrap justify-center gap-2">
      <slot />
    </div>
  </div>
</template>
