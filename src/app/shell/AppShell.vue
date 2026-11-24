<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/AppIcon.vue'
import { usePortName } from '@/app/useSystemInfo'
import AppSidebar from './AppSidebar.vue'

const { t } = useI18n()
const route = useRoute()
const portName = usePortName()
const title = computed(() => (route.meta.titleKey ? t(route.meta.titleKey) : ''))
</script>

<!-- Port app shell (FE-020), Figma "P-xx / *" frames: sidebar, page header and content area.
     Signed-in pages with meta.layout 'app' open inside it. -->
<template>
  <div class="min-h-screen bg-page text-fg">
    <AppSidebar :port-name="portName" />
    <div class="flex min-h-screen flex-col ps-sidebar">
      <header class="flex h-22 items-center gap-5 border-b border-edge px-8">
        <h1 class="type-h1">{{ title }}</h1>
        <p v-if="portName" class="ms-auto type-body-m text-fg">{{ portName }}</p>
        <!-- Notifications (P-19) arrive in a later sprint; the bell is shown but not active yet. -->
        <button
          type="button"
          :class="[
            'grid size-9 place-items-center rounded-control border border-edge bg-card text-fg-secondary disabled:cursor-not-allowed',
            portName ? '' : 'ms-auto',
          ]"
          :aria-label="t('shell.notifications')"
          disabled
        >
          <AppIcon name="bell" :size="20" />
        </button>
      </header>
      <main class="flex-1 px-8 py-6">
        <slot />
      </main>
    </div>
  </div>
</template>
