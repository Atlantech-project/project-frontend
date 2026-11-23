<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/AppIcon.vue'
import AtlIcon from '@/components/AtlIcon.vue'
import AtlEmptyState from '@/components/states/AtlEmptyState.vue'
import AtlErrorState from '@/components/states/AtlErrorState.vue'
import AtlLoadingState from '@/components/states/AtlLoadingState.vue'
import AtlAlert from '@/components/ui/AtlAlert.vue'
import AtlButton from '@/components/ui/AtlButton.vue'
import AtlField from '@/components/ui/AtlField.vue'
import AtlInput from '@/components/ui/AtlInput.vue'
import AtlStatusBadge from '@/components/ui/AtlStatusBadge.vue'
import { inputClasses } from '@/components/ui/inputClasses'
import { errorMessage } from '@/api/errors'
import { useResourceList } from '@/composables/useResource'
import DeactivateUserDialog from './DeactivateUserDialog.vue'
import { useDeactivate } from './useDeactivate'
import { useUserLabels } from './useUserLabels'
import { PAGE_SIZE, STATUS_FILTERS, userParams, users } from './users'

const i18n = useI18n()
const { t } = i18n
const labels = useUserLabels()

const filters = reactive({ q: '', status: '' })
const page = ref(1)

// The search box waits for a pause in typing before asking the server.
const search = ref('')
let searchTimer
watch(search, (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => (filters.q = value), 300)
})
watch(filters, () => (page.value = 1))

const filtered = computed(() => !!filters.q.trim() || !!filters.status)
function clearFilters() {
  search.value = ''
  Object.assign(filters, { q: '', status: '' })
}

const params = computed(() => userParams({ ...filters, page: page.value }))
const { items, meta, isPending, isError, error, isFetching, refetch } = useResourceList(
  users,
  params,
)

const total = computed(() => meta.value?.total ?? 0)
const lastPage = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
const firstRow = computed(() => (total.value ? (page.value - 1) * PAGE_SIZE + 1 : 0))
const lastRow = computed(() => firstRow.value + items.value.length - (items.value.length ? 1 : 0))

const deactivate = useDeactivate()

const selectClass = [...inputClasses(), 'appearance-none pe-8']
const rowButton =
  'inline-flex h-7 items-center gap-1.5 rounded-control border border-edge-strong bg-card px-3 type-label-s whitespace-nowrap text-fg transition-colors hover:bg-subtle focus-visible:shadow-focus focus-visible:outline-none'
</script>

<!-- P-23 User Management (FE-045), Figma "P-23 / User Management / Normal": the port's user
     accounts with search and status filter, Create User, and Deactivate. The licence bar, the
     role filter and the terminal filter wait for their APIs (decided 2026-11-23). -->
<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="type-body-l text-fg-muted">{{ t('users.intro') }}</p>
      <RouterLink
        :to="{ name: 'user-new' }"
        class="inline-flex h-control items-center gap-2 rounded-control bg-brand px-4 type-strong-m text-fg-inverse transition-colors hover:bg-brand-hover focus-visible:shadow-focus focus-visible:outline-none"
      >
        <AppIcon name="plus" />
        {{ t('users.create') }}
      </RouterLink>
    </div>

    <AtlAlert v-if="deactivate.error.value" tone="danger" live="assertive">
      {{ errorMessage(deactivate.error.value, i18n) }}
    </AtlAlert>

    <form class="flex flex-wrap items-start gap-3" role="search" @submit.prevent>
      <div class="w-[340px]">
        <AtlInput
          v-model="search"
          type="search"
          :label="t('users.filters.search')"
          :placeholder="t('users.filters.searchPlaceholder')"
        />
      </div>
      <div class="w-[220px]">
        <AtlField id="users-status" :label="t('users.filters.status')">
          <div class="relative">
            <select id="users-status" v-model="filters.status" :class="selectClass">
              <option v-for="value in STATUS_FILTERS" :key="value" :value="value">
                {{ t(`users.filters.statuses.${value || 'all'}`) }}
              </option>
            </select>
            <AtlIcon
              name="chevron"
              :size="16"
              class="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-fg-muted"
            />
          </div>
        </AtlField>
      </div>
    </form>

    <section class="overflow-hidden rounded-control border border-edge bg-card">
      <header class="flex h-11 items-center justify-between gap-3 px-4">
        <h2 class="type-strong-m text-fg">{{ t('users.table.title') }}</h2>
        <p v-if="total" class="type-caption text-fg-muted" aria-live="polite">
          {{ t('users.table.count', total) }}
        </p>
      </header>

      <div v-if="isPending" class="border-t border-edge">
        <AtlLoadingState />
      </div>
      <div v-else-if="isError" class="border-t border-edge">
        <AtlErrorState
          :title="t('users.error')"
          :message="errorMessage(error, i18n)"
          retryable
          @retry="refetch()"
        />
      </div>
      <div v-else-if="!items.length" class="border-t border-edge">
        <AtlEmptyState
          :title="t(filtered ? 'users.empty.filteredTitle' : 'users.empty.title')"
          :message="t(filtered ? 'users.empty.filteredBody' : 'users.empty.body')"
        >
          <AtlButton
            v-if="filtered"
            variant="secondary"
            :label="t('users.empty.clear')"
            @click="clearFilters"
          />
        </AtlEmptyState>
      </div>
      <template v-else>
        <div class="overflow-x-auto" :class="{ 'opacity-60': isFetching }">
          <table class="w-full min-w-[960px] text-start">
            <thead class="border-y border-edge bg-subtle">
              <tr class="h-11">
                <th
                  v-for="column in ['name', 'username', 'role', 'terminal', 'active', 'actions']"
                  :key="column"
                  scope="col"
                  class="px-4 text-start type-strong-s whitespace-nowrap text-fg"
                >
                  {{ t(`users.columns.${column}`) }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in items"
                :key="user.id"
                class="h-16 border-b border-edge last:border-0"
              >
                <td class="px-4 type-strong-s text-fg">{{ user.name }}</td>
                <td class="px-4 type-body-s text-fg">{{ user.username }}</td>
                <td class="px-4 type-body-s text-fg">{{ labels.role(user.active_role?.role) }}</td>
                <td class="px-4 type-body-s text-fg">
                  {{ labels.terminal(user.active_role?.terminal_id) }}
                </td>
                <td class="px-4"><AtlStatusBadge :value="labels.status(user)" /></td>
                <td class="px-4">
                  <div class="flex gap-3">
                    <RouterLink
                      :to="{ name: 'user-details', params: { id: user.id } }"
                      :class="rowButton"
                    >
                      <AppIcon name="eye" />
                      {{ t('users.table.open') }}
                    </RouterLink>
                    <button
                      v-if="user.is_active"
                      type="button"
                      :class="rowButton"
                      @click="deactivate.ask(user)"
                    >
                      <AppIcon name="ban" />
                      {{ t('users.table.deactivate') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <footer class="flex items-center justify-between gap-3 border-t border-edge px-4 py-2.5">
          <p class="type-caption text-fg-muted">
            {{ t('users.table.shown', { from: firstRow, to: lastRow, total }) }}
          </p>
          <div class="flex items-center gap-3">
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

    <DeactivateUserDialog
      v-model:visible="deactivate.open.value"
      :user="deactivate.target.value"
      :refused="deactivate.refused.value"
      :busy="deactivate.busy.value"
      @confirm="deactivate.confirm()"
    />
  </div>
</template>
