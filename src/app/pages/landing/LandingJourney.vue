<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AtlIcon from '@/components/AtlIcon.vue'
import { range, useScrollProgress } from '@/composables/useScrollProgress'

const { t } = useI18n()
const section = ref(null)
const channel = ref(null)
const progress = useScrollProgress(section)

const steps = ['request', 'window', 'recommend', 'execute']
const checkpoints = ['window', 'recommend']
const berths = ['B-01', 'B-02', 'B-03', 'B-04', 'B-05']
const berthX = (i) => 76 + i * 66

// From the anchorage, through the gap between the breakwaters, then along the quay to B-03.
const route = 'M70 70 C 150 70, 196 100, 200 150 C 204 194, 208 222, 241 222'
// A top-down container ship, bow to the right.
const hull = 'M-24 -6 H13 Q23 -6 26 0 Q23 6 13 6 H-24 Q-26 6 -26 4 V-4 Q-26 -6 -24 -6 Z'
const palette = ['#a58d66', '#407e8c', '#2c6b78', '#8c7552']
const cargo = Array.from({ length: 12 }, (_, i) => ({
  x: -16 + (i % 6) * 5.4,
  y: i < 6 ? -4.6 : 0.6,
  fill: palette[(i * 3 + Math.floor(i / 6)) % palette.length],
}))

const active = computed(() => Math.min(steps.length - 1, Math.floor(progress.value * steps.length)))

// The ship waits at anchorage, then sails the channel and lies alongside its berth in the last step.
function pointAt(t) {
  const path = channel.value
  if (!path?.getTotalLength) return { x: 70, y: 70, angle: 0 }
  const length = path.getTotalLength()
  const a = path.getPointAtLength(length * t)
  const b = path.getPointAtLength(Math.min(length, length * t + 1))
  const angle = t >= 1 ? 0 : (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
  return { x: a.x, y: a.y, angle }
}

// The ship eases towards the scroll position instead of jumping with it.
const target = () => {
  const p = range(progress.value, 0.76, 0.99)
  return p * p * (3 - 2 * p)
}
const travelled = ref(target())
let frame = 0

function glide() {
  const gap = target() - travelled.value
  travelled.value = Math.abs(gap) < 0.0005 ? target() : travelled.value + gap * 0.035
  frame = travelled.value === target() ? 0 : requestAnimationFrame(glide)
}

watch(progress, () => {
  if (!frame) frame = requestAnimationFrame(glide)
})

onBeforeUnmount(() => cancelAnimationFrame(frame))

const sail = computed(() => pointAt(travelled.value))

// The map's status: each step's own, then sailing, then berthed once the ship is alongside.
const status = computed(() => {
  if (active.value < 3) return steps[active.value]
  return travelled.value > 0.99 ? 'berthed' : 'sailing'
})
</script>

<!-- How it works, told as one vessel call while the reader scrolls. -->
<template>
  <section id="how" ref="section" class="atl-journey relative h-[640svh] bg-bg">
    <div class="atl-journey__stage sticky top-0 flex h-svh items-center overflow-hidden pt-16">
      <div
        class="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 md:grid-cols-[0.7fr_1.3fr] md:gap-14"
      >
        <div>
          <h2
            class="font-display text-3xl leading-tight font-semibold tracking-tight text-text lg:text-5xl"
          >
            {{ t('landing.journey.title') }}
          </h2>

          <ol class="relative mt-8 grid gap-1 ps-6">
            <span class="absolute inset-y-2 start-[3px] w-0.5 rounded bg-line" aria-hidden="true" />
            <span
              class="absolute top-2 start-[3px] w-0.5 rounded bg-teal"
              :style="{ height: `calc(${progress * 100}% - 1rem)` }"
              aria-hidden="true"
            />
            <li
              v-for="(step, i) in steps"
              :key="step"
              class="relative py-2 transition-opacity duration-500"
              :class="[i === active ? 'block opacity-100' : 'hidden opacity-35 md:block']"
              :aria-current="i === active ? 'step' : undefined"
            >
              <span
                class="absolute top-[18px] -start-6 size-2 rounded-full transition"
                :class="i <= active ? 'bg-teal' : 'bg-line-strong'"
                aria-hidden="true"
              />
              <h3 class="font-display text-xl font-semibold text-text">
                {{ t(`landing.journey.steps.${step}.title`) }}
              </h3>
              <div class="atl-journey__body grid" :class="{ 'is-open': i === active }">
                <div class="overflow-hidden">
                  <p class="pt-2 text-text">{{ t(`landing.journey.steps.${step}.body`) }}</p>
                  <span
                    v-if="checkpoints.includes(step)"
                    class="mt-3 inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-sm font-semibold text-accent-text"
                  >
                    <AtlIcon name="shield" :size="14" />
                    {{ t('landing.journey.checkpoint') }}
                  </span>
                </div>
              </div>
            </li>
          </ol>
        </div>

        <div
          data-ui
          class="relative w-full max-w-[calc((100svh-8rem)*1.38)] justify-self-center overflow-hidden rounded-[var(--atl-radius-lg)] bg-navy p-3 text-offwhite sm:p-4"
        >
          <Transition name="atl-chip" mode="out-in">
            <p
              :key="status"
              class="absolute top-5 start-5 z-10 flex items-center gap-2 rounded-full bg-offwhite px-3 py-1.5 text-xs font-semibold text-navy sm:text-sm"
              aria-live="polite"
            >
              <AtlIcon
                :name="status === 'berthed' ? 'check' : 'pulse'"
                :size="16"
                class="text-teal"
              />
              {{
                status === 'berthed' || status === 'sailing'
                  ? t(`landing.journey.${status}`)
                  : t(`landing.journey.steps.${status}.status`)
              }}
            </p>
          </Transition>

          <svg class="block w-full" viewBox="0 0 400 300" direction="ltr" aria-hidden="true">
            <defs>
              <linearGradient id="atl-sea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#0d4c64" />
                <stop offset="1" stop-color="#083a4f" />
              </linearGradient>
            </defs>
            <rect width="400" height="300" fill="url(#atl-sea)" />

            <!-- Anchorage -->
            <circle
              cx="70"
              cy="70"
              r="36"
              fill="var(--atl-light-teal)"
              fill-opacity="0.06"
              stroke="var(--atl-muted-gold)"
              stroke-width="1.5"
              stroke-dasharray="4 5"
            />
            <text
              x="70"
              y="124"
              text-anchor="middle"
              font-size="12"
              font-weight="600"
              fill="currentColor"
            >
              {{ t('landing.journey.map.anchorage') }}
            </text>

            <!-- Channel: lights up once the safe window is confirmed -->
            <path
              :d="route"
              fill="none"
              stroke-width="28"
              stroke-linecap="round"
              stroke="var(--atl-light-teal)"
              class="transition-[stroke-opacity] duration-700"
              :stroke-opacity="active >= 1 ? 0.3 : 0.08"
            />
            <path
              ref="channel"
              :d="route"
              fill="none"
              stroke="var(--atl-off-white)"
              stroke-opacity="0.7"
              stroke-width="1.5"
              stroke-dasharray="5 6"
              class="atl-flow"
            />
            <text x="226" y="104" font-size="12" font-weight="600" fill="currentColor">
              {{ t('landing.journey.map.channel') }}
            </text>

            <!-- Breakwaters -->
            <path
              d="M-6 154 H164 M236 154 H406"
              stroke="var(--atl-light-teal)"
              stroke-opacity="0.45"
              stroke-width="10"
              stroke-linecap="round"
            />

            <!-- Quay and berths -->
            <rect x="0" y="238" width="400" height="62" fill="var(--atl-light-teal)" />
            <text x="16" y="276" font-size="12" font-weight="700" fill="var(--atl-deep-navy)">
              {{ t('landing.journey.map.quay') }}
            </text>
            <g v-for="(b, i) in berths" :key="b">
              <rect
                :x="berthX(i) + 2"
                y="212"
                width="60"
                height="22"
                rx="3"
                stroke-width="1.5"
                class="transition-[fill,stroke] duration-700"
                :fill="b === 'B-03' && active >= 2 ? 'var(--atl-muted-gold)' : 'none'"
                :fill-opacity="b === 'B-03' && active >= 2 ? 0.35 : 0"
                :stroke="
                  b === 'B-03' && active >= 2 ? 'var(--atl-muted-gold)' : 'var(--atl-light-teal)'
                "
                :stroke-opacity="b === 'B-03' && active >= 2 ? 1 : 0.35"
                stroke-dasharray="4 3"
              />
              <rect
                :x="berthX(i) + 6"
                y="248"
                width="52"
                height="20"
                rx="10"
                class="transition-[fill] duration-700"
                :fill="
                  b === 'B-03' && active >= 2 ? 'var(--atl-muted-gold)' : 'var(--atl-deep-navy)'
                "
                :fill-opacity="b === 'B-03' && active >= 2 ? 1 : 0.12"
              />
              <text
                :x="berthX(i) + 32"
                y="262"
                text-anchor="middle"
                font-size="11"
                font-weight="700"
                fill="var(--atl-deep-navy)"
              >
                {{ b }}
              </text>
            </g>

            <!-- Nile Star, with its tugs once they are assigned -->
            <g :transform="`translate(${sail.x} ${sail.y}) rotate(${sail.angle}) scale(1.3)`">
              <g class="transition-opacity duration-700" :opacity="active >= 2 ? 1 : 0">
                <path d="M18 -15 h7 q3 0 3 2.5 t-3 2.5 h-7 z" fill="var(--atl-muted-gold)" />
                <path d="M-30 10 h7 q3 0 3 2.5 t-3 2.5 h-7 z" fill="var(--atl-muted-gold)" />
              </g>
              <path :d="hull" fill="var(--atl-off-white)" />
              <rect
                v-for="c in cargo"
                :key="c.x + '-' + c.y"
                :x="c.x"
                :y="c.y"
                width="5"
                height="4"
                rx="0.6"
                :fill="c.fill"
              />
              <rect x="-22" y="-4.5" width="4.5" height="9" rx="1" fill="var(--atl-deep-navy)" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.atl-journey__body {
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.5s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.atl-journey__body.is-open {
  grid-template-rows: 1fr;
}

.atl-flow {
  animation: atl-flow 1.6s linear infinite;
}

.atl-chip-enter-active,
.atl-chip-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.atl-chip-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.atl-chip-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@keyframes atl-flow {
  to {
    stroke-dashoffset: -22;
  }
}

@media (prefers-reduced-motion: reduce) {
  .atl-flow {
    animation: none;
  }
  .atl-journey__body {
    transition: none;
  }
}
</style>
