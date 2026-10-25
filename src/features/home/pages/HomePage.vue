<script setup>
import { useI18n } from 'vue-i18n'
import AtlantechLogo from '@/brand/AtlantechLogo.vue'

const { t } = useI18n()
</script>

<template>
  <section class="mx-auto grid max-w-xl justify-items-center gap-4 px-4 py-16 text-center">
    <AtlantechLogo :height="120" />
    <h1 class="text-2xl text-text">{{ t('home.title') }}</h1>
    <p class="text-muted">{{ t('home.body') }}</p>
  </section>
</template>
