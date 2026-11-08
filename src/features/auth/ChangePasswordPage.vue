<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AtlAlert from '@/components/ui/AtlAlert.vue'
import AtlButton from '@/components/ui/AtlButton.vue'
import AtlPasswordInput from '@/components/ui/AtlPasswordInput.vue'
import { fieldMessages } from '@/api/errors'
import { useSessionStore } from '@/stores/session'
import AuthLayout from './AuthLayout.vue'
import { MIN_PASSWORD_LENGTH, isStrongEnough } from './passwordRules'
import { safeRedirect } from './redirect'

const i18n = useI18n()
const { t } = i18n
const route = useRoute()
const router = useRouter()
const session = useSessionStore()

const form = reactive({ current: '', password: '', confirmation: '' })
const fieldErrors = reactive({ current: '', password: '', confirmation: '' })
const submitting = ref(false)
// Which message shows under the button: firstLogin (default), mismatch, or an API problem.
const message = ref('firstLogin')
// The temporary password from this sign-in is in memory, unless the page was reloaded.
const askCurrent = ref(!session.hasTemporaryPassword())

const PROBLEMS = {
  TOO_MANY_ATTEMPTS: 'tooManyAttempts',
  NETWORK_ERROR: 'network',
  SERVICE_UNAVAILABLE: 'unavailable',
}
const isProblem = computed(() => message.value !== 'firstLogin')

// Only a signed-in user who must change the password belongs here (FE-021 will guard this too).
onMounted(async () => {
  await session.restore().catch(() => {})
  if (!session.isSignedIn) await router.replace({ name: 'login', query: route.query })
  else if (!session.mustChangePassword) await router.replace(safeRedirect(route.query.redirect))
})

function validate() {
  fieldErrors.current =
    askCurrent.value && !form.current ? t('changePassword.required.current') : ''
  fieldErrors.password = isStrongEnough(form.password) ? '' : t('validation.password')
  fieldErrors.confirmation = ''
  if (fieldErrors.current || fieldErrors.password) return false
  if (form.password !== form.confirmation) {
    message.value = 'mismatch'
    return false
  }
  return true
}

// 422 from the API: put each rule on its field (current_password, new_password).
function showFieldErrors(error) {
  const byField = fieldMessages(error, i18n)
  if (byField.current_password) {
    // The kept temporary password no longer works: ask for it.
    session.forgetTemporaryPassword()
    askCurrent.value = true
    fieldErrors.current = byField.current_password
  }
  if (byField.new_password) fieldErrors.password = byField.new_password
  if (byField.new_password_confirmation)
    fieldErrors.confirmation = byField.new_password_confirmation
}

async function submit() {
  message.value = 'firstLogin'
  if (!validate()) return
  submitting.value = true
  try {
    await session.changePassword({
      ...(askCurrent.value ? { currentPassword: form.current } : {}),
      newPassword: form.password,
      confirmation: form.confirmation,
    })
    await router.replace(safeRedirect(route.query.redirect))
  } catch (error) {
    if (error.isValidation) showFieldErrors(error)
    else if (error.status === 401 || error.status === 419)
      await router.replace({ name: 'login', query: route.query })
    else message.value = PROBLEMS[error.code] ?? 'generic'
  } finally {
    submitting.value = false
  }
}
</script>

<!-- P-16 first sign-in: set a new password (FE-026). Figma: "P-16 / Port Login / First login · *". -->
<template>
  <AuthLayout :title="t('changePassword.title')" :subtitle="t('changePassword.subtitle')">
    <form class="flex flex-col gap-5" novalidate @submit.prevent="submit">
      <AtlPasswordInput
        v-if="askCurrent"
        v-model="form.current"
        :label="t('changePassword.current')"
        :placeholder="t('changePassword.currentPlaceholder')"
        :error="fieldErrors.current"
        size="lg"
        name="current-password"
        autocomplete="current-password"
        maxlength="255"
      />
      <AtlPasswordInput
        v-model="form.password"
        :label="t('changePassword.new')"
        :placeholder="t('changePassword.newPlaceholder', { min: MIN_PASSWORD_LENGTH })"
        :error="fieldErrors.password"
        size="lg"
        name="new-password"
        autocomplete="new-password"
        maxlength="255"
      />
      <AtlPasswordInput
        v-model="form.confirmation"
        :label="t('changePassword.confirm')"
        :placeholder="t('changePassword.confirmPlaceholder')"
        :error="fieldErrors.confirmation"
        size="lg"
        name="confirm-password"
        autocomplete="new-password"
        maxlength="255"
      />
      <AtlButton
        type="submit"
        size="lg"
        block
        :loading="submitting"
        :label="submitting ? t('changePassword.saving') : t('changePassword.save')"
      />
    </form>

    <AtlAlert
      :title="t(`changePassword.messages.${message}.title`)"
      :live="isProblem ? 'assertive' : 'polite'"
    >
      {{ t(`changePassword.messages.${message}.body`, { min: MIN_PASSWORD_LENGTH }) }}
    </AtlAlert>
  </AuthLayout>
</template>
