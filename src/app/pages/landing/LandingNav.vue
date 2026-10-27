<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AtlantechLogo from '@/brand/AtlantechLogo.vue'
import { setLocale } from '@/i18n'

const { t, locale } = useI18n()

const links = ['features', 'how', 'roles', 'faq']
const scrolled = ref(false)
const open = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 24
}

function toggleLocale() {
  setLocale(locale.value === 'en' ? 'ar' : 'en')
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<!-- Landing navigation: clear over the hero sky, solid once the page scrolls. -->
<template>
  <header
    class="fixed inset-x-0 top-0 z-50 text-offwhite transition-colors duration-300"
    :class="scrolled || open ? 'bg-navy/90 shadow-lg backdrop-blur' : 'bg-transparent'"
  >
    <nav class="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
      <a href="#top" class="shrink-0" @click="open = false">
        <AtlantechLogo shape="wordmark" tone="reversed" :height="28" />
      </a>
      <ul class="ms-auto hidden items-center gap-6 md:flex">
        <li v-for="link in links" :key="link">
          <a
            :href="`#${link}`"
            class="text-sm font-medium text-offwhite/80 transition-colors hover:text-offwhite"
          >
            {{ t(`landing.nav.${link}`) }}
          </a>
        </li>
      </ul>
      <button
        type="button"
        class="ms-auto rounded-full border border-offwhite/40 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-offwhite/10 md:ms-0"
        @click="toggleLocale"
      >
        {{ t('language.switch') }}
      </button>
      <button
        type="button"
        class="grid size-10 place-items-center rounded-full hover:bg-offwhite/10 md:hidden"
        :aria-expanded="open"
        aria-controls="landing-menu"
        :aria-label="open ? t('landing.nav.close') : t('landing.nav.menu')"
        @click="open = !open"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        >
          <path v-if="open" d="M6 6l12 12M18 6L6 18" />
          <path v-else d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
    </nav>
    <ul v-if="open" id="landing-menu" class="grid gap-1 px-4 pb-4 md:hidden">
      <li v-for="link in links" :key="link">
        <a
          :href="`#${link}`"
          class="block rounded-[var(--atl-radius-sm)] px-3 py-3 font-medium hover:bg-offwhite/10"
          @click="open = false"
        >
          {{ t(`landing.nav.${link}`) }}
        </a>
      </li>
    </ul>
  </header>
</template>
