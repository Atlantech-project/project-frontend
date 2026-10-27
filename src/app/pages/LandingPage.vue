<script setup>
import { useI18n } from 'vue-i18n'
import AtlantechLogo from '@/brand/AtlantechLogo.vue'
import AtlIcon from '@/components/AtlIcon.vue'
import AtlWave from '@/components/AtlWave.vue'

const { t } = useI18n()

const features = [
  { key: 'requests', icon: 'ship' },
  { key: 'windows', icon: 'window' },
  { key: 'recommendations', icon: 'spark' },
  { key: 'resources', icon: 'anchor' },
  { key: 'yard', icon: 'grid' },
  { key: 'tracking', icon: 'pulse' },
]
const steps = ['request', 'window', 'recommend', 'execute']
const checkpoints = ['window', 'recommend']
const roles = ['authority', 'pilotage', 'tugs', 'terminal', 'safety', 'admin']

// Sample rows for the hero preview card (illustration only, not live data).
const preview = [
  { vessel: 'MSC Aurora', place: 'B-03', status: 'berthing', tone: 'bg-teal' },
  { vessel: 'Nile Star', place: 'Channel', status: 'pilot', tone: 'bg-gold' },
  { vessel: 'Delta Trader', place: 'Anchorage', status: 'waiting', tone: 'bg-teal-light' },
]
</script>

<!-- Public landing page. The sign-in button arrives with P-16 (web login). -->
<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-navy text-offwhite">
      <div class="atl-glow" aria-hidden="true" />
      <div
        class="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-28 md:grid-cols-[1.1fr_0.9fr] md:pt-24"
      >
        <div class="grid gap-6">
          <span
            class="w-fit rounded-full border border-gold/50 px-3 py-1 text-xs font-semibold tracking-wide text-gold uppercase"
          >
            {{ t('landing.eyebrow') }}
          </span>
          <h1 class="font-display text-4xl leading-tight font-semibold sm:text-5xl">
            {{ t('landing.title') }}
          </h1>
          <p class="max-w-xl text-lg text-offwhite/80">{{ t('landing.body') }}</p>
          <div class="flex flex-wrap gap-3">
            <a
              href="#how"
              class="inline-flex items-center gap-2 rounded-[var(--atl-radius-sm)] bg-gold px-5 py-3 font-semibold text-navy transition hover:brightness-110"
            >
              {{ t('landing.ctaHow') }}
              <AtlIcon name="arrow" :size="18" />
            </a>
            <a
              href="#features"
              class="rounded-[var(--atl-radius-sm)] border border-offwhite/30 px-5 py-3 font-semibold transition hover:bg-offwhite/10"
            >
              {{ t('landing.ctaFeatures') }}
            </a>
          </div>
          <p class="text-sm text-teal-light">{{ t('landing.tagline') }}</p>
        </div>

        <!-- Preview card -->
        <div class="atl-float relative">
          <div
            class="rounded-[var(--atl-radius-lg)] border border-offwhite/15 bg-offwhite/5 p-5 pb-14 shadow-2xl backdrop-blur"
          >
            <div class="mb-4 flex items-center justify-between">
              <span class="font-display font-semibold">{{ t('landing.preview.title') }}</span>
              <span class="flex items-center gap-2 text-xs text-teal-light">
                <span class="atl-live-dot" aria-hidden="true" />
                {{ t('landing.preview.live') }}
              </span>
            </div>
            <ul class="grid gap-3">
              <li
                v-for="row in preview"
                :key="row.vessel"
                class="flex items-center gap-3 rounded-[var(--atl-radius-sm)] bg-offwhite/5 px-3 py-2.5"
              >
                <AtlIcon name="ship" :size="20" class="text-teal-light" />
                <div class="min-w-0 flex-1">
                  <p class="truncate font-semibold">{{ row.vessel }}</p>
                  <p class="text-xs text-offwhite/60">{{ row.place }}</p>
                </div>
                <span
                  class="rounded-full px-2.5 py-0.5 text-xs font-semibold text-navy"
                  :class="row.tone"
                >
                  {{ t(`landing.preview.status.${row.status}`) }}
                </span>
              </li>
            </ul>
          </div>
          <div
            class="absolute -bottom-6 start-6 flex items-center gap-3 rounded-[var(--atl-radius)] bg-offwhite px-4 py-3 text-navy shadow-xl"
          >
            <span class="grid size-9 place-items-center rounded-full bg-gold/20 text-gold">
              <AtlIcon name="spark" :size="20" />
            </span>
            <div>
              <p class="text-sm font-semibold">{{ t('landing.preview.toastTitle') }}</p>
              <p class="text-xs text-navy/70">{{ t('landing.preview.toastBody') }}</p>
            </div>
          </div>
        </div>
      </div>
      <AtlWave animated base="var(--atl-bg)" class="absolute inset-x-0 bottom-0 h-14" />
    </section>

    <!-- Features -->
    <section id="features" class="scroll-mt-4 bg-bg px-4 py-20">
      <div class="mx-auto max-w-6xl">
        <h2 class="font-display text-3xl font-semibold text-text">
          {{ t('landing.features.title') }}
        </h2>
        <p class="mt-2 max-w-2xl text-muted">{{ t('landing.features.body') }}</p>
        <ul class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <li
            v-for="f in features"
            :key="f.key"
            class="group rounded-[var(--atl-radius)] border border-line bg-surface p-6 transition hover:-translate-y-1 hover:border-teal hover:shadow-lg"
          >
            <span
              class="grid size-11 place-items-center rounded-[var(--atl-radius-sm)] bg-primary-soft text-teal transition group-hover:bg-teal group-hover:text-offwhite"
            >
              <AtlIcon :name="f.icon" />
            </span>
            <h3 class="mt-4 font-display text-lg font-semibold text-text">
              {{ t(`landing.features.items.${f.key}.title`) }}
            </h3>
            <p class="mt-1 text-muted">{{ t(`landing.features.items.${f.key}.body`) }}</p>
          </li>
        </ul>
      </div>
    </section>

    <!-- How it works -->
    <section id="how" class="scroll-mt-4 bg-surface-2 px-4 py-20">
      <div class="mx-auto max-w-6xl">
        <h2 class="font-display text-3xl font-semibold text-text">{{ t('landing.how.title') }}</h2>
        <p class="mt-2 max-w-2xl text-muted">{{ t('landing.how.body') }}</p>
        <ol class="mt-10 grid gap-5 md:grid-cols-4">
          <li
            v-for="(step, i) in steps"
            :key="step"
            class="relative rounded-[var(--atl-radius)] border border-line bg-surface p-6"
          >
            <span
              class="grid size-10 place-items-center rounded-full bg-navy font-display font-semibold text-offwhite"
            >
              {{ i + 1 }}
            </span>
            <h3 class="mt-4 font-display font-semibold text-text">
              {{ t(`landing.how.steps.${step}.title`) }}
            </h3>
            <p class="mt-1 text-sm text-muted">{{ t(`landing.how.steps.${step}.body`) }}</p>
            <span
              v-if="checkpoints.includes(step)"
              class="mt-3 inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-accent-text"
            >
              <AtlIcon name="shield" :size="14" />
              {{ t('landing.how.checkpoint') }}
            </span>
          </li>
        </ol>
      </div>
    </section>

    <!-- Who it's for -->
    <section class="bg-bg px-4 py-20">
      <div class="mx-auto max-w-6xl text-center">
        <h2 class="font-display text-3xl font-semibold text-text">
          {{ t('landing.roles.title') }}
        </h2>
        <p class="mx-auto mt-2 max-w-2xl text-muted">{{ t('landing.roles.body') }}</p>
        <ul class="mt-8 flex flex-wrap justify-center gap-3">
          <li
            v-for="role in roles"
            :key="role"
            class="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-text"
          >
            <AtlIcon name="check" :size="16" class="text-teal" />
            {{ t(`landing.roles.items.${role}`) }}
          </li>
        </ul>
      </div>
    </section>

    <!-- Footer -->
    <footer class="relative bg-navy px-4 pt-20 pb-10 text-offwhite">
      <AtlWave class="absolute inset-x-0 top-0 h-10 rotate-180" />
      <div
        class="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-start"
      >
        <AtlantechLogo shape="wordmark" tone="reversed" :height="32" />
        <p class="text-sm text-offwhite/70">{{ t('landing.footer') }}</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.atl-glow {
  position: absolute;
  inset: -20% -10% auto auto;
  width: 60%;
  aspect-ratio: 1;
  background: radial-gradient(circle, rgb(64 126 140 / 0.35), transparent 65%);
  pointer-events: none;
}

.atl-float {
  animation: atl-float 6s ease-in-out infinite;
}

.atl-live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--atl-success);
  box-shadow: 0 0 0 0 rgb(46 160 67 / 0.6);
  animation: atl-ping 1.8s ease-out infinite;
}

@keyframes atl-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes atl-ping {
  to {
    box-shadow: 0 0 0 8px rgb(46 160 67 / 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .atl-float,
  .atl-live-dot {
    animation: none;
  }
}
</style>
