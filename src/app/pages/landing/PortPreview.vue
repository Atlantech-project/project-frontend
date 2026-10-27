<script setup>
import { useI18n } from 'vue-i18n'
import AtlIcon from '@/components/AtlIcon.vue'

const { t } = useI18n()

// Sample data for the product window in the hero (illustration only, not live data).
const kpis = [
  { key: 'vessels', value: 14 },
  { key: 'berths', value: 3 },
  { key: 'tugs', value: 6 },
]
const vessels = [
  {
    name: 'MSC Aurora',
    place: 'B-03',
    status: 'berthing',
    tone: 'border border-offwhite/25 bg-navy text-offwhite',
  },
  { name: 'Nile Star', place: 'Channel', status: 'pilot', tone: 'bg-offwhite text-navy' },
  { name: 'Delta Trader', place: 'Anchorage', status: 'waiting', tone: 'bg-teal-light text-navy' },
]
const berths = ['B-01', 'B-02', 'B-03', 'B-04', 'B-05']
const busy = ['B-01', 'B-03', 'B-04']
const hours = Array.from({ length: 24 }, (_, i) => i >= 14 && i < 17)
</script>

<template>
  <div
    data-ui
    class="overflow-hidden rounded-[var(--atl-radius-lg)] border border-offwhite/15 bg-[#062e3f] text-offwhite"
  >
    <div data-ui class="flex items-center gap-2 border-b border-offwhite/10 px-4 py-3">
      <span class="size-2.5 rounded-full bg-offwhite/25" />
      <span class="size-2.5 rounded-full bg-offwhite/25" />
      <span class="size-2.5 rounded-full bg-offwhite/25" />
      <span class="ms-3 font-display text-sm font-semibold">{{ t('landing.preview.title') }}</span>
      <span class="ms-auto flex items-center gap-2 text-xs text-teal-light">
        <span class="atl-live-dot" aria-hidden="true" />
        {{ t('landing.preview.live') }}
      </span>
    </div>

    <div class="grid gap-4 p-4 md:grid-cols-[1fr_1.15fr] md:p-5">
      <div class="grid content-start gap-4">
        <ul class="grid grid-cols-3 gap-3">
          <li
            v-for="k in kpis"
            :key="k.key"
            class="rounded-[var(--atl-radius-sm)] bg-offwhite/5 px-3 py-2.5"
          >
            <p class="font-display text-2xl font-semibold">{{ k.value }}</p>
            <p class="text-[11px] leading-tight text-offwhite/60">
              {{ t(`landing.preview.kpi.${k.key}`) }}
            </p>
          </li>
        </ul>
        <ul class="grid gap-2.5">
          <li
            v-for="v in vessels"
            :key="v.name"
            class="flex items-center gap-3 rounded-[var(--atl-radius-sm)] bg-offwhite/5 px-3 py-2.5"
          >
            <AtlIcon name="ship" :size="20" class="text-teal-light" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold">{{ v.name }}</p>
              <p class="text-xs text-offwhite/55">{{ v.place }}</p>
            </div>
            <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="v.tone">
              {{ t(`landing.preview.status.${v.status}`) }}
            </span>
          </li>
        </ul>
        <div class="rounded-[var(--atl-radius-sm)] bg-offwhite/5 px-3 py-3">
          <div class="flex items-center justify-between text-xs">
            <span class="text-offwhite/60">{{ t('landing.preview.window') }}</span>
            <span class="font-semibold text-teal-light" dir="ltr">14:00 – 17:00</span>
          </div>
          <div class="mt-2.5 flex gap-0.5" dir="ltr" aria-hidden="true">
            <span
              v-for="(open, i) in hours"
              :key="i"
              class="h-2 flex-1 rounded-[2px]"
              :class="open ? 'bg-[#7cc9a4]' : 'bg-offwhite/10'"
            />
          </div>
        </div>
      </div>

      <svg
        class="hidden w-full rounded-[var(--atl-radius-sm)] bg-[#0a3a4f] md:block"
        viewBox="0 0 320 220"
        aria-hidden="true"
      >
        <path
          v-for="i in 5"
          :key="i"
          :d="`M0 ${i * 32} q 40 -8 80 0 t 80 0 t 80 0 t 80 0`"
          fill="none"
          stroke="var(--atl-light-teal)"
          stroke-opacity="0.08"
        />
        <circle
          cx="62"
          cy="56"
          r="30"
          fill="none"
          stroke="var(--atl-muted-gold)"
          stroke-opacity="0.6"
          stroke-dasharray="4 5"
        />
        <path
          d="M62 56 C 140 56, 160 110, 190 140 S 205 175, 205 182"
          fill="none"
          stroke="var(--atl-light-teal)"
          stroke-opacity="0.5"
          stroke-width="2"
          stroke-dasharray="5 6"
          class="atl-flow"
        />
        <rect x="0" y="196" width="320" height="24" fill="var(--atl-light-teal)" opacity="0.18" />
        <g v-for="(b, i) in berths" :key="b">
          <rect
            :x="60 + i * 50"
            y="186"
            width="40"
            height="10"
            rx="2"
            :fill="busy.includes(b) ? 'var(--atl-muted-gold)' : 'var(--atl-light-teal)'"
            :opacity="busy.includes(b) ? 0.9 : 0.35"
          />
          <text
            :x="80 + i * 50"
            y="212"
            text-anchor="middle"
            font-size="9"
            fill="currentColor"
            opacity="0.6"
          >
            {{ b }}
          </text>
        </g>
        <g class="atl-bob-ship">
          <path d="M52 50 h16 l6 6 -6 6 h-16 z" fill="var(--atl-off-white)" />
        </g>
        <path
          d="M180 132 h14 l5 5 -5 5 h-14 z"
          fill="var(--atl-muted-gold)"
          transform="rotate(50 187 137)"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.atl-live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #7cc9a4;
  animation: atl-ping 1.8s ease-out infinite;
}

.atl-flow {
  animation: atl-flow 1.6s linear infinite;
}

.atl-bob-ship {
  animation: atl-bob 3s ease-in-out infinite;
}

/* Live-status pulse ring inside the data-ui product mock, not a decorative glow. */
@keyframes atl-ping {
  0% {
    box-shadow: 0 0 0 0 rgb(124 201 164 / 0.7); /* taste-skill-ignore */
  }
  100% {
    box-shadow: 0 0 0 8px rgb(124 201 164 / 0); /* taste-skill-ignore */
  }
}

@keyframes atl-flow {
  to {
    stroke-dashoffset: -22;
  }
}

@keyframes atl-bob {
  50% {
    transform: translateY(-3px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .atl-live-dot,
  .atl-flow,
  .atl-bob-ship {
    animation: none;
  }
}
</style>
