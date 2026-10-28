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

// Two rows of containers on the little ship in the finale.
const palette = ['#a58d66', '#c0d5d6', '#e5e1dd', '#2c6b78']
const cargo = Array.from({ length: 14 }, (_, i) => ({
  x: 14 + (i % 7) * 11.5,
  y: i < 7 ? 20 : 13.5,
  fill: palette[(i * 3 + Math.floor(i / 7)) % palette.length],
}))

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
      <div v-reveal="4">
        <a
          href="#top"
          class="atl-glass atl-glass-btn inline-flex items-center gap-2 rounded-full bg-navy/30 px-6 py-3 font-semibold text-offwhite hover:bg-navy/45"
        >
          <AtlIcon name="arrow-up" :size="18" class="atl-nudge-up" />
          {{ t('landing.finale.top') }}
        </a>
      </div>
    </div>
    <!-- A small ship rides the waves across the bottom of the section. -->
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 h-24 overflow-hidden"
      aria-hidden="true"
    >
      <svg class="atl-voyage absolute bottom-6 w-32" viewBox="0 0 120 40">
        <g class="atl-voyage__bob">
          <rect
            v-for="(c, i) in cargo"
            :key="i"
            :x="c.x"
            :y="c.y"
            width="11"
            height="6"
            rx="1"
            :fill="c.fill"
          />
          <rect x="96" y="6" width="12" height="21" rx="1.5" fill="#e5e1dd" />
          <rect x="98" y="9" width="8" height="3" rx="0.5" fill="#083a4f" />
          <path d="M2 26 H116 L110 38 H16 Z" fill="#083a4f" />
          <path d="M6 30 H114" stroke="#a58d66" stroke-width="1.5" />
        </g>
      </svg>
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
          class="atl-glass atl-glass-btn inline-flex items-center gap-2 self-start rounded-full px-4 py-2 hover:bg-offwhite/15 hover:text-offwhite sm:self-auto"
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

<style scoped>
/* The ship sails in from the right edge and out past the left, slowly, then comes round again. */
.atl-voyage {
  left: 100%;
  animation: atl-voyage 48s linear infinite;
}

.atl-voyage__bob {
  transform-box: fill-box;
  transform-origin: center;
  animation: atl-voyage-bob 4s ease-in-out infinite;
}

@keyframes atl-voyage {
  to {
    translate: calc(-100vw - 8rem) 0;
  }
}

@keyframes atl-voyage-bob {
  50% {
    translate: 0 1.5px;
    rotate: -1deg;
  }
}

@media (prefers-reduced-motion: reduce) {
  .atl-voyage {
    left: 70%;
    animation: none;
  }
  .atl-voyage__bob {
    animation: none;
  }
}
</style>
