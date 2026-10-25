<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <section class="mx-auto grid max-w-xl gap-3 px-4 py-16 text-center">
    <h1 class="text-2xl text-text">{{ t('notFound.title') }}</h1>
    <p class="text-muted">{{ t('notFound.body') }}</p>
    <RouterLink to="/" class="font-semibold text-link underline">{{
      t('notFound.back')
    }}</RouterLink>
  </section>
</template>
