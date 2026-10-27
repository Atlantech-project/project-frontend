<script setup>
import { useI18n } from 'vue-i18n'
import AtlIcon from '@/components/AtlIcon.vue'

const { t } = useI18n()

const roles = [
  { key: 'authority', icon: 'shield' },
  { key: 'pilotage', icon: 'ship' },
  { key: 'tugs', icon: 'anchor' },
  { key: 'terminal', icon: 'grid' },
  { key: 'safety', icon: 'pulse' },
  { key: 'admin', icon: 'window' },
]
</script>

<template>
  <section class="bg-surface-2 px-4 py-24">
    <div class="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
      <div>
        <h2
          class="font-display text-3xl leading-tight font-semibold tracking-tight text-text sm:text-4xl"
        >
          {{ t('landing.roles.title') }}
        </h2>
        <p class="mt-3 text-lg text-muted">{{ t('landing.roles.body') }}</p>
      </div>
      <ul class="grid gap-x-8 sm:grid-cols-2">
        <li
          v-for="role in roles"
          :key="role.key"
          class="flex items-center gap-3 border-b border-line py-4 text-lg text-text"
        >
          <AtlIcon :name="role.icon" :size="20" class="text-teal" />
          {{ t(`landing.roles.items.${role.key}`) }}
        </li>
      </ul>
    </div>
  </section>
</template>
