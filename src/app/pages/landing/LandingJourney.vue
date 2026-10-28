<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AtlIcon from '@/components/AtlIcon.vue'
import { range, useScrollProgress } from '@/composables/useScrollProgress'
import { vTilt } from './glass'

const { t } = useI18n()
const section = ref(null)
const channel = ref(null)
const progress = useScrollProgress(section)

const steps = ['request', 'window', 'recommend', 'execute']
const checkpoints = ['window', 'recommend']
const berths = ['B-01', 'B-02', 'B-03', 'B-04', 'B-05']
const berthX = (i) => 80 + i * 62

// From the anchorage, through the gap between the breakwaters, then along the quay to B-03.
const route = 'M70 70 C 150 70, 196 100, 200 150 C 204 194, 206 222, 236 222'
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
// Near the quay the stern tug swings round to push from the seaward side.
const nearQuay = computed(() => travelled.value > 0.85)

// Buoys mark both edges of the channel. They light up one by one once the safe window is set.
const buoys = ref([])
onMounted(() => {
  const path = channel.value
  if (!path?.getTotalLength) return
  const length = path.getTotalLength()
  const marks = []
  for (let i = 0; i < 6; i++) {
    const at = length * (0.2 + i * 0.12)
    const a = path.getPointAtLength(at)
    const b = path.getPointAtLength(at + 1)
    const d = Math.hypot(b.x - a.x, b.y - a.y) || 1
    const nx = -(b.y - a.y) / d
    const ny = (b.x - a.x) / d
    marks.push({ x: a.x + nx * 17, y: a.y + ny * 17, side: 'a', i })
    marks.push({ x: a.x - nx * 17, y: a.y - ny * 17, side: 'b', i })
  }
  buoys.value = marks
})

// Depth contours of the outer harbour, and container stacks in the yard behind the quay.
const contours = [
  'M-10 34 C 70 18, 150 46, 240 28 S 360 12, 410 26',
  'M-10 96 C 40 84, 110 112, 150 100',
  'M250 92 C 300 76, 350 104, 410 88',
  'M-10 196 C 50 186, 110 204, 170 194',
  'M250 192 C 300 182, 350 200, 410 190',
]
const yard = Array.from({ length: 28 }, (_, i) => ({
  x: 96 + (i % 14) * 21,
  y: i < 14 ? 279 : 288,
  fill: palette[(i * 5 + Math.floor(i / 3)) % palette.length],
}))

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
          v-tilt
          data-ui
          class="atl-harbour relative w-full max-w-[calc((100svh-8rem)*1.38)] justify-self-center overflow-hidden rounded-[var(--atl-radius-lg)] bg-navy p-1.5 text-offwhite"
        >
          <Transition name="atl-chip" mode="out-in">
            <p
              :key="status"
              class="atl-glass absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full bg-navy/40 px-3 py-1.5 text-xs font-semibold text-offwhite sm:text-sm"
              aria-live="polite"
            >
              <AtlIcon
                :name="status === 'berthed' ? 'check' : 'pulse'"
                :size="16"
                class="text-gold"
              />
              {{
                status === 'berthed' || status === 'sailing'
                  ? t(`landing.journey.${status}`)
                  : t(`landing.journey.steps.${status}.status`)
              }}
            </p>
          </Transition>

          <svg
            class="block w-full rounded-[calc(var(--atl-radius-lg)-6px)]"
            viewBox="0 0 400 300"
            direction="ltr"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="atl-sea" cx="0.5" cy="0.15" r="0.95">
                <stop offset="0" stop-color="#145a72" />
                <stop offset="0.55" stop-color="#0c4a61" />
                <stop offset="1" stop-color="#083a4f" />
              </radialGradient>
              <linearGradient id="atl-land" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#d3e2e3" />
                <stop offset="1" stop-color="#b3cacc" />
              </linearGradient>
              <radialGradient id="atl-glow">
                <stop offset="0" stop-color="#f6e2b8" stop-opacity="0.9" />
                <stop offset="1" stop-color="#f6e2b8" stop-opacity="0" />
              </radialGradient>
              <filter id="atl-ship-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow
                  dx="0"
                  dy="2.5"
                  stdDeviation="2"
                  flood-color="#041f2b"
                  flood-opacity="0.55"
                />
              </filter>
            </defs>

            <!-- Sea, with soft depth contours -->
            <rect width="400" height="300" fill="url(#atl-sea)" />
            <path
              v-for="c in contours"
              :key="c"
              :d="c"
              fill="none"
              stroke="var(--atl-light-teal)"
              stroke-opacity="0.08"
              stroke-width="1"
            />

            <!-- Anchorage -->
            <g>
              <circle cx="70" cy="70" r="40" fill="var(--atl-light-teal)" fill-opacity="0.05" />
              <circle
                cx="70"
                cy="70"
                r="40"
                fill="none"
                stroke="var(--atl-muted-gold)"
                stroke-opacity="0.8"
                stroke-width="1.2"
                stroke-dasharray="3 4"
                class="atl-spin"
              />
              <text
                x="70"
                y="126"
                text-anchor="middle"
                font-size="11"
                font-weight="600"
                fill="var(--atl-off-white)"
                fill-opacity="0.85"
              >
                {{ t('landing.journey.map.anchorage') }}
              </text>
            </g>

            <!-- Channel: lights up once the safe window is confirmed -->
            <path
              :d="route"
              fill="none"
              stroke-width="30"
              stroke-linecap="round"
              stroke="var(--atl-light-teal)"
              class="transition-[stroke-opacity] duration-700"
              :stroke-opacity="active >= 1 ? 0.16 : 0.05"
            />
            <path
              ref="channel"
              :d="route"
              fill="none"
              stroke="var(--atl-off-white)"
              stroke-opacity="0.55"
              stroke-width="1.2"
              stroke-linecap="round"
              stroke-dasharray="4 6"
              class="atl-flow"
            />
            <g v-for="b in buoys" :key="b.side + b.i">
              <circle
                :cx="b.x"
                :cy="b.y"
                r="7"
                fill="url(#atl-glow)"
                class="atl-buoy-glow"
                :class="{ 'is-on': active >= 1 }"
                :style="{ transitionDelay: `${b.i * 120}ms` }"
              />
              <circle
                :cx="b.x"
                :cy="b.y"
                r="2.2"
                class="transition-[fill] duration-500"
                :fill="active >= 1 ? (b.side === 'a' ? '#a58d66' : '#e5e1dd') : '#407e8c'"
                :style="{ transitionDelay: `${b.i * 120}ms` }"
              />
            </g>
            <text
              x="228"
              y="104"
              font-size="11"
              font-weight="600"
              fill="var(--atl-off-white)"
              fill-opacity="0.85"
            >
              {{ t('landing.journey.map.channel') }}
            </text>

            <!-- Breakwaters, with a light at each head of the harbour mouth -->
            <g stroke-linecap="round" fill="none">
              <path d="M-10 160 Q 80 146 164 154" stroke="#2c6b78" stroke-width="11" />
              <path d="M410 162 Q 320 146 236 154" stroke="#2c6b78" stroke-width="11" />
              <path
                d="M-10 158 Q 80 144 164 152 M410 160 Q 320 144 236 152"
                stroke="var(--atl-light-teal)"
                stroke-opacity="0.55"
                stroke-width="3"
              />
            </g>
            <g v-for="x in [164, 236]" :key="x">
              <circle :cx="x" cy="154" r="10" fill="url(#atl-glow)" class="atl-beacon" />
              <circle :cx="x" cy="154" r="3" fill="#f6e2b8" />
            </g>

            <!-- Compass -->
            <g transform="translate(374 32)" opacity="0.7">
              <circle r="11" fill="none" stroke="var(--atl-light-teal)" stroke-opacity="0.35" />
              <path d="M0 -9 L3 0 L0 9 L-3 0 Z" fill="var(--atl-light-teal)" fill-opacity="0.35" />
              <path d="M0 -9 L3 0 L-3 0 Z" fill="var(--atl-muted-gold)" />
              <text
                y="-14"
                text-anchor="middle"
                font-size="7"
                font-weight="700"
                fill="var(--atl-light-teal)"
              >
                N
              </text>
            </g>

            <!-- Quay, its apron and the yard behind it -->
            <rect x="0" y="238" width="400" height="62" fill="url(#atl-land)" />
            <rect x="0" y="238" width="400" height="4" fill="var(--atl-off-white)" />
            <rect
              v-for="(c, i) in yard"
              :key="i"
              :x="c.x"
              :y="c.y"
              width="18"
              height="6"
              rx="1"
              :fill="c.fill"
              fill-opacity="0.55"
            />
            <text x="16" y="276" font-size="12" font-weight="700" fill="var(--atl-deep-navy)">
              {{ t('landing.journey.map.quay') }}
            </text>

            <g v-for="(b, i) in berths" :key="b">
              <rect
                :x="berthX(i) + 4"
                y="211"
                width="56"
                height="24"
                rx="4"
                stroke-width="1.2"
                class="transition-[fill,stroke,fill-opacity,stroke-opacity] duration-700"
                :fill="
                  b === 'B-03' && active >= 2 ? 'var(--atl-muted-gold)' : 'var(--atl-light-teal)'
                "
                :fill-opacity="b === 'B-03' && active >= 2 ? 0.28 : 0.04"
                :stroke="
                  b === 'B-03' && active >= 2 ? 'var(--atl-muted-gold)' : 'var(--atl-light-teal)'
                "
                :stroke-opacity="b === 'B-03' && active >= 2 ? 1 : 0.25"
                stroke-dasharray="3 3"
              />
              <circle
                v-for="dx in [6, 58]"
                :key="dx"
                :cx="berthX(i) + dx"
                cy="240"
                r="1.6"
                fill="var(--atl-deep-navy)"
                fill-opacity="0.6"
              />
              <rect
                :x="berthX(i) + 9"
                y="247"
                width="46"
                height="18"
                rx="9"
                class="transition-[fill,fill-opacity] duration-700"
                :fill="
                  b === 'B-03' && active >= 2 ? 'var(--atl-muted-gold)' : 'var(--atl-deep-navy)'
                "
                :fill-opacity="b === 'B-03' && active >= 2 ? 1 : 0.1"
              />
              <text
                :x="berthX(i) + 32"
                y="259.5"
                text-anchor="middle"
                font-size="10"
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
                <path
                  d="M-30 10 h7 q3 0 3 2.5 t-3 2.5 h-7 z"
                  fill="var(--atl-muted-gold)"
                  class="atl-tug"
                  :class="{ 'is-seaward': nearQuay }"
                />
              </g>
              <g filter="url(#atl-ship-shadow)">
                <path :d="hull" fill="var(--atl-off-white)" />
              </g>
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

.atl-harbour {
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.08),
    0 40px 80px -40px rgb(4 31 43 / 0.6);
}

.atl-flow {
  animation: atl-flow 1.6s linear infinite;
}

.atl-spin {
  transform-box: fill-box;
  transform-origin: center;
  animation: atl-spin 40s linear infinite;
}

.atl-buoy-glow {
  opacity: 0;
  transition: opacity 0.6s;
}

.atl-buoy-glow.is-on {
  opacity: 0.8;
}

.atl-tug {
  transition: transform 0.8s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.atl-tug.is-seaward {
  transform: translateY(-25px);
}

.atl-beacon {
  animation: atl-beacon 2.8s ease-in-out infinite;
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
    stroke-dashoffset: -20;
  }
}

@keyframes atl-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes atl-beacon {
  50% {
    opacity: 0.3;
  }
}

@media (prefers-reduced-motion: reduce) {
  .atl-flow,
  .atl-spin,
  .atl-beacon {
    animation: none;
  }
  .atl-journey__body {
    transition: none;
  }
}
</style>
