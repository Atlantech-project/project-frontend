<script setup>
import { useI18n } from 'vue-i18n'
import AtlTideLogo from '@/components/AtlTideLogo.vue'

defineProps({
  message: { type: String, default: '' },
})

const { t } = useI18n()
</script>

<template>
  <div
    role="status"
    aria-live="polite"
    class="grid justify-items-center gap-4 px-4 py-12 text-center"
  >
    <AtlTideLogo :size="96" />
    <p class="text-muted">{{ message || t('states.loading') }}</p>
  </div>
</template>
