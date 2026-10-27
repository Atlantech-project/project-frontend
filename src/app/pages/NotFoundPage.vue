<script setup>
import { useI18n } from 'vue-i18n'
import AtlEmptyState from '@/components/states/AtlEmptyState.vue'

const { t } = useI18n()
</script>

<template>
  <section class="mx-auto max-w-xl px-4 py-16">
    <AtlEmptyState :title="t('notFound.title')" :message="t('notFound.body')">
      <template #icon>
        <span class="font-display text-6xl font-semibold text-teal" aria-hidden="true">404</span>
      </template>
      <RouterLink
        to="/"
        class="rounded-[var(--atl-radius-sm)] bg-primary px-4 py-2 font-semibold text-on-primary"
      >
        {{ t('notFound.back') }}
      </RouterLink>
    </AtlEmptyState>
  </section>
</template>
