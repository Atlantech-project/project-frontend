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
  <section id="roles" class="scroll-mt-16 bg-navy px-4 py-24 text-offwhite">
    <div class="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
      <div>
        <h2 class="font-display text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
          {{ t('landing.roles.title') }}
        </h2>
        <p class="mt-3 text-lg text-offwhite/75">{{ t('landing.roles.body') }}</p>
      </div>
      <ul class="grid gap-x-8 sm:grid-cols-2">
        <li
          v-for="role in roles"
          :key="role.key"
          class="flex items-center gap-4 border-b border-offwhite/15 py-4 text-lg"
        >
          <span class="grid size-10 place-items-center rounded-full bg-gold text-navy">
            <AtlIcon :name="role.icon" :size="20" />
          </span>
          {{ t(`landing.roles.items.${role.key}`) }}
        </li>
      </ul>
    </div>
  </section>
</template>
