<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AtlIcon from '@/components/AtlIcon.vue'
import AtlButton from '@/components/ui/AtlButton.vue'
import { fieldChanges, humanize } from './audit'
import { useAuditLabels } from './useAuditLabels'

const props = defineProps({
  entry: { type: Object, required: true },
})
const emit = defineEmits(['back'])

const { t } = useI18n()
const labels = useAuditLabels()

const changes = computed(() => fieldChanges(props.entry))
const facts = computed(() => [
  { label: t('audit.columns.entity'), value: labels.entity(props.entry) },
  { label: t('audit.columns.action'), value: labels.action(props.entry.action) },
  {
    label: t('audit.columns.actor'),
    value: props.entry.actor
      ? `${props.entry.actor.name} · ${props.entry.actor.username}`
      : t('audit.system'),
  },
  { label: t('audit.columns.time'), value: labels.time(props.entry.occurred_at, { year: true }) },
])
</script>

<!-- P-29 "Change details": what one audit row changed, before and after. -->
<template>
  <div class="flex flex-col gap-3">
    <div class="flex justify-end">
      <AtlButton variant="secondary" size="sm" @click="emit('back')">
        <AtlIcon name="back" :size="16" class="rtl:-scale-x-100" />
        {{ t('audit.details.back') }}
      </AtlButton>
    </div>

    <section class="flex flex-col gap-3 rounded-control border border-edge bg-subtle p-4">
      <h2 class="type-strong-m text-fg">{{ t('audit.details.summary') }}</h2>
      <dl class="flex flex-col gap-2">
        <div v-for="fact in facts" :key="fact.label" class="flex gap-4">
          <dt class="w-[180px] shrink-0 type-caption text-fg-muted">{{ fact.label }}</dt>
          <dd class="type-label-m text-fg">{{ fact.value }}</dd>
        </div>
      </dl>
    </section>

    <section class="overflow-hidden rounded-control border border-edge bg-card">
      <header class="flex h-11 items-center justify-between gap-3 px-4">
        <h2 class="type-strong-m text-fg">{{ t('audit.details.changes') }}</h2>
        <p class="type-caption text-fg-muted">{{ t('audit.details.count', changes.length) }}</p>
      </header>
      <table v-if="changes.length" class="w-full table-fixed text-start">
        <thead class="border-y border-edge bg-subtle">
          <tr class="h-11">
            <th scope="col" class="w-[30%] px-4 text-start type-strong-s text-fg">
              {{ t('audit.details.field') }}
            </th>
            <th scope="col" class="px-4 text-start type-strong-s text-fg">
              {{ t('audit.details.before') }}
            </th>
            <th scope="col" class="px-4 text-start type-strong-s text-fg">
              {{ t('audit.details.after') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="change in changes"
            :key="change.field"
            class="border-b border-edge last:border-0"
          >
            <th scope="row" class="px-4 py-3.5 text-start type-strong-s text-fg">
              {{ humanize(change.field) }}
            </th>
            <td class="px-4 py-3.5 type-body-s break-words text-fg">{{ change.before }}</td>
            <td class="px-4 py-3.5 type-body-s break-words text-fg">{{ change.after }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="border-t border-edge px-4 py-6 type-body-m text-fg-muted">
        {{ t('audit.details.none') }}
      </p>
    </section>
  </div>
</template>
