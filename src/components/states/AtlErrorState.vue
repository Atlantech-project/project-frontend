<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  retryable: { type: Boolean, default: false },
})

const emit = defineEmits(['retry'])
const { t } = useI18n()
</script>

<!-- Shown when loading fails. `retryable` adds a Retry button; more actions go in the default slot. -->
<template>
  <div role="alert" class="grid justify-items-center gap-3 px-4 py-12 text-center">
    <svg
      class="text-danger"
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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5" />
      <path d="M12 16.5h.01" />
    </svg>
    <h2 class="font-display text-lg font-semibold text-text">
      {{ title || t('states.errorTitle') }}
    </h2>
    <p class="max-w-md text-muted">{{ message || t('states.errorBody') }}</p>
    <div class="mt-2 flex flex-wrap justify-center gap-2">
      <button
        v-if="retryable"
        type="button"
        class="rounded-[var(--atl-radius-sm)] bg-primary px-4 py-2 font-semibold text-on-primary"
        @click="emit('retry')"
      >
        {{ t('states.retry') }}
      </button>
      <slot />
    </div>
  </div>
</template>
