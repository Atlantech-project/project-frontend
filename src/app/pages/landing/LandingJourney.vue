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

const active = computed(() => Math.min(steps.length - 1, Math.floor(progress.value * steps.length)))

// The ship waits at anchorage, then sails the channel to its berth during the last step.
function pointAt(t) {
  const path = channel.value
  if (!path?.getTotalLength) return { x: 60, y: 70, angle: 0 }
  const length = path.getTotalLength()
  const a = path.getPointAtLength(length * t)
  const b = path.getPointAtLength(Math.min(length, length * t + 1))
  const angle = t >= 1 ? 90 : (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
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
                <stop offset="0" stop-color="#0a4258" />
                <stop offset="1" stop-color="#083a4f" />
              </linearGradient>
            </defs>
            <rect width="400" height="300" rx="10" fill="url(#atl-sea)" />
            <path
              v-for="i in 7"
              :key="i"
              :d="`M0 ${i * 36} q 25 -6 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0`"
              fill="none"
              stroke="var(--atl-light-teal)"
              stroke-opacity="0.07"
            />

            <!-- Anchorage -->
            <circle
              cx="60"
              cy="80"
              r="34"
              fill="none"
              stroke="var(--atl-muted-gold)"
              stroke-opacity="0.65"
              stroke-dasharray="4 5"
            />
            <text
              x="60"
              y="132"
              text-anchor="middle"
              font-size="10"
              fill="currentColor"
              opacity="0.7"
            >
              {{ t('landing.journey.map.anchorage') }}
            </text>
            <path d="M44 96 h12 l4 4 -4 4 h-12 z" fill="var(--atl-light-teal)" opacity="0.45" />
            <path d="M64 58 h12 l4 4 -4 4 h-12 z" fill="var(--atl-light-teal)" opacity="0.45" />

            <!-- Channel: turns green once the safe window is confirmed -->
            <path
              d="M60 80 C 160 80, 190 130, 225 170 S 270 215, 270 236"
              fill="none"
              stroke-width="22"
              stroke-linecap="round"
              class="transition-[stroke,stroke-opacity] duration-700"
              :stroke="active >= 1 ? '#7cc9a4' : 'var(--atl-light-teal)'"
              :stroke-opacity="active >= 1 ? 0.22 : 0.08"
            />
            <path
              ref="channel"
              d="M60 80 C 160 80, 190 130, 225 170 S 270 215, 270 236"
              fill="none"
              stroke="var(--atl-light-teal)"
              stroke-opacity="0.55"
              stroke-width="1.5"
              stroke-dasharray="5 6"
              class="atl-flow"
            />
            <text x="200" y="120" font-size="10" fill="currentColor" opacity="0.7">
              {{ t('landing.journey.map.channel') }}
            </text>

            <!-- Quay and berths -->
            <rect
              x="0"
              y="262"
              width="400"
              height="38"
              fill="var(--atl-light-teal)"
              opacity="0.16"
            />
            <text x="24" y="285" font-size="10" fill="currentColor" opacity="0.7">
              {{ t('landing.journey.map.quay') }}
            </text>
            <g v-for="(b, i) in berths" :key="b">
              <rect
                :x="150 + i * 50"
                y="246"
                width="40"
                height="14"
                rx="2"
                class="transition-[fill,opacity] duration-700"
                :fill="
                  b === 'B-03' && active >= 2 ? 'var(--atl-muted-gold)' : 'var(--atl-light-teal)'
                "
                :opacity="b === 'B-03' && active >= 2 ? 1 : 0.3"
              />
              <text
                :x="170 + i * 50"
                y="284"
                text-anchor="middle"
                font-size="9"
                fill="currentColor"
                opacity="0.65"
              >
                {{ b }}
              </text>
            </g>
            <circle
              v-if="active >= 2"
              cx="270"
              cy="253"
              r="14"
              fill="none"
              stroke="var(--atl-muted-gold)"
              class="atl-ring"
            />

            <!-- The vessel, with its tugs once they are assigned -->
            <g :transform="`translate(${sail.x} ${sail.y}) rotate(${sail.angle})`">
              <g class="transition-opacity duration-700" :opacity="active >= 2 ? 1 : 0">
                <circle cx="-4" cy="-13" r="4" fill="var(--atl-muted-gold)" />
                <circle cx="-4" cy="13" r="4" fill="var(--atl-muted-gold)" />
              </g>
              <path d="M-14 -6 h20 l8 6 -8 6 h-20 z" fill="var(--atl-off-white)" />
              <rect x="-10" y="-3" width="10" height="6" rx="1" fill="var(--atl-mid-teal)" />
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
