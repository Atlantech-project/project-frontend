<script setup>
import { computed, ref } from 'vue'
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
const berthX = (i) => 118 + i * 54

// From the anchorage, through the gap between the breakwaters, then along the quay to B-03.
const route = 'M64 74 C 140 74, 192 104, 199 150 C 205 192, 212 236, 250 236'
// A top-down container ship, bow to the right; the same outline draws the other vessels.
const hull = 'M-24 -6 H13 Q23 -6 26 0 Q23 6 13 6 H-24 Q-26 6 -26 4 V-4 Q-26 -6 -24 -6 Z'
const palette = ['#a58d66', '#407e8c', '#c0d5d6', '#2c6b78', '#8c7552', '#e5e1dd']
const cargo = Array.from({ length: 12 }, (_, i) => ({
  x: -16 + (i % 6) * 5.4,
  y: i < 6 ? -4.6 : 0.6,
  fill: palette[(i * 5 + 1) % palette.length],
}))
const waiting = [
  { x: 46, y: 98, angle: 12 },
  { x: 88, y: 50, angle: -18 },
]
const buoys = [
  { x: 150, y: 86, side: 0 },
  { x: 172, y: 110, side: 1 },
  { x: 186, y: 140, side: 0 },
  { x: 214, y: 140, side: 1 },
  { x: 196, y: 200, side: 0 },
  { x: 222, y: 194, side: 1 },
]
const contours = [
  'M0 36 C 90 24, 170 46, 260 30 S 380 20, 400 28',
  'M0 116 C 70 108, 120 128, 200 118 S 330 100, 400 112',
  'M0 196 C 60 188, 120 204, 170 196',
  'M240 192 C 300 200, 350 186, 400 194',
]

const active = computed(() => Math.min(steps.length - 1, Math.floor(progress.value * steps.length)))

// The ship waits at anchorage, then sails the channel and lies alongside its berth in the last step.
function pointAt(t) {
  const path = channel.value
  if (!path?.getTotalLength) return { x: 64, y: 74, angle: 0 }
  const length = path.getTotalLength()
  const a = path.getPointAtLength(length * t)
  const b = path.getPointAtLength(Math.min(length, length * t + 1))
  const angle = t >= 1 ? 0 : (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
  return { x: a.x, y: a.y, angle }
}

const sail = computed(() => {
  const p = range(progress.value, 0.76, 0.97)
  return pointAt(p * p * (3 - 2 * p))
})
</script>

<!-- How it works, told as one vessel call while the reader scrolls. -->
<template>
  <section id="how" ref="section" class="atl-journey relative h-[440svh] bg-bg">
    <div class="atl-journey__stage sticky top-0 flex h-svh items-center overflow-hidden pt-16">
      <div
        class="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 md:grid-cols-[0.8fr_1.2fr] md:gap-14"
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
          class="relative w-full max-w-[calc((100svh-9rem)*1.3)] justify-self-center overflow-hidden rounded-[var(--atl-radius-lg)] bg-navy p-3 text-offwhite sm:p-4"
        >
          <Transition name="atl-chip" mode="out-in">
            <p
              :key="active"
              class="absolute top-5 start-5 z-10 flex items-center gap-2 rounded-full bg-offwhite px-3 py-1.5 text-xs font-semibold text-navy sm:text-sm"
              aria-live="polite"
            >
              <AtlIcon :name="active === 3 ? 'check' : 'pulse'" :size="16" class="text-teal" />
              {{ t(`landing.journey.steps.${steps[active]}.status`) }}
            </p>
          </Transition>

          <svg class="block w-full" viewBox="0 0 400 300" direction="ltr" aria-hidden="true">
            <defs>
              <linearGradient id="atl-sea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#0d4c64" />
                <stop offset="1" stop-color="#083a4f" />
              </linearGradient>
              <radialGradient id="atl-lamp">
                <stop offset="0" stop-color="var(--atl-muted-gold)" stop-opacity="0.7" />
                <stop offset="1" stop-color="var(--atl-muted-gold)" stop-opacity="0" />
              </radialGradient>
            </defs>
            <rect width="400" height="300" rx="10" fill="url(#atl-sea)" />

            <!-- Depth contours, like a nautical chart -->
            <path
              v-for="(d, i) in contours"
              :key="i"
              :d="d"
              fill="none"
              stroke="var(--atl-light-teal)"
              stroke-opacity="0.09"
            />

            <!-- Compass -->
            <g transform="translate(368 34)" opacity="0.55">
              <circle r="13" fill="none" stroke="var(--atl-light-teal)" stroke-opacity="0.5" />
              <path d="M0 -10 L3 0 L0 10 L-3 0 Z" fill="var(--atl-light-teal)" opacity="0.35" />
              <path d="M0 -10 L3 0 H-3 Z" fill="var(--atl-muted-gold)" />
              <text y="-17" text-anchor="middle" font-size="8" fill="currentColor">N</text>
            </g>

            <!-- Anchorage, with other vessels waiting their turn -->
            <circle
              cx="64"
              cy="74"
              r="36"
              fill="var(--atl-light-teal)"
              fill-opacity="0.04"
              stroke="var(--atl-muted-gold)"
              stroke-opacity="0.6"
              stroke-dasharray="3 5"
            />
            <g
              v-for="v in waiting"
              :key="v.y"
              :transform="`translate(${v.x} ${v.y}) rotate(${v.angle}) scale(0.62)`"
              opacity="0.55"
            >
              <path :d="hull" fill="var(--atl-light-teal)" />
            </g>
            <text
              x="64"
              y="126"
              text-anchor="middle"
              font-size="10"
              fill="currentColor"
              opacity="0.75"
            >
              {{ t('landing.journey.map.anchorage') }}
            </text>

            <!-- Channel: lights up once the safe window is confirmed -->
            <path
              :d="route"
              fill="none"
              stroke-width="24"
              stroke-linecap="round"
              stroke="var(--atl-light-teal)"
              class="transition-[stroke-opacity] duration-700"
              :stroke-opacity="active >= 1 ? 0.2 : 0.06"
            />
            <path
              ref="channel"
              :d="route"
              fill="none"
              stroke="var(--atl-light-teal)"
              stroke-opacity="0.6"
              stroke-width="1.2"
              stroke-dasharray="4 6"
              class="atl-flow"
            />
            <g v-for="(b, i) in buoys" :key="i">
              <circle
                :cx="b.x"
                :cy="b.y"
                r="8"
                fill="url(#atl-lamp)"
                class="transition-opacity duration-700"
                :opacity="active >= 1 ? 1 : 0"
              />
              <circle
                :cx="b.x"
                :cy="b.y"
                r="2.6"
                :fill="b.side ? 'var(--atl-muted-gold)' : 'var(--atl-light-teal)'"
              />
            </g>
            <text x="232" y="112" font-size="10" fill="currentColor" opacity="0.75">
              {{ t('landing.journey.map.channel') }}
            </text>

            <!-- Breakwaters with a light at each head -->
            <path
              d="M-4 156 H168"
              stroke="#5f8f99"
              stroke-width="7"
              stroke-linecap="round"
              opacity="0.7"
            />
            <path
              d="M232 156 H404"
              stroke="#5f8f99"
              stroke-width="7"
              stroke-linecap="round"
              opacity="0.7"
            />
            <circle cx="168" cy="156" r="3.5" fill="var(--atl-muted-gold)" />
            <circle cx="232" cy="156" r="3.5" fill="var(--atl-light-teal)" />

            <!-- Land, quay edge, bollards and berths -->
            <rect x="0" y="244" width="400" height="56" fill="#0e4458" />
            <rect x="0" y="244" width="400" height="3" fill="var(--atl-light-teal)" opacity="0.5" />
            <circle
              v-for="i in 15"
              :key="i"
              :cx="104 + i * 18"
              cy="257"
              r="1.4"
              fill="var(--atl-light-teal)"
              opacity="0.5"
            />
            <text x="22" y="278" font-size="10" fill="currentColor" opacity="0.75">
              {{ t('landing.journey.map.quay') }}
            </text>
            <g v-for="(b, i) in berths" :key="b">
              <rect
                :x="berthX(i)"
                y="247"
                width="48"
                height="5"
                rx="1.5"
                class="transition-[fill,opacity] duration-700"
                :fill="
                  b === 'B-03' && active >= 2 ? 'var(--atl-muted-gold)' : 'var(--atl-light-teal)'
                "
                :opacity="b === 'B-03' && active >= 2 ? 1 : 0.22"
              />
              <text
                :x="berthX(i) + 24"
                y="270"
                text-anchor="middle"
                font-size="9"
                fill="currentColor"
                :opacity="b === 'B-03' && active >= 2 ? 1 : 0.65"
                :font-weight="b === 'B-03' && active >= 2 ? 700 : 400"
              >
                {{ b }}
              </text>
            </g>
            <circle
              v-if="active >= 2"
              :cx="berthX(2) + 24"
              cy="236"
              r="18"
              fill="none"
              stroke="var(--atl-muted-gold)"
              class="atl-ring"
            />

            <!-- Vessels already alongside at B-01 and B-04 -->
            <g
              v-for="i in [0, 3]"
              :key="i"
              :transform="`translate(${berthX(i) + 24} 238) scale(0.8)`"
              opacity="0.8"
            >
              <path :d="hull" fill="#b9c9c9" />
              <rect
                v-for="c in cargo"
                :key="c.x + '-' + c.y"
                :x="c.x"
                :y="c.y"
                width="5"
                height="4"
                rx="0.6"
                :fill="c.fill"
                opacity="0.8"
              />
            </g>

            <!-- Nile Star, with its tugs once they are assigned -->
            <g :transform="`translate(${sail.x} ${sail.y}) rotate(${sail.angle})`">
              <g class="transition-opacity duration-700" :opacity="active >= 2 ? 1 : 0">
                <path d="M17 -14 h7 q3 0 3 2.5 t-3 2.5 h-7 z" fill="var(--atl-muted-gold)" />
                <path d="M-27 9 h7 q3 0 3 2.5 t-3 2.5 h-7 z" fill="var(--atl-muted-gold)" />
                <path
                  d="M20 -9.5 L16 -5 M-20 9.5 L-17 5"
                  stroke="var(--atl-muted-gold)"
                  stroke-width="0.8"
                />
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
              <rect x="-22" y="-4.5" width="4.5" height="9" rx="1" fill="var(--atl-mid-teal)" />
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

.atl-ring {
  transform-box: fill-box;
  transform-origin: center;
  animation: atl-ring 1.8s ease-out infinite;
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

@keyframes atl-ring {
  from {
    opacity: 1;
    transform: scale(0.6);
  }
  to {
    opacity: 0;
    transform: scale(1.8);
  }
}

@media (prefers-reduced-motion: reduce) {
  .atl-flow,
  .atl-ring {
    animation: none;
  }
  .atl-journey__body {
    transition: none;
  }
}
</style>
