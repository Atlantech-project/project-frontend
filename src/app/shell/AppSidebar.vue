<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AtlantechLogo from '@/brand/AtlantechLogo.vue'
import AtlIcon from '@/components/AtlIcon.vue'
import { setLocale } from '@/i18n'
import { navigationFor } from '@/app/navigation'
import { useSessionStore } from '@/stores/session'
import { useRoleName } from '@/app/useRoleName'

defineProps({
  portName: { type: String, default: '' },
})

const { t, locale } = useI18n()
const router = useRouter()
const session = useSessionStore()

// Menu icons until the approved icon set (FE-018).
const ICONS = { 'P-17': 'home', 'P-18': 'anchor', 'P-19': 'bell', 'P-21': 'pulse' }

// The role's menu as one list (Figma has no section headings). Pages appear once their route
// exists, so the menu never leads to Not Found.
const items = computed(() =>
  navigationFor(session.role)
    .flatMap((section) => section.items)
    .filter((item) => router.resolve(item.path).name !== 'not-found'),
)

const roleName = useRoleName()

const signingOut = ref(false)
async function signOut() {
  signingOut.value = true
  try {
    await session.logout()
  } catch {
    // Signed out locally anyway.
  } finally {
    signingOut.value = false
    await router.replace({ name: 'login' })
  }
}

function toggleLocale() {
  setLocale(locale.value === 'en' ? 'ar' : 'en')
}
</script>

<!-- Port-local sidebar (FE-020), Figma "Port-local sidebar": deployment identity, the role's
     menu, and the signed-in user with sign-out. -->
<template>
  <aside
    class="fixed inset-y-0 start-0 flex w-sidebar flex-col gap-4 overflow-y-auto bg-inverse px-4 py-7 text-fg-inverse"
  >
    <div class="flex flex-col gap-2 px-3">
      <!-- Name only, cropped above the tagline like the landing nav (the tagline is unreadable
           at this size). -->
      <span class="flex h-[19px] items-start self-start overflow-hidden">
        <AtlantechLogo shape="wordmark" tone="reversed" :height="42" class="-ms-[11px] -mt-[6px]" />
      </span>
      <p class="type-caption">{{ t('shell.deployment') }}</p>
      <p v-if="portName" class="type-strong-m text-card">{{ portName }}</p>
    </div>

    <nav :aria-label="t('shell.menu')" class="mt-2">
      <ul class="flex flex-col gap-1">
        <li v-for="item in items" :key="item.pageId">
          <RouterLink
            :to="item.path"
            class="flex h-11 items-center gap-3 rounded-control px-3 type-body-m text-fg-inverse transition-colors hover:bg-navy-700 focus-visible:shadow-focus focus-visible:outline-none"
            active-class="!bg-brand-secondary type-strong-m !text-card"
          >
            <AtlIcon :name="ICONS[item.pageId] ?? 'grid'" :size="18" />
            {{ t(item.labelKey) }}
          </RouterLink>
        </li>
      </ul>
    </nav>

    <div class="mt-auto flex flex-col gap-3 border-t border-edge-inverse px-3 pt-5">
      <div class="flex flex-col gap-1">
        <p class="type-strong-m text-card">{{ session.user?.name }}</p>
        <p class="type-caption">{{ roleName }}</p>
      </div>
      <button
        type="button"
        class="self-start type-body-s text-fg-inverse hover:text-card focus-visible:shadow-focus focus-visible:outline-none"
        @click="toggleLocale"
      >
        {{ t('language.switch') }}
      </button>
      <button
        type="button"
        class="flex items-center gap-2 self-start type-body-s text-fg-inverse hover:text-card focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-60"
        :disabled="signingOut"
        :aria-busy="signingOut || undefined"
        @click="signOut"
      >
        <AtlIcon name="logout" :size="16" class="rtl:-scale-x-100" />
        {{ t('shell.signOut') }}
      </button>
    </div>
  </aside>
</template>
