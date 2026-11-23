<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/AppIcon.vue'
import AtlStatusBadge from '@/components/ui/AtlStatusBadge.vue'
import { deviceStatus, useDeviceList } from './devices'

const props = defineProps({
  /** the user's id; empty while the user is not created yet */
  userId: { type: [Number, String], default: null },
  userName: { type: String, default: '' },
})

const { t } = useI18n()
const { items, meta, isPending, isError } = useDeviceList(() => props.userId, {
  page: 1,
  per_page: 5,
})
const total = computed(() => meta.value?.total ?? 0)
</script>

<!-- "Registered Devices" card of P-24 (FE-046), Figma "P-24 / User Details / Populated edit":
     how many devices the user has, the latest few, and the way to P-25. -->
<template>
  <aside class="overflow-hidden rounded-control border border-edge bg-card">
    <header class="border-b border-edge bg-subtle px-5 py-4">
      <h2 class="type-h3 text-fg">{{ t('devices.title') }}</h2>
    </header>
    <div class="flex flex-col gap-3 p-5">
      <template v-if="!userId">
        <p class="type-strong-m text-fg">{{ t('devices.card.unsavedTitle') }}</p>
        <p class="type-caption text-fg-secondary">{{ t('devices.card.unsavedBody') }}</p>
      </template>
      <p v-else-if="isPending" class="type-body-m text-fg-muted">{{ t('states.loading') }}</p>
      <p v-else-if="isError" class="type-body-m text-status-danger-fg">{{ t('devices.error') }}</p>
      <template v-else>
        <p class="type-h2 text-fg">{{ t('devices.card.count', total) }}</p>
        <p class="type-caption text-fg-secondary">
          {{ t('devices.card.body', { name: userName }) }}
        </p>
        <ul v-if="items.length" class="flex flex-col gap-2">
          <li v-for="device in items" :key="device.id" class="flex items-center justify-between">
            <span class="type-body-m text-fg">{{ t(`devices.platforms.${device.platform}`) }}</span>
            <AtlStatusBadge :value="deviceStatus(device)" />
          </li>
        </ul>
      </template>
      <RouterLink
        v-if="userId"
        :to="{ name: 'user-devices', params: { id: userId } }"
        class="inline-flex h-control w-fit items-center gap-2 rounded-control border border-edge-strong bg-card px-4 type-strong-m text-fg transition-colors hover:bg-subtle focus-visible:shadow-focus focus-visible:outline-none"
      >
        <AppIcon name="eye" />
        {{ t('devices.card.view') }}
      </RouterLink>
    </div>
  </aside>
</template>
