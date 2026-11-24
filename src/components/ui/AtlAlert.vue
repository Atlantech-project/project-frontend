<script setup>
defineProps({
  title: { type: String, default: '' },
  /** neutral matches the login messages in Figma; the others follow the status colours */
  tone: {
    type: String,
    default: 'neutral',
    validator: (v) => ['neutral', 'info', 'success', 'warning', 'danger'].includes(v),
  },
  /** assertive for errors the user must notice now (role=alert), polite for the rest */
  live: { type: String, default: 'polite', validator: (v) => ['polite', 'assertive'].includes(v) },
})

const tones = {
  neutral: 'bg-subtle',
  info: 'border border-status-info-border bg-status-info-bg',
  success: 'border border-status-success-border bg-status-success-bg',
  warning: 'border border-status-warning-border bg-status-warning-bg',
  danger: 'border border-status-danger-border bg-status-danger-bg',
}
</script>

<!-- Inline message (FE-016), from Figma "Authentication and session message":
     a bold title and a short line under it. Body text goes in the default slot. -->
<template>
  <div
    :role="live === 'assertive' ? 'alert' : 'status'"
    class="flex w-full flex-col gap-1 rounded-control p-3"
    :class="tones[tone]"
  >
    <p v-if="title" class="type-strong-m text-fg">{{ title }}</p>
    <p v-if="$slots.default" class="type-caption text-fg-secondary"><slot /></p>
  </div>
</template>
