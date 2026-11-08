<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AtlAlert from '@/components/ui/AtlAlert.vue'
import AtlButton from '@/components/ui/AtlButton.vue'
import AtlInput from '@/components/ui/AtlInput.vue'
import AtlPasswordInput from '@/components/ui/AtlPasswordInput.vue'
import { useSessionStore } from '@/stores/session'
import AuthLayout from './AuthLayout.vue'
import { isProblem, loginMessage } from './loginMessages'
import { safeRedirect } from './redirect'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const session = useSessionStore()

const form = reactive({ username: '', password: '' })
const fieldErrors = reactive({ username: '', password: '' })
const submitting = ref(false)
const error = ref(null)

const message = computed(() =>
  loginMessage({ error: error.value, endedReason: session.endedReason }),
)

function validate() {
  fieldErrors.username = form.username.trim() ? '' : t('login.required.username')
  fieldErrors.password = form.password ? '' : t('login.required.password')
  return !fieldErrors.username && !fieldErrors.password
}

async function submit() {
  error.value = null
  if (!validate()) return
  submitting.value = true
  try {
    await session.login({ username: form.username.trim(), password: form.password })
    // First sign-in: a new password comes before any other page (FE-026).
    if (session.mustChangePassword) {
      await router.replace({ name: 'change-password', query: route.query })
    } else {
      await router.replace(safeRedirect(route.query.redirect))
    }
  } catch (e) {
    error.value = e
    form.password = ''
  } finally {
    submitting.value = false
  }
}
</script>

<!-- P-16 Port Login (FE-025). Figma: "P-16 / Port Login / *". -->
<template>
  <AuthLayout v-slot="{ portName }" :title="t('login.title')" :subtitle="t('login.subtitle')">
    <form class="flex flex-col gap-5" novalidate @submit.prevent="submit">
      <AtlInput
        v-model="form.username"
        :label="t('login.username')"
        :placeholder="t('login.usernamePlaceholder')"
        :error="fieldErrors.username"
        size="lg"
        name="username"
        autocomplete="username"
        autocapitalize="none"
        spellcheck="false"
        maxlength="50"
      />
      <AtlPasswordInput
        v-model="form.password"
        :label="t('login.password')"
        :placeholder="t('login.passwordPlaceholder')"
        :error="fieldErrors.password"
        size="lg"
        name="password"
        autocomplete="current-password"
        maxlength="255"
      />
      <AtlButton
        type="submit"
        size="lg"
        block
        :loading="submitting"
        :label="submitting ? t('login.signingIn') : t('login.signIn')"
      />
    </form>

    <AtlAlert
      :title="t(`login.messages.${message}.title`)"
      :live="isProblem(message) ? 'assertive' : 'polite'"
    >
      {{ t(`login.messages.${message}.body`, { port: portName || t('login.thisPort') }) }}
    </AtlAlert>
  </AuthLayout>
</template>
