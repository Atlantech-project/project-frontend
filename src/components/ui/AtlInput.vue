<script setup>
import { computed, useId } from 'vue'
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

// Other attributes (type, autocomplete, placeholder, disabled ...) go to the <input>.
defineOptions({ inheritAttrs: false })

const model = defineModel({ type: String, default: '' })
const autoId = useId()
const inputId = computed(() => props.id || autoId)
const pt = computed(() => ({
  root: { class: inputClasses({ size: props.size, invalid: !!props.error }) },
}))
</script>

<!-- Text input with its label and help/error text (FE-016): PrimeVue InputText, unstyled. -->
<template>
  <AtlField :id="inputId" :label="label" :hint="hint" :error="error">
    <InputText
      :id="inputId"
      v-model="model"
      v-bind="$attrs"
      :invalid="!!error"
      :aria-invalid="!!error || undefined"
      :aria-describedby="describedBy(inputId, { error, hint })"
      :pt="pt"
    />
  </AtlField>
</template>
