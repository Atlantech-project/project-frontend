<script setup>
import { useI18n } from 'vue-i18n'
import { useRoleName } from '@/app/useRoleName'
import { useSessionStore } from '@/stores/session'

const { t } = useI18n()
const session = useSessionStore()

const roleName = useRoleName()
</script>

<!-- Temporary home after sign-in, inside the app shell, until the P-17 Home Dashboard (FE-040). -->
<template>
  <section
    class="flex max-w-[640px] flex-col gap-4 rounded-card border border-edge bg-card p-6"
    aria-labelledby="home-welcome"
  >
    <div class="flex flex-col gap-2">
      <h2 id="home-welcome" class="type-h3 text-fg">
        {{ t('home.welcome', { name: session.user?.name ?? '' }) }}
      </h2>
      <p class="type-body-m text-fg-muted">{{ t('home.body') }}</p>
    </div>
    <div class="flex flex-col gap-0.5 bg-subtle px-3 py-2.5">
      <span class="type-caption text-fg-muted">{{ t('home.roleLabel') }}</span>
      <span class="type-strong-m text-fg">{{ roleName }}</span>
    </div>
  </section>
</template>
