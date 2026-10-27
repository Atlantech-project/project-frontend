<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  message: { type: String, default: '' },
})

const { t } = useI18n()
</script>

<template>
  <div
    role="status"
    aria-live="polite"
    class="grid justify-items-center gap-3 px-4 py-12 text-center"
  >
    <span class="atl-spinner" aria-hidden="true" />
    <p class="text-muted">{{ message || t('states.loading') }}</p>
  </div>
</template>

<style scoped>
.atl-spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 4px solid var(--atl-border);
  border-top-color: var(--atl-primary);
  animation: atl-spin 0.9s linear infinite;
}

@keyframes atl-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .atl-spinner {
    animation-duration: 3s;
  }
}
</style>
