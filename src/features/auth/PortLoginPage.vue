<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import AtlantechLogo from '@/brand/AtlantechLogo.vue'
import AtlAlert from '@/components/ui/AtlAlert.vue'
import AtlButton from '@/components/ui/AtlButton.vue'
import AtlInput from '@/components/ui/AtlInput.vue'
import AtlPasswordInput from '@/components/ui/AtlPasswordInput.vue'
import { fetchSystemInfo } from '@/api/system'
import { useSessionStore } from '@/stores/session'
import background from '@/assets/images/port-login-bg.webp'
import { isProblem, loginMessage } from './loginMessages'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const session = useSessionStore()

// The port this server belongs to; the page still works if it can't be loaded.
const { data: systemInfo } = useQuery({
  queryKey: ['system', 'info'],
  queryFn: fetchSystemInfo,
  staleTime: Infinity,
  retry: false,
})
const portName = computed(() => systemInfo.value?.port_name ?? '')

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

// Until the router guard (FE-021) picks the home page per role, go back where the user was headed.
function nextRoute() {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
    ? redirect
    : '/'
}

async function submit() {
  error.value = null
  if (!validate()) return
  submitting.value = true
  try {
    await session.login({ username: form.username.trim(), password: form.password })
    await router.replace(nextRoute())
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
  <main class="relative grid min-h-screen place-items-center overflow-hidden bg-inverse px-4 py-10">
    <img
      :src="background"
      alt=""
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 size-full object-cover opacity-60"
    />

    <section
      class="relative flex w-full max-w-[480px] flex-col gap-5 rounded-card border border-edge bg-card p-8 shadow-[0_16px_48px_0_rgb(0_0_0/0.28)]"
      aria-labelledby="login-title"
    >
      <header class="flex flex-col items-center gap-2 text-center">
        <AtlantechLogo :height="103" :card-on-dark="false" />
        <h1 id="login-title" class="type-h1 text-fg">{{ t('login.title') }}</h1>
        <p class="type-body-m text-fg-muted">{{ t('login.subtitle') }}</p>
        <div v-if="portName" class="flex w-full flex-col gap-0.5 bg-subtle px-3 py-2.5 text-start">
          <span class="type-caption text-fg-muted">{{ t('login.currentPort') }}</span>
          <span class="type-strong-m text-fg">{{ portName }}</span>
        </div>
      </header>

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

      <footer class="flex flex-col gap-2">
        <hr class="border-edge" />
        <p class="type-caption text-fg-muted">
          {{ portName ? t('login.deployment', { port: portName }) : t('login.deploymentGeneric') }}
        </p>
      </footer>
    </section>
  </main>
</template>
