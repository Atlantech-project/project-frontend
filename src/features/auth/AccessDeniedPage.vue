<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AtlIcon from '@/components/AtlIcon.vue'
import AtlButton from '@/components/ui/AtlButton.vue'
import { useSessionStore } from '@/stores/session'
import { ACCESS_DENIED_REASONS } from '@/app/router/guard'
import { HOME } from './redirect'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const session = useSessionStore()

const reason = computed(() =>
  ACCESS_DENIED_REASONS.includes(route.query.reason) ? route.query.reason : 'permissions',
)
// Field roles (DEC-48) have no web pages, so the way out is signing out, not going home.
const mobileOnly = computed(() => reason.value === 'mobileOnly')
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
</script>

<!-- P-20 Access Denied (FE-021). Figma: "P-20 / Access Denied / *". Shown on its own until the
     app shell exists; the card then moves inside it unchanged. -->
<template>
  <main class="grid min-h-screen place-items-center bg-page px-4 py-10">
    <section
      class="flex w-full max-w-[600px] flex-col gap-5 rounded-card border border-edge bg-card p-8"
      aria-labelledby="denied-title"
    >
      <span
        class="grid size-9 place-items-center rounded-control border border-edge bg-subtle text-xl text-fg-muted"
        aria-hidden="true"
        >!</span
      >
      <div class="flex flex-col gap-2 text-fg">
        <h1 id="denied-title" class="type-h1">{{ t('accessDenied.title') }}</h1>
        <p class="type-body-m">{{ t('accessDenied.body') }}</p>
      </div>
      <div class="flex flex-col gap-1.5 border border-edge bg-subtle p-4 text-fg">
        <p class="type-strong-xs">{{ t('accessDenied.reasonLabel') }}</p>
        <p class="type-body-m">{{ t(`accessDenied.reasons.${reason}`) }}</p>
      </div>
      <p class="type-body-s text-fg-muted">{{ t(`accessDenied.help.${reason}`) }}</p>
      <div class="flex flex-col items-start gap-2">
        <AtlButton v-if="mobileOnly" :loading="signingOut" @click="signOut">
          <AtlIcon name="back" :size="16" class="rtl:-scale-x-100" />
          {{ t('accessDenied.signOut') }}
        </AtlButton>
        <AtlButton v-else @click="router.replace(HOME)">
          <AtlIcon name="back" :size="16" class="rtl:-scale-x-100" />
          {{ t('accessDenied.backHome') }}
        </AtlButton>
        <p class="type-caption text-fg-muted">{{ t(`accessDenied.next.${reason}`) }}</p>
      </div>
    </section>
  </main>
</template>
