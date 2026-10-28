<script setup>
import { useI18n } from 'vue-i18n'
import AtlIcon from '@/components/AtlIcon.vue'
import { contact, phoneHref } from './contact'
import LandingSocials from './LandingSocials.vue'
import { vReveal } from './reveal'

const { t } = useI18n()

const channels = [
  { key: 'email', icon: 'mail', value: contact.email, href: `mailto:${contact.email}` },
  {
    key: 'phone',
    icon: 'phone',
    value: contact.phone,
    href: phoneHref,
  },
]
</script>

<!-- How to reach the team: email, phone and social accounts. -->
<template>
  <section id="contact" class="scroll-mt-16 bg-surface px-4 py-24 sm:py-28">
    <div class="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <h2
          v-reveal:line
          class="font-display text-3xl leading-tight font-semibold tracking-tight text-text sm:text-5xl"
        >
          {{ t('landing.contact.title') }}
        </h2>
        <p v-reveal="1" class="mt-5 max-w-md text-lg leading-relaxed text-text">
          {{ t('landing.contact.body') }}
        </p>
        <a
          v-reveal="2"
          :href="`mailto:${contact.email}`"
          class="mt-8 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 font-semibold text-offwhite transition-colors hover:bg-teal"
        >
          <AtlIcon name="mail" :size="18" />
          {{ t('landing.contact.cta') }}
        </a>
      </div>

      <div class="grid gap-4">
        <a
          v-for="(c, i) in channels"
          :key="c.key"
          v-reveal="i"
          :href="c.href"
          class="atl-lift group flex items-center gap-5 rounded-[var(--atl-radius-lg)] bg-bg p-6"
        >
          <span
            class="grid size-14 shrink-0 place-items-center rounded-full bg-gold text-navy transition-colors duration-300 group-hover:bg-navy group-hover:text-gold"
          >
            <AtlIcon :name="c.icon" :size="24" />
          </span>
          <span>
            <span class="block text-sm text-muted">{{ t(`landing.contact.${c.key}`) }}</span>
            <span class="block font-display text-xl font-semibold text-text">
              <bdi dir="ltr">{{ c.value }}</bdi>
            </span>
          </span>
        </a>
        <div v-reveal="2" class="rounded-[var(--atl-radius-lg)] bg-bg p-6">
          <p class="mb-4 text-sm text-muted">{{ t('landing.contact.follow') }}</p>
          <LandingSocials tone="dark" />
        </div>
      </div>
    </div>
  </section>
</template>
