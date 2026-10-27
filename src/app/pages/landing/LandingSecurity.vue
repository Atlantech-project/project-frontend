<script setup>
import { useI18n } from 'vue-i18n'
import AtlIcon from '@/components/AtlIcon.vue'

const { t } = useI18n()

const points = [
  { key: 'server', icon: 'server' },
  { key: 'data', icon: 'lock' },
  { key: 'learning', icon: 'refresh' },
  { key: 'scale', icon: 'grid' },
]
// Reference port figures (Master Context, section 4).
const facts = [
  { key: 'terminals', value: '8' },
  { key: 'berths', value: '36' },
  { key: 'calls', value: '~26' },
]
</script>

<template>
  <section id="security" class="scroll-mt-16 bg-teal-light px-4 py-24 text-navy sm:py-28">
    <div class="mx-auto max-w-6xl">
      <div class="max-w-3xl">
        <h2 class="font-display text-3xl leading-tight font-semibold tracking-tight sm:text-5xl">
          {{ t('landing.security.title') }}
        </h2>
        <p class="mt-4 text-lg text-navy">{{ t('landing.security.body') }}</p>
      </div>

      <ul class="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2">
        <li v-for="p in points" :key="p.key" class="flex gap-4">
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
        class="mt-14 grid gap-6 rounded-[var(--atl-radius-lg)] bg-navy p-7 text-offwhite md:grid-cols-[1.2fr_2fr] md:items-center"
      >
        <p class="font-display text-lg font-semibold">{{ t('landing.security.reference') }}</p>
        <dl class="grid grid-cols-3 gap-3">
          <div
            v-for="f in facts"
            :key="f.key"
            class="rounded-[var(--atl-radius)] bg-offwhite/10 px-4 py-3"
          >
            <dt class="sr-only">{{ t(`landing.security.facts.${f.key}`) }}</dt>
            <dd class="font-display text-3xl font-semibold text-gold">
              <bdi dir="ltr">{{ f.value }}</bdi>
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
