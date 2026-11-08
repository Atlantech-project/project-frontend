<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AtlantechLogo from '@/brand/AtlantechLogo.vue'
import AtlButton from '@/components/ui/AtlButton.vue'
import { useSessionStore } from '@/stores/session'

const { t, te } = useI18n()
const router = useRouter()
const session = useSessionStore()

const roleName = computed(() => {
  const key = `home.roles.${session.role}`
  return te(key) ? t(key) : (session.role ?? '')
})
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

<!-- Temporary home after sign-in, until the role home pages (P-17) and the app shell exist. -->
<template>
  <main class="grid min-h-screen place-items-center bg-page px-4 py-10">
    <section
      class="flex w-full max-w-[480px] flex-col gap-5 rounded-card border border-edge bg-card p-8"
      aria-labelledby="home-title"
    >
      <AtlantechLogo :height="64" :card-on-dark="false" />
      <div class="flex flex-col gap-2 text-fg">
        <h1 id="home-title" class="type-h1">
          {{ t('home.welcome', { name: session.user?.name ?? '' }) }}
        </h1>
        <p class="type-body-m text-fg-muted">{{ t('home.body') }}</p>
      </div>
      <div class="flex flex-col gap-0.5 bg-subtle px-3 py-2.5">
        <span class="type-caption text-fg-muted">{{ t('home.roleLabel') }}</span>
        <span class="type-strong-m text-fg">{{ roleName }}</span>
      </div>
      <AtlButton variant="secondary" :loading="signingOut" @click="signOut">
        {{ t('home.signOut') }}
      </AtlButton>
    </section>
  </main>
</template>
