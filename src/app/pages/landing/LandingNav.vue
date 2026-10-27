<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AtlantechLogo from '@/brand/AtlantechLogo.vue'
import AtlIcon from '@/components/AtlIcon.vue'
import { setLocale } from '@/i18n'

const { t, locale } = useI18n()

const links = ['why', 'how', 'features', 'security', 'faq']
const scrolled = ref(false)
const open = ref(false)
const active = ref('')
let observer = null

function onScroll() {
  scrolled.value = window.scrollY > 24
}

function toggleLocale() {
  setLocale(locale.value === 'en' ? 'ar' : 'en')
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  if (typeof IntersectionObserver === 'undefined') return
  // The link of the section crossing the middle of the screen is marked as current.
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) active.value = entry.target.id
        else if (active.value === entry.target.id) active.value = ''
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  )
  for (const id of links) {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  observer?.disconnect()
})
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 text-offwhite transition-[background-color,box-shadow] duration-300"
    :class="scrolled || open ? 'bg-navy' : 'bg-transparent'"
  >
    <nav
      class="mx-auto grid h-[72px] max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4"
      :aria-label="t('landing.nav.label')"
    >
      <a href="#top" class="flex items-center" @click="open = false">
        <AtlantechLogo shape="wordmark" tone="reversed" :height="30" />
      </a>

      <ul class="hidden items-center justify-center gap-1 lg:flex">
        <li v-for="link in links" :key="link">
          <a
            :href="`#${link}`"
            class="block rounded-full px-4 py-2 text-[15px] font-medium transition-colors"
            :class="
              active === link
                ? 'bg-offwhite/15 text-offwhite'
                : 'text-offwhite/75 hover:bg-offwhite/5 hover:text-offwhite'
            "
            :aria-current="active === link ? 'true' : undefined"
          >
            {{ t(`landing.nav.${link}`) }}
          </a>
        </li>
      </ul>

      <div class="col-start-3 flex items-center gap-2">
        <button
          type="button"
          class="flex items-center gap-2 rounded-full border border-offwhite/30 px-4 py-2 text-sm font-medium transition-colors hover:bg-offwhite/10"
          @click="toggleLocale"
        >
          <AtlIcon name="globe" :size="16" />
          {{ t('language.switch') }}
        </button>
        <button
          type="button"
          class="grid size-10 place-items-center rounded-full transition-colors hover:bg-offwhite/10 lg:hidden"
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
            aria-hidden="true"
          >
            <path v-if="open" d="M6 6l12 12M18 6L6 18" />
            <path v-else d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>
    </nav>

    <ul v-if="open" id="landing-menu" class="grid gap-1 bg-black/15 px-4 pt-3 pb-5 lg:hidden">
      <li v-for="link in links" :key="link">
        <a
          :href="`#${link}`"
          class="block rounded-[var(--atl-radius-sm)] px-3 py-3 text-lg font-medium hover:bg-offwhite/10"
          @click="open = false"
        >
          {{ t(`landing.nav.${link}`) }}
        </a>
      </li>
    </ul>
  </header>
</template>
