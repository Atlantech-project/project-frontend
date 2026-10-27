<script setup>
import { useI18n } from 'vue-i18n'
import AtlIcon from '@/components/AtlIcon.vue'
import { vReveal } from '@/composables/reveal'

const { t } = useI18n()

const roles = [
  { key: 'authority', icon: 'shield' },
  { key: 'pilotage', icon: 'ship' },
  { key: 'tugs', icon: 'anchor' },
  { key: 'terminal', icon: 'grid' },
  { key: 'safety', icon: 'pulse' },
  { key: 'admin', icon: 'window' },
]
// Two rows drifting in opposite directions; each holds the list twice so the loop is seamless.
const rows = [roles, [...roles.slice(3), ...roles.slice(0, 3)]]
</script>

<template>
  <section class="overflow-hidden bg-bg py-24 sm:py-32">
    <div v-reveal class="mx-auto max-w-3xl px-4 text-center">
      <h2
        class="font-display text-4xl leading-tight font-semibold tracking-tight text-text sm:text-5xl"
      >
        {{ t('landing.roles.title') }}
      </h2>
      <p class="mt-4 text-lg text-muted">{{ t('landing.roles.body') }}</p>
    </div>

    <div class="atl-marquee mt-14 grid gap-4" dir="ltr">
      <div
        v-for="(row, r) in rows"
        :key="r"
        class="atl-marquee__track flex w-max gap-4"
        :class="{ 'atl-marquee__track--reverse': r === 1 }"
      >
        <span
          v-for="(role, i) in [...row, ...row]"
          :key="`${role.key}-${i}`"
          class="flex items-center gap-3 rounded-full border border-line bg-surface px-6 py-3 text-lg whitespace-nowrap text-text"
          :aria-hidden="i >= row.length || r === 1 ? 'true' : undefined"
        >
          <AtlIcon :name="role.icon" :size="20" class="text-teal" />
          {{ t(`landing.roles.items.${role.key}`) }}
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.atl-marquee {
  mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
}

.atl-marquee__track {
  animation: atl-marquee 40s linear infinite;
}

.atl-marquee__track--reverse {
  animation-direction: reverse;
  animation-duration: 46s;
}

.atl-marquee:hover .atl-marquee__track {
  animation-play-state: paused;
}

@keyframes atl-marquee {
  to {
    transform: translateX(calc(-50% - 0.5rem));
  }
}

@media (prefers-reduced-motion: reduce) {
  .atl-marquee {
    mask-image: none;
    padding-inline: 1rem;
  }
  .atl-marquee__track {
    animation: none;
    width: auto;
    flex-wrap: wrap;
    justify-content: center;
  }
  .atl-marquee__track--reverse {
    display: none;
  }
}
</style>
