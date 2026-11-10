<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AtlIcon from '@/components/AtlIcon.vue'
import AtlEmptyState from '@/components/states/AtlEmptyState.vue'
import AtlErrorState from '@/components/states/AtlErrorState.vue'
import AtlLoadingState from '@/components/states/AtlLoadingState.vue'
import AtlButton from '@/components/ui/AtlButton.vue'
import AtlField from '@/components/ui/AtlField.vue'
import AtlInput from '@/components/ui/AtlInput.vue'
import { inputClasses } from '@/components/ui/inputClasses'
import { errorMessage } from '@/api/errors'
import { useResourceList } from '@/composables/useResource'
import AuditDetails from './AuditDetails.vue'
import {
  AUDIT_ACTIONS,
  DEFAULT_RANGE,
  ENTITY_TYPES,
  PAGE_SIZE,
  RANGES,
  auditLogs,
  auditParams,
} from './audit'
import { useAuditLabels } from './useAuditLabels'

const i18n = useI18n()
const { t } = i18n
const labels = useAuditLabels()

const filters = reactive({ q: '', entityType: '', action: '', range: DEFAULT_RANGE })
const page = ref(1)

// The search box waits for a pause in typing before asking the server.
const search = ref('')
let searchTimer
watch(search, (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => (filters.q = value), 300)
})
watch(filters, () => (page.value = 1))

const filtered = computed(
  () => !!filters.q.trim() || !!filters.entityType || !!filters.action || filters.range !== 0,
)
function clearFilters() {
  search.value = ''
  Object.assign(filters, { q: '', entityType: '', action: '', range: 0 })
}

// `from` is fixed when the filters change, so paging and refetches keep the same window.
const params = computed(() => auditParams({ ...filters, page: page.value }))
const { items, meta, isPending, isError, error, isFetching, refetch } = useResourceList(
  auditLogs,
  params,
)

const total = computed(() => meta.value?.total ?? 0)
const lastPage = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
const firstRow = computed(() => (total.value ? (page.value - 1) * PAGE_SIZE + 1 : 0))
const lastRow = computed(() => firstRow.value + items.value.length - (items.value.length ? 1 : 0))

const selected = ref(null)
const selectClass = [...inputClasses(), 'appearance-none pe-8']
</script>

<!-- P-29 Port Audit & Change History (FE-050), Figma "P-29 / Port Audit & Change History":
     who changed what and when, with filters, and the before/after values of one change. -->
<template>
  <div class="flex flex-col gap-3">
    <p class="type-body-l text-fg-muted">{{ t('audit.intro') }}</p>

    <AuditDetails v-if="selected" :entry="selected" @back="selected = null" />

    <template v-else>
      <form class="flex flex-wrap items-start gap-3" role="search" @submit.prevent>
        <div class="w-[280px]">
          <AtlInput
            v-model="search"
            type="search"
            :label="t('audit.filters.search')"
            :placeholder="t('audit.filters.searchPlaceholder')"
          />
        </div>
        <div class="w-[220px]">
          <AtlField id="audit-entity" :label="t('audit.filters.entity')">
            <div class="relative">
              <select id="audit-entity" v-model="filters.entityType" :class="selectClass">
                <option value="">{{ t('audit.filters.allEntities') }}</option>
                <option v-for="type in ENTITY_TYPES" :key="type" :value="type">
                  {{ labels.entityType(type) }}
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
        <div class="w-[200px]">
          <AtlField id="audit-action" :label="t('audit.filters.action')">
            <div class="relative">
              <select id="audit-action" v-model="filters.action" :class="selectClass">
                <option value="">{{ t('audit.filters.allActions') }}</option>
                <option v-for="code in AUDIT_ACTIONS" :key="code" :value="code">
                  {{ labels.action(code) }}
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
        <div class="w-[200px]">
          <AtlField id="audit-range" :label="t('audit.filters.range')">
            <div class="relative">
              <select id="audit-range" v-model.number="filters.range" :class="selectClass">
                <option v-for="days in RANGES" :key="days" :value="days">
                  {{ t(`audit.ranges.${days}`) }}
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
          <h2 class="type-strong-m text-fg">{{ t('audit.table.title') }}</h2>
          <p v-if="total" class="type-caption text-fg-muted" aria-live="polite">
            {{ t('audit.table.shown', { from: firstRow, to: lastRow, total }) }}
          </p>
        </header>

        <div v-if="isPending" class="border-t border-edge">
          <AtlLoadingState />
        </div>
        <div v-else-if="isError" class="border-t border-edge">
          <AtlErrorState
            :title="t('audit.error')"
            :message="errorMessage(error, i18n)"
            retryable
            @retry="refetch()"
          />
        </div>
        <div v-else-if="!items.length" class="border-t border-edge">
          <AtlEmptyState
            :title="t(filtered ? 'audit.empty.filteredTitle' : 'audit.empty.title')"
            :message="t(filtered ? 'audit.empty.filteredBody' : 'audit.empty.body')"
          >
            <AtlButton
              v-if="filtered"
              variant="secondary"
              :label="t('audit.empty.clear')"
              @click="clearFilters"
            />
          </AtlEmptyState>
        </div>
        <template v-else>
          <div class="overflow-x-auto" :class="{ 'opacity-60': isFetching }">
            <table class="w-full min-w-[900px] text-start">
              <thead class="border-y border-edge bg-subtle">
                <tr class="h-11">
                  <th
                    v-for="column in ['time', 'actor', 'entity', 'action', 'summary']"
                    :key="column"
                    scope="col"
                    class="px-4 text-start type-strong-s whitespace-nowrap text-fg"
                  >
                    {{ t(`audit.columns.${column}`) }}
                  </th>
                  <th scope="col" class="px-4 text-start type-strong-s text-fg">
                    {{ t('audit.columns.actions') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="entry in items"
                  :key="entry.id"
                  class="h-[52px] border-b border-edge last:border-0"
                >
                  <td class="px-4 type-strong-s whitespace-nowrap text-fg">
                    {{ labels.time(entry.occurred_at) }}
                  </td>
                  <td class="px-4 type-body-s text-fg">{{ labels.actor(entry) }}</td>
                  <td class="px-4 type-body-s text-fg">{{ labels.entity(entry) }}</td>
                  <td
                    class="px-4 type-body-s whitespace-nowrap"
                    :class="
                      entry.action === 'REJECTED_ATTEMPT' ? 'text-status-danger-fg' : 'text-fg'
                    "
                  >
                    {{ labels.action(entry.action) }}
                  </td>
                  <td class="max-w-[280px] truncate px-4 type-body-s text-fg">
                    {{ labels.summary(entry) }}
                  </td>
                  <td class="px-4">
                    <button
                      type="button"
                      class="inline-flex h-7 items-center gap-1.5 rounded-control border border-edge-strong bg-card px-3 type-label-s whitespace-nowrap text-fg transition-colors hover:bg-subtle focus-visible:shadow-focus focus-visible:outline-none"
                      @click="selected = entry"
                    >
                      <AtlIcon name="eye" :size="16" />
                      {{ t('audit.table.view') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <footer
            v-if="lastPage > 1"
            class="flex items-center justify-end gap-3 border-t border-edge px-4 py-2.5"
          >
            <p class="type-caption text-fg-muted">
              {{ t('audit.table.page', { page, pages: lastPage }) }}
            </p>
            <AtlButton
              variant="secondary"
              size="sm"
              :label="t('audit.table.previous')"
              :disabled="page <= 1"
              @click="page--"
            />
            <AtlButton
              variant="secondary"
              size="sm"
              :label="t('audit.table.next')"
              :disabled="page >= lastPage"
              @click="page++"
            />
          </footer>
        </template>
      </section>
    </template>
  </div>
</template>
