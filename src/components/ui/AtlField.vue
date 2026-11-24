<script setup>
defineProps({
  /** id of the control, so the label points at it */
  id: { type: String, required: true },
  label: { type: String, default: '' },
  /** Help text under the control */
  hint: { type: String, default: '' },
  /** Error text under the control; replaces the hint */
  error: { type: String, default: '' },
})
</script>

<!-- Label, control and help/error text for one form field (FE-016). The control goes in the slot. -->
<template>
  <div class="flex w-full flex-col gap-2">
    <label v-if="label" :for="id" class="type-strong-m text-fg">{{ label }}</label>
    <slot />
    <p v-if="error" :id="`${id}-error`" class="type-caption text-status-danger-fg">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="type-caption text-fg-muted">{{ hint }}</p>
  </div>
</template>
