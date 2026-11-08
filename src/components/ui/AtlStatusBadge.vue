<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { statusTone } from '@/app/statuses'

const props = defineProps({
  /** status code from the API, e.g. PLAN_CONFIRMED */
  value: { type: String, required: true },
})

const { t, te } = useI18n()

const TONES = {
  neutral: 'border-status-neutral-border bg-status-neutral-bg text-status-neutral-fg',
  success: 'border-status-success-border bg-status-success-bg text-status-success-fg',
  info: 'border-status-info-border bg-status-info-bg text-status-info-fg',
  warning: 'border-status-warning-border bg-status-warning-bg text-status-warning-fg',
  danger: 'border-status-danger-border bg-status-danger-bg text-status-danger-fg',
}

// An unknown code still shows, readable, until it gets a label.
const label = computed(() => {
  const key = `status.${props.value}`
  if (te(key)) return t(key)
  const words = props.value.toLowerCase().replaceAll('_', ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
})
</script>

<!-- Status badge (FE-017), Figma Components "Status badge": Neutral, Success, Info, Warning,
     Danger. Tone and label come from the status registry (src/app/statuses.js). -->
<template>
  <span
    class="inline-flex h-6 items-center rounded-control border px-2 type-body-s whitespace-nowrap"
    :class="TONES[statusTone(value)]"
    :data-status="value"
  >
    {{ label }}
  </span>
</template>
