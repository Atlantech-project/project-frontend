<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AtlantechLogo from '@/brand/AtlantechLogo.vue'
import AtlIcon from '@/components/AtlIcon.vue'
import { vSpotlight } from './glass'
import { vReveal } from './reveal'

const { t } = useI18n()

const roles = [
  { key: 'authority', icon: 'shield' },
  { key: 'pilotage', icon: 'ship' },
  { key: 'tugs', icon: 'anchor' },
  { key: 'terminal', icon: 'grid' },
  { key: 'safety', icon: 'pulse' },
  { key: 'admin', icon: 'window' },
]

// The six roles sit evenly round the logo, starting at the top. Positions are in % of the ring.
const nodes = roles.map((role, i) => {
  const angle = (i / roles.length) * Math.PI * 2 - Math.PI / 2
  return { ...role, x: 50 + 40 * Math.cos(angle), y: 50 + 40 * Math.sin(angle) }
})

// One role at a time is lit: the one under the pointer, or each in turn.
const active = ref(0)
const hovered = ref(null)
const ring = ref(null)
let timer = 0
let observer = null

function cycle() {
  if (hovered.value === null) active.value = (active.value + 1) % roles.length
}

onMounted(() => {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduced || typeof IntersectionObserver === 'undefined') return
  observer = new IntersectionObserver(([entry]) => {
    clearInterval(timer)
    if (entry.isIntersecting) timer = setInterval(cycle, 2400)
  })
  observer.observe(ring.value)
})

onBeforeUnmount(() => {
  clearInterval(timer)
  observer?.disconnect()
})

const lit = (i) => (hovered.value ?? active.value) === i
</script>

<template>
  <section id="roles" class="scroll-mt-16 overflow-hidden bg-navy px-4 py-24 text-offwhite">
    <div class="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.3fr] lg:items-center">
      <div>
        <h2
          v-reveal
          class="font-display text-3xl leading-tight font-semibold tracking-tight sm:text-4xl"
        >
          {{ t('landing.roles.title') }}
        </h2>
        <p v-reveal="1" class="mt-3 text-lg text-offwhite/90">{{ t('landing.roles.body') }}</p>
      </div>

      <!-- Small screens: a plain list. -->
      <ul class="grid gap-3 sm:hidden">
        <li
          v-for="(role, i) in roles"
          :key="role.key"
          v-reveal="i"
          class="atl-glass flex items-center gap-4 rounded-[var(--atl-radius)] px-5 py-4 text-lg"
        >
          <span class="grid size-10 shrink-0 place-items-center rounded-full bg-gold text-navy">
            <AtlIcon :name="role.icon" :size="20" />
          </span>
          {{ t(`landing.roles.items.${role.key}`) }}
        </li>
      </ul>

      <!-- Larger screens: every role connected to the one shared picture in the middle. -->
      <div
        ref="ring"
        v-reveal="1"
        class="atl-ring relative mx-auto hidden aspect-square w-full max-w-[560px] sm:block"
      >
        <svg class="absolute inset-0 size-full" viewBox="0 0 100 100" aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="var(--atl-light-teal)"
            stroke-opacity="0.14"
            stroke-width="0.3"
            stroke-dasharray="1 1.4"
          />
        </svg>

        <div
          class="atl-glass absolute top-1/2 left-1/2 grid size-[30%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
        >
          <AtlantechLogo shape="symbol" tone="reversed" height="46%" />
        </div>

        <ul>
          <li
            v-for="(n, i) in nodes"
            :key="n.key"
            class="absolute -translate-x-1/2 -translate-y-1/2"
            :style="{ left: `${n.x}%`, top: `${n.y}%` }"
          >
            <button
              v-spotlight
              type="button"
              class="atl-glass atl-ring__node flex items-center gap-3 rounded-full py-2 ps-2 pe-4 text-[15px] font-medium whitespace-nowrap transition-[box-shadow,border-color] duration-500"
              :class="{ 'is-lit': lit(i) }"
              @pointerenter="hovered = i"
              @pointerleave="hovered = null"
              @focus="hovered = i"
              @blur="hovered = null"
            >
              <span class="grid size-9 shrink-0 place-items-center rounded-full bg-gold text-navy">
                <AtlIcon :name="n.icon" :size="18" />
              </span>
              {{ t(`landing.roles.items.${n.key}`) }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.atl-ring__node.is-lit {
  border-color: rgb(165 141 102 / 0.8);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.4),
    0 0 0 4px rgb(165 141 102 / 0.18),
    0 24px 48px -28px rgb(4 31 43 / 0.7);
}
</style>
