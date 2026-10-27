<script setup>
import { useI18n } from 'vue-i18n'
import AtlantechLogo from '@/brand/AtlantechLogo.vue'

const { t } = useI18n()
</script>

<!-- Public landing page. The sign-in button arrives with P-16 (web login). -->
<template>
  <section class="grid min-h-[calc(100vh-48px)] content-center bg-navy px-4 py-16 text-offwhite">
    <div class="mx-auto grid max-w-2xl justify-items-center gap-6 text-center">
      <AtlantechLogo tone="reversed" :height="96" />
      <h1 class="font-display text-3xl font-semibold sm:text-4xl">{{ t('landing.title') }}</h1>
      <p class="text-lg text-teal-light">{{ t('landing.tagline') }}</p>
      <p class="max-w-xl text-offwhite/80">{{ t('landing.body') }}</p>
      <ul class="mt-4 grid w-full gap-3 sm:grid-cols-3">
        <li
          v-for="key in ['berthing', 'resources', 'live']"
          :key="key"
          class="rounded-[var(--atl-radius)] border border-offwhite/20 px-4 py-3 text-sm"
        >
          <span class="block font-display font-semibold text-gold">
            {{ t(`landing.points.${key}.title`) }}
          </span>
          <span class="text-offwhite/80">{{ t(`landing.points.${key}.body`) }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
