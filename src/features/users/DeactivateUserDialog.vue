<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/components/AppIcon.vue'
import AtlButton from '@/components/ui/AtlButton.vue'
import AtlDialog from '@/components/ui/AtlDialog.vue'
import { useUserLabels } from './useUserLabels'

const props = defineProps({
  /** the user to deactivate (port-api.yaml User) */
  user: { type: Object, default: null },
  /** the server refused (409 CONFLICT): yourself or the last active Port Admin */
  refused: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
})
const emit = defineEmits(['confirm'])
const visible = defineModel('visible', { type: Boolean, default: false })

const { t } = useI18n()
const labels = useUserLabels()
const title = computed(() =>
  t(props.refused ? 'users.deactivate.refusedTitle' : 'users.deactivate.title'),
)
</script>

<!-- Figma "P-23 / User Management / Deactivate confirmation" and "P-24 / User Details /
     Cannot deactivate yourself · last Port Admin": the user's summary, then the question or the
     reason it was refused. -->
<template>
  <AtlDialog v-model:visible="visible" :title="title" :closable="!busy">
    <div v-if="user" class="flex flex-col border border-edge bg-subtle px-3 py-2.5 type-strong-m">
      <span>{{ user.name }} · {{ user.username }}</span>
      <span>{{ labels.roleLine(user) }}</span>
    </div>
    <p v-if="refused">{{ t('users.deactivate.refusedBody') }}</p>
    <p v-else-if="user">{{ t('users.deactivate.body', { name: user.name }) }}</p>
    <template #footer>
      <AtlButton
        variant="secondary"
        :label="t(refused ? 'users.deactivate.close' : 'users.deactivate.cancel')"
        :disabled="busy"
        @click="visible = false"
      />
      <AtlButton v-if="!refused" :loading="busy" @click="emit('confirm')">
        <AppIcon name="ban" />
        {{ t('users.deactivate.confirm') }}
      </AtlButton>
    </template>
  </AtlDialog>
</template>
