<script setup>
import { useI18n } from 'vue-i18n'
import AtlantechLogo from '@/brand/AtlantechLogo.vue'
import { setLocale } from '@/i18n'

const { t, locale } = useI18n()

function toggleLocale() {
  setLocale(locale.value === 'en' ? 'ar' : 'en')
}
</script>

<template>
  <div class="min-h-screen bg-bg text-text">
    <header class="flex items-center gap-3 bg-navy px-4 py-2 text-offwhite">
      <AtlantechLogo shape="wordmark" tone="reversed" :height="28" />
      <button
        type="button"
        class="ms-auto rounded-[var(--atl-radius-sm)] border border-offwhite/40 px-3 py-1 text-sm"
        @click="toggleLocale"
      >
        {{ t('language.switch') }}
      </button>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>
