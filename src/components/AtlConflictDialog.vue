<script setup>
import { useI18n } from 'vue-i18n'
import AtlButton from '@/components/ui/AtlButton.vue'
import AtlDialog from '@/components/ui/AtlDialog.vue'

defineProps({
  /** what changed, e.g. "user"; the title then reads "This user was changed by someone else" */
  subject: { type: String, default: '' },
  reloading: { type: Boolean, default: false },
})
const emit = defineEmits(['reload', 'cancel'])
const visible = defineModel('visible', { type: Boolean, default: false })

const { t } = useI18n()

function cancel() {
  visible.value = false
  emit('cancel')
}
</script>

<!-- "Record changed" (409) dialog (FE-032), Figma "P-24 / User Details / Record changed (409)".
     The record's summary goes in the default slot. Nothing was saved: Reload loads the latest
     version, Cancel keeps the user's edits on screen. -->
<template>
  <AtlDialog
    v-model:visible="visible"
    :title="subject ? t('conflict.titleFor', { subject }) : t('conflict.title')"
    :closable="false"
  >
    <div v-if="$slots.default" class="border border-edge bg-subtle px-3 py-2.5 type-strong-m">
      <slot />
    </div>
    <p>{{ t('conflict.body') }}</p>
    <template #footer>
      <AtlButton variant="secondary" :label="t('conflict.cancel')" @click="cancel" />
      <AtlButton :label="t('conflict.reload')" :loading="reloading" @click="emit('reload')" />
    </template>
  </AtlDialog>
</template>
