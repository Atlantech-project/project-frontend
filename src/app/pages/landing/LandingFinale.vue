<script setup>
import { useI18n } from 'vue-i18n'
import AtlantechLogo from '@/brand/AtlantechLogo.vue'
import AtlIcon from '@/components/AtlIcon.vue'
import AtlWave from '@/components/AtlWave.vue'
import { setLocale } from '@/i18n'

const { t, locale } = useI18n()

const links = ['why', 'how', 'features', 'security', 'roles', 'faq']

function toggleLocale() {
  setLocale(locale.value === 'en' ? 'ar' : 'en')
}
</script>

<template>
  <section class="relative bg-teal px-4 pt-36 pb-28 text-center text-offwhite">
    <AtlWave animated base="var(--atl-bg)" class="absolute inset-x-0 top-0 h-14 rotate-180" />
    <div class="mx-auto grid max-w-4xl justify-items-center gap-8">
      <AtlantechLogo shape="symbol" tone="reversed" :height="88" />
      <h2
        class="font-display text-3xl leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-7xl"
      >
        <span class="block">{{ t('landing.finale.line1') }}</span>
        <span class="block">{{ t('landing.finale.line2') }}</span>
      </h2>
      <a
        href="#top"
        class="rounded-full bg-offwhite px-6 py-3 font-semibold text-navy transition-colors hover:bg-white"
      >
        {{ t('landing.finale.top') }}
      </a>
    </div>
  </section>
  <footer class="bg-navy text-offwhite">
    <div class="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-[1.6fr_1fr_1fr]">
      <div>
        <AtlantechLogo shape="wordmark" tone="reversed" :height="34" />
        <p class="mt-5 max-w-sm leading-relaxed text-offwhite/70">
          {{ t('landing.footer.about') }}
        </p>
      </div>
      <nav :aria-label="t('landing.footer.nav')">
        <h3 class="font-display font-semibold">{{ t('landing.footer.product') }}</h3>
        <ul class="mt-4 grid gap-3">
          <li v-for="link in links" :key="link">
            <a
              :href="`#${link}`"
              class="text-offwhite/70 transition-colors hover:text-offwhite hover:underline"
            >
              {{ t(`landing.nav.${link}`) }}
            </a>
          </li>
        </ul>
      </nav>
      <div>
        <h3 class="font-display font-semibold">{{ t('landing.footer.language') }}</h3>
        <ul class="mt-4 grid gap-3 text-offwhite/70">
          <li>
            <button
              type="button"
              class="flex items-center gap-2 transition-colors hover:text-offwhite hover:underline"
              @click="toggleLocale"
            >
              <AtlIcon name="globe" :size="16" />
              {{ t('language.switch') }}
            </button>
          </li>
        </ul>
      </div>
    </div>
    <div class="bg-black/15">
      <div
        class="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-offwhite/60 sm:flex-row sm:justify-between"
      >
        <p>{{ t('landing.footer.rights') }}</p>
      </div>
    </div>
  </footer>
</template>
