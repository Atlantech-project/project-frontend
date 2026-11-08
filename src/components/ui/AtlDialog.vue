<script setup>
import Dialog from 'primevue/dialog'

defineProps({
  title: { type: String, required: true },
  /** Esc and the close button; off for dialogs that need an explicit choice */
  closable: { type: Boolean, default: true },
})

const visible = defineModel('visible', { type: Boolean, default: false })

const pt = {
  mask: { class: 'bg-overlay/33 p-4' },
  root: {
    class:
      'flex w-full max-w-[560px] flex-col gap-5 rounded-card border border-edge bg-card p-6 text-fg shadow-dialog',
  },
  header: { class: 'flex items-start justify-between gap-4' },
  title: { class: 'type-h3 text-fg' },
  content: { class: 'flex flex-col gap-4 type-body-m text-fg' },
  footer: { class: 'flex justify-end gap-3' },
}
</script>

<!-- Modal dialog (FE-032): PrimeVue Dialog, unstyled, on the brand tokens. Body in the default
     slot, buttons in #footer. -->
<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="title"
    :closable="false"
    :close-on-escape="closable"
    :draggable="false"
    :pt="pt"
  >
    <slot />
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </Dialog>
</template>
