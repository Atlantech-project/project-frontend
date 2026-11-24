<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/AppIcon.vue'
import AtlEmptyState from '@/components/states/AtlEmptyState.vue'
import AtlErrorState from '@/components/states/AtlErrorState.vue'
import AtlLoadingState from '@/components/states/AtlLoadingState.vue'
import AtlAlert from '@/components/ui/AtlAlert.vue'
import AtlButton from '@/components/ui/AtlButton.vue'
import AtlDialog from '@/components/ui/AtlDialog.vue'
import AtlStatusBadge from '@/components/ui/AtlStatusBadge.vue'
import { errorMessage } from '@/api/errors'
import { useResourceItem } from '@/composables/useResource'
import { useUserLabels } from '@/features/users/useUserLabels'
import { users } from '@/features/users/users'
import { PAGE_SIZE, deviceStatus, devices, useDeviceList, useRefreshDevices } from './devices'

const i18n = useI18n()
const { t } = i18n
const labels = useUserLabels()
const route = useRoute()
const userId = computed(() => route.params.id)

const { data: user } = useResourceItem(users, userId)
const page = ref(1)
const params = computed(() => ({ page: page.value, per_page: PAGE_SIZE }))
const { items, meta, isPending, isError, error, isFetching, refetch } = useDeviceList(
  userId,
  params,
)
const refresh = useRefreshDevices(userId)

const total = computed(() => meta.value?.total ?? 0)
const lastPage = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
const activeCount = computed(() => items.value.filter((d) => !d.revoked_at).length)
const revokedCount = computed(() => items.value.length - activeCount.value)

const platform = (code) => (code ? t(`devices.platforms.${code}`) : '—')
const appVersion = (device) => device.app_version || '—'

// One confirmation dialog for "revoke this device" and "revoke all".
const pending = ref(null) // { kind: 'one' | 'all', device? }
const busy = ref(false)
const result = ref(null) // { tone, title, body }
const actionError = ref(null)

function ask(kind, device = null) {
  actionError.value = null
  pending.value = { kind, device }
}

async function run(action, success) {
  busy.value = true
  actionError.value = null
  result.value = null
  try {
    const answer = await action()
    result.value = success(answer)
  } catch (err) {
    actionError.value = err
  } finally {
    busy.value = false
    pending.value = null
    refresh()
  }
}

function confirm() {
  const { kind, device } = pending.value
  if (kind === 'all') {
    run(
      () => devices.revokeAll(userId.value),
      (counts) => ({
        title: t('devices.done.allTitle'),
        body: t('devices.done.allBody', counts.devices_revoked),
      }),
    )
  } else {
    run(
      () => devices.revoke(userId.value, device.id),
      () => ({
        title: t('devices.done.revokeTitle'),
        body: t('devices.done.revokeBody', { device: platform(device.platform) }),
      }),
    )
  }
}

function restore(device) {
  run(
    () => devices.restore(userId.value, device.id),
    () => ({
      title: t('devices.done.restoreTitle'),
      body: t('devices.done.restoreBody', { device: platform(device.platform) }),
    }),
  )
}

const dialogOpen = computed({
  get: () => pending.value !== null,
  set: (open) => {
    if (!open && !busy.value) pending.value = null
  },
})

const rowButton =
  'inline-flex h-9 items-center gap-1.5 rounded-control border border-edge-strong bg-card px-3 type-label-s whitespace-nowrap text-fg transition-colors hover:bg-subtle focus-visible:shadow-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
</script>

<!-- P-25 Registered Devices (FE-046), Figma "P-25 / Registered Devices / Populated": one user's
     mobile devices, with Revoke Token for one device or all of them, and Restore for a revoked
     one. Revoking ends the device's sessions; it never deletes the device or touches its data. -->
<template>
  <div class="flex flex-col gap-3">
    <p class="type-body-l text-fg-muted">{{ t('devices.intro') }}</p>
    <RouterLink
      :to="{ name: 'user-details', params: { id: userId } }"
      class="type-body-m text-fg-link hover:underline"
    >
      {{ user ? t('devices.backTo', { name: user.name }) : t('devices.back') }}
    </RouterLink>

    <div
      v-if="user"
      class="flex flex-wrap items-center gap-x-10 gap-y-2 rounded-control border border-edge bg-subtle px-4 py-3"
    >
      <div class="flex flex-col">
        <p class="type-h3 text-fg">{{ user.name }}</p>
        <p class="type-body-s text-fg-muted">{{ user.username }}</p>
      </div>
      <p class="type-strong-s text-fg">{{ labels.roleLine(user) }}</p>
      <span class="ms-auto">
        <AtlStatusBadge :value="labels.status(user)" />
      </span>
    </div>

    <AtlAlert v-if="result" tone="success" :title="result.title">{{ result.body }}</AtlAlert>
    <AtlAlert v-if="actionError" tone="danger" live="assertive" :title="t('devices.failed')">
      {{ errorMessage(actionError, i18n) }}
    </AtlAlert>

    <section class="overflow-hidden rounded-control border border-edge bg-card">
      <header class="flex min-h-12 flex-wrap items-center justify-between gap-3 px-4 py-2">
        <h2 class="type-strong-m text-fg">{{ t('devices.table.title') }}</h2>
        <p class="type-caption text-fg-muted" aria-live="polite">
          {{ t('devices.table.count', total) }}
          <template v-if="total">
            · {{ t('devices.table.active', activeCount) }}
            <template v-if="revokedCount"
              >· {{ t('devices.table.revoked', revokedCount) }}</template
            >
          </template>
        </p>
        <button
          type="button"
          :class="rowButton"
          :disabled="!activeCount || busy"
          @click="ask('all')"
        >
          <AppIcon name="ban" />
          {{ t('devices.revokeAll') }}
        </button>
      </header>

      <div v-if="isPending" class="border-t border-edge">
        <AtlLoadingState />
      </div>
      <div v-else-if="isError" class="border-t border-edge">
        <AtlErrorState
          :title="t('devices.error')"
          :message="errorMessage(error, i18n)"
          retryable
          @retry="refetch()"
        />
      </div>
      <div v-else-if="!items.length" class="border-t border-edge">
        <AtlEmptyState
          :title="t('devices.empty.title')"
          :message="user ? t('devices.empty.body', { name: user.name }) : ''"
        />
      </div>
      <template v-else>
        <div class="overflow-x-auto" :class="{ 'opacity-60': isFetching }">
          <table class="w-full min-w-[900px] text-start">
            <thead class="border-y border-edge bg-subtle">
              <tr class="h-11">
                <th
                  v-for="column in [
                    'device',
                    'deviceId',
                    'appVersion',
                    'lastSeen',
                    'status',
                    'actions',
                  ]"
                  :key="column"
                  scope="col"
                  class="px-4 text-start type-strong-s whitespace-nowrap text-fg"
                >
                  {{ t(`devices.columns.${column}`) }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="device in items"
                :key="device.id"
                class="h-[72px] border-b border-edge last:border-0"
              >
                <td class="px-4 type-strong-s text-fg">{{ platform(device.platform) }}</td>
                <td class="max-w-[200px] truncate px-4 font-mono type-body-s text-fg-secondary">
                  {{ device.device_id }}
                </td>
                <td class="px-4 type-body-s text-fg">{{ appVersion(device) }}</td>
                <td class="px-4 type-body-s whitespace-nowrap text-fg">
                  {{ device.last_seen_at ? `${labels.date(device.last_seen_at)} UTC` : '—' }}
                </td>
                <td class="px-4"><AtlStatusBadge :value="deviceStatus(device)" /></td>
                <td class="px-4">
                  <button
                    v-if="!device.revoked_at"
                    type="button"
                    :class="rowButton"
                    :disabled="busy"
                    @click="ask('one', device)"
                  >
                    <AppIcon name="ban" />
                    {{ t('devices.revoke') }}
                  </button>
                  <button
                    v-else
                    type="button"
                    :class="rowButton"
                    :disabled="busy"
                    @click="restore(device)"
                  >
                    <AppIcon name="refresh" />
                    {{ t('devices.restore') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <footer class="flex items-center justify-between gap-3 border-t border-edge px-4 py-2.5">
          <p class="type-caption text-fg-muted">{{ t('devices.table.shown', total) }}</p>
          <div v-if="lastPage > 1" class="flex items-center gap-3">
            <p class="type-caption text-fg-muted">
              {{ t('users.table.page', { page, pages: lastPage }) }}
            </p>
            <AtlButton
              variant="secondary"
              size="sm"
              :label="t('users.table.previous')"
              :disabled="page <= 1"
              @click="page--"
            />
            <AtlButton
              variant="secondary"
              size="sm"
              :label="t('users.table.next')"
              :disabled="page >= lastPage"
              @click="page++"
            />
          </div>
        </footer>
      </template>
    </section>

    <section class="flex flex-col gap-1.5 rounded-control border border-edge bg-subtle px-4 py-3">
      <h2 class="type-strong-m text-fg">{{ t('devices.notes.title') }}</h2>
      <p class="type-caption text-fg-secondary">{{ t('devices.notes.lastSeen') }}</p>
      <p class="type-caption text-fg-secondary">{{ t('devices.notes.revoke') }}</p>
    </section>

    <AtlDialog
      v-model:visible="dialogOpen"
      :title="t(pending?.kind === 'all' ? 'devices.confirm.allTitle' : 'devices.confirm.title')"
      :closable="!busy"
    >
      <div v-if="user" class="flex flex-col border border-edge bg-subtle px-3 py-2.5 type-strong-m">
        <span>{{ user.name }} · {{ user.username }}</span>
        <template v-if="pending?.device">
          <span>
            {{ platform(pending.device.platform) }} ·
            {{ t('devices.confirm.version', { version: appVersion(pending.device) }) }}
          </span>
          <span v-if="pending.device.last_seen_at">
            {{ t('devices.confirm.lastSeen', { time: labels.date(pending.device.last_seen_at) }) }}
          </span>
        </template>
      </div>
      <p>
        {{
          pending?.kind === 'all'
            ? t('devices.confirm.allBody')
            : t('devices.confirm.body', { device: platform(pending?.device?.platform) })
        }}
      </p>
      <template #footer>
        <AtlButton
          variant="secondary"
          :label="t('devices.confirm.cancel')"
          :disabled="busy"
          @click="pending = null"
        />
        <AtlButton :loading="busy" @click="confirm">
          <AppIcon name="ban" />
          {{ t(pending?.kind === 'all' ? 'devices.revokeAll' : 'devices.revoke') }}
        </AtlButton>
      </template>
    </AtlDialog>
  </div>
</template>
