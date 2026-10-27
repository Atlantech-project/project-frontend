<script setup>
import { useI18n } from 'vue-i18n'
import AtlErrorState from '@/components/states/AtlErrorState.vue'

const { t } = useI18n()

function reload() {
  window.location.assign(import.meta.env.BASE_URL)
}
</script>

<!-- Full-page error, shown when the app itself fails (for example a page that won't load). -->
<template>
  <section class="mx-auto max-w-xl px-4 py-16">
    <AtlErrorState :title="t('error.title')" :message="t('error.body')" retryable @retry="reload">
      <RouterLink
        to="/"
        class="rounded-[var(--atl-radius-sm)] border border-line-strong px-4 py-2 font-semibold text-link"
      >
        {{ t('error.back') }}
      </RouterLink>
    </AtlErrorState>
  </section>
</template>
