<script setup>
import { useI18n } from 'vue-i18n'
import AtlantechLogo from '@/brand/AtlantechLogo.vue'
import { usePortName } from '@/app/useSystemInfo'
import background from '@/assets/images/port-login-bg.webp'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})

const { t } = useI18n()

const portName = usePortName()
</script>

<!-- Frame shared by the P-16 sign-in states (Figma "P-16 / Port Login / *"): port photo, white card
     with the logo, title, current port and the deployment note. The page content goes in the
     default slot and receives `portName`. -->
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
      aria-labelledby="auth-title"
    >
      <header class="flex flex-col items-center gap-2 text-center">
        <AtlantechLogo :height="103" :card-on-dark="false" />
        <h1 id="auth-title" class="type-h1 text-fg">{{ title }}</h1>
        <p v-if="subtitle" class="type-body-m text-fg-muted">{{ subtitle }}</p>
        <div v-if="portName" class="flex w-full flex-col gap-0.5 bg-subtle px-3 py-2.5 text-start">
          <span class="type-caption text-fg-muted">{{ t('login.currentPort') }}</span>
          <span class="type-strong-m text-fg">{{ portName }}</span>
        </div>
      </header>

      <slot :port-name="portName" />

      <footer class="flex flex-col gap-2">
        <hr class="border-edge" />
        <p class="type-caption text-fg-muted">
          {{ portName ? t('login.deployment', { port: portName }) : t('login.deploymentGeneric') }}
        </p>
      </footer>
    </section>
  </main>
</template>
