<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'

const props = defineProps({
  label: { type: String, default: '' },
  /** primary: main action · secondary: outlined · ghost: text only · danger: destructive */
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'ghost', 'danger'].includes(v),
  },
  /** md = 40 px (web default) · lg = 48 px (primary action on forms like the login) */
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  type: { type: String, default: 'button' },
  /** Full width of its container */
  block: { type: Boolean, default: false },
  /** Shows a spinner, blocks clicks and keeps the label for screen readers */
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const variants = {
  primary: 'bg-brand text-fg-inverse hover:bg-brand-hover active:bg-brand-pressed',
  secondary: 'border border-edge-strong bg-card text-fg hover:bg-subtle active:bg-fill',
  ghost: 'text-fg-link hover:bg-subtle active:bg-fill',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800',
}

const sizes = {
  sm: 'h-control-sm px-3 type-strong-m',
  md: 'h-control px-4 type-strong-m',
  lg: 'h-control-lg px-5 type-strong-m',
}

const pt = computed(() => ({
  root: {
    class: [
      'inline-flex cursor-pointer items-center justify-center gap-2 rounded-control whitespace-nowrap transition-colors',
      'focus-visible:shadow-focus focus-visible:outline-none',
      'disabled:cursor-not-allowed disabled:opacity-50',
      variants[props.variant],
      sizes[props.size],
      { 'w-full': props.block },
    ],
  },
  loadingIcon: { class: 'size-4 animate-spin' },
}))
</script>

<!-- The app's button (FE-016): PrimeVue Button, unstyled, dressed in the FE-015 tokens. -->
<template>
  <Button
    :type="type"
    :label="label"
    :loading="loading"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    :pt="pt"
  >
    <template v-if="$slots.default" #default>
      <slot />
    </template>
  </Button>
</template>
