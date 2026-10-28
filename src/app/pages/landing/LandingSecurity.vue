<script setup>
import { useI18n } from 'vue-i18n'
import AtlIcon from '@/components/AtlIcon.vue'
import CountUp from './CountUp.vue'
import { vSpotlight, vTilt } from './glass'
import { vReveal } from './reveal'
import SecurityMap from './SecurityMap.vue'

const { t } = useI18n()

const points = [
  { key: 'server', icon: 'server' },
  { key: 'data', icon: 'lock' },
  { key: 'learning', icon: 'refresh' },
  { key: 'scale', icon: 'grid' },
]
// Reference port figures (Master Context, section 4).
const facts = [
  { key: 'terminals', value: 8 },
  { key: 'berths', value: 36 },
  { key: 'calls', value: 26, prefix: '~' },
]
</script>

<template>
  <section id="security" class="scroll-mt-16 bg-teal-light px-4 py-24 text-navy sm:py-28">
    <div class="mx-auto max-w-6xl">
      <div class="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div class="max-w-xl">
          <h2
            v-reveal
            class="font-display text-3xl leading-tight font-semibold tracking-tight sm:text-5xl"
          >
            {{ t('landing.security.title') }}
          </h2>
          <p v-reveal="1" class="mt-4 text-lg text-navy">{{ t('landing.security.body') }}</p>
        </div>
        <SecurityMap v-reveal="2" class="mx-auto max-w-[520px]" />
      </div>

      <ul class="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2">
        <li v-for="(p, i) in points" :key="p.key" v-reveal="i % 2" class="flex gap-4">
          <span
            class="grid size-12 shrink-0 place-items-center rounded-full bg-navy text-teal-light"
          >
            <AtlIcon :name="p.icon" :size="22" />
          </span>
          <div>
            <h3 class="font-display text-xl font-semibold">
              {{ t(`landing.security.items.${p.key}.title`) }}
            </h3>
            <p class="mt-1.5 leading-relaxed text-navy">
              {{ t(`landing.security.items.${p.key}.body`) }}
            </p>
          </div>
        </li>
      </ul>

      <div
        v-reveal
        v-spotlight
        v-tilt
        class="mt-14 grid gap-6 rounded-[var(--atl-radius-lg)] bg-navy p-7 text-offwhite md:grid-cols-[1.2fr_2fr] md:items-center"
      >
        <p class="font-display text-lg font-semibold">{{ t('landing.security.reference') }}</p>
        <dl class="grid grid-cols-3 gap-3">
          <div
            v-for="(f, i) in facts"
            :key="f.key"
            v-reveal="2 + i"
            class="rounded-[var(--atl-radius)] bg-offwhite/10 px-4 py-3"
          >
            <dt class="sr-only">{{ t(`landing.security.facts.${f.key}`) }}</dt>
            <dd class="font-display text-3xl font-semibold text-gold">
              <bdi dir="ltr"
                ><CountUp :value="f.value" :prefix="f.prefix" :delay="300 + i * 120"
              /></bdi>
            </dd>
            <dd class="mt-1 text-sm text-offwhite/75" aria-hidden="true">
              {{ t(`landing.security.facts.${f.key}`) }}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>
