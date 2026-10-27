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
      <svg
        class="text-teal"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M3 7l9-4 9 4-9 4-9-4z" />
        <path d="M3 7v10l9 4 9-4V7" />
        <path d="M12 11v10" />
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
