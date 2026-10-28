<script setup>
import { useI18n } from 'vue-i18n'
import AtlIcon from '@/components/AtlIcon.vue'
import { vReveal } from './reveal'

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
        <h2
          v-reveal
          class="font-display text-3xl leading-tight font-semibold tracking-tight sm:text-4xl"
        >
          {{ t('landing.roles.title') }}
        </h2>
        <p v-reveal="1" class="mt-3 text-lg text-offwhite/90">{{ t('landing.roles.body') }}</p>
      </div>
      <ul class="grid gap-3 sm:grid-cols-2">
        <li
          v-for="(role, i) in roles"
          :key="role.key"
          v-reveal="i"
          class="group flex items-center gap-4 rounded-[var(--atl-radius)] bg-offwhite/5 px-5 py-4 text-lg transition-colors hover:bg-offwhite/10"
        >
          <span
            class="grid size-10 shrink-0 place-items-center rounded-full bg-gold text-navy transition-transform duration-500 group-hover:rotate-[-8deg]"
          >
            <AtlIcon :name="role.icon" :size="20" />
          </span>
          {{ t(`landing.roles.items.${role.key}`) }}
        </li>
      </ul>
    </div>
  </section>
</template>
