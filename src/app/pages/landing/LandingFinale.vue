<script setup>
import { useI18n } from 'vue-i18n'
import AtlantechLogo from '@/brand/AtlantechLogo.vue'
import AtlIcon from '@/components/AtlIcon.vue'
import AtlWave from '@/components/AtlWave.vue'
import { setLocale } from '@/i18n'
import { contact, phoneHref } from './contact'
import LandingSocials from './LandingSocials.vue'
import { vReveal } from './reveal'

const { t, locale } = useI18n()

const links = ['how', 'features', 'security', 'roles', 'faq', 'contact']

function toggleLocale() {
  setLocale(locale.value === 'en' ? 'ar' : 'en')
}
</script>

<template>
  <section class="relative bg-teal px-4 pt-36 pb-40 text-center text-offwhite">
    <AtlWave animated base="var(--atl-bg)" class="absolute inset-x-0 top-0 h-14 rotate-180" />
    <div class="mx-auto grid max-w-4xl justify-items-center gap-10">
      <h2
        class="font-display text-3xl leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-7xl"
      >
        <span v-reveal class="block">{{ t('landing.finale.line1') }}</span>
        <span v-reveal="2" class="block">{{ t('landing.finale.line2') }}</span>
      </h2>
      <a
        v-reveal="4"
        href="#top"
        class="atl-glass inline-flex items-center gap-2 rounded-full bg-offwhite/85 px-6 py-3 font-semibold text-navy transition-colors hover:bg-offwhite"
      >
        <AtlIcon name="arrow-up" :size="18" />
        {{ t('landing.finale.top') }}
      </a>
    </div>
    <AtlWave animated class="absolute inset-x-0 bottom-0 h-16" />
  </section>

  <!-- The full lockup sits large here so its tagline stays readable. -->
  <footer class="bg-navy text-offwhite">
    <div class="mx-auto grid max-w-6xl gap-14 px-4 pt-16 pb-14 lg:grid-cols-[1.25fr_1fr] lg:pt-20">
      <div v-reveal>
        <AtlantechLogo shape="lockup" tone="reversed" :height="168" class="-ms-2" />
        <p class="mt-6 max-w-sm leading-relaxed text-offwhite/70">
          {{ t('landing.footer.about') }}
        </p>
        <LandingSocials class="mt-7" />
      </div>

      <div class="grid content-start gap-12 sm:grid-cols-2 lg:pt-6">
        <nav v-reveal="1" :aria-label="t('landing.footer.nav')">
          <h3 class="font-display text-sm font-semibold text-gold">
            {{ t('landing.footer.product') }}
          </h3>
          <ul class="mt-5 grid gap-3.5">
            <li v-for="link in links" :key="link">
              <a
                :href="`#${link}`"
                class="atl-underline pb-0.5 text-offwhite/75 hover:text-offwhite"
              >
                {{ t(`landing.nav.${link}`) }}
              </a>
            </li>
          </ul>
        </nav>
        <div v-reveal="2">
          <h3 class="font-display text-sm font-semibold text-gold">
            {{ t('landing.footer.contact') }}
          </h3>
          <ul class="mt-5 grid gap-3.5 text-offwhite/75">
            <li>
              <a
                :href="`mailto:${contact.email}`"
                class="group inline-flex items-center gap-3 hover:text-offwhite"
              >
                <AtlIcon name="mail" :size="16" class="text-gold" />
                <bdi dir="ltr" class="atl-underline pb-0.5">{{ contact.email }}</bdi>
              </a>
            </li>
            <li>
              <a :href="phoneHref" class="group inline-flex items-center gap-3 hover:text-offwhite">
                <AtlIcon name="phone" :size="16" class="text-gold" />
                <bdi dir="ltr" class="atl-underline pb-0.5">{{ contact.phone }}</bdi>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-6xl px-4">
      <div
        class="flex flex-col gap-4 border-t border-offwhite/10 py-7 text-sm text-offwhite/60 sm:flex-row sm:items-center sm:justify-between"
      >
        <p>{{ t('landing.footer.rights') }}</p>
        <button
          type="button"
          class="atl-glass inline-flex items-center gap-2 self-start rounded-full px-4 py-2 transition-colors hover:bg-offwhite/15 hover:text-offwhite sm:self-auto"
          :aria-label="t('landing.footer.language')"
          @click="toggleLocale"
        >
          <AtlIcon name="globe" :size="16" />
          {{ t('language.switch') }}
        </button>
      </div>
    </div>
  </footer>
</template>
