<script setup>
import { computed, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import InputText from 'primevue/inputtext'
import AtlField from './AtlField.vue'
import { describedBy, inputClasses } from './inputClasses'

const props = defineProps({
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  id: { type: String, default: '' },
  size: { type: String, default: 'md', validator: (v) => ['md', 'lg'].includes(v) },
})

defineOptions({ inheritAttrs: false })

const model = defineModel({ type: String, default: '' })
const { t } = useI18n()
const autoId = useId()
const inputId = computed(() => props.id || autoId)
const visible = ref(false)
const pt = computed(() => ({
  root: { class: [inputClasses({ size: props.size, invalid: !!props.error }), 'pe-12'] },
}))
</script>

<!-- Password input with a show/hide button (FE-016). The button is a real <button>, so it works
     from the keyboard and tells screen readers what it does. -->
<template>
  <AtlField :id="inputId" :label="label" :hint="hint" :error="error">
    <div class="relative w-full">
      <InputText
        :id="inputId"
        v-model="model"
        v-bind="$attrs"
        :type="visible ? 'text' : 'password'"
        :invalid="!!error"
        :aria-invalid="!!error || undefined"
        :aria-describedby="describedBy(inputId, { error, hint })"
        :pt="pt"
      />
      <button
        type="button"
        class="absolute inset-y-0 end-0 grid w-12 cursor-pointer place-items-center rounded-e-control text-fg-muted hover:text-fg focus-visible:shadow-focus focus-visible:outline-none"
        :aria-label="visible ? t('form.hidePassword') : t('form.showPassword')"
        :aria-pressed="visible"
        :aria-controls="inputId"
        @click="visible = !visible"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
          <path v-if="visible" d="M3 3l18 18" />
        </svg>
      </button>
    </div>
  </AtlField>
</template>
