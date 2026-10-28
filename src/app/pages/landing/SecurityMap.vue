<script setup>
import { useI18n } from 'vue-i18n'
import AtlIcon from '@/components/AtlIcon.vue'

const { t } = useI18n()
const reduced =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Drawn on a 440 × 300 grid; HTML pieces are placed with the same numbers as percentages.
const server = { x: 180, y: 162 }
const modules = [
  { key: 'berths', icon: 'window', x: 88, y: 88 },
  { key: 'tugs', icon: 'anchor', x: 272, y: 88 },
  { key: 'pilots', icon: 'ship', x: 88, y: 238 },
  { key: 'yard', icon: 'grid', x: 272, y: 238 },
]
const at = (x, y) => ({ left: `${(x / 440) * 100}%`, top: `${(y / 300) * 100}%` })
// Each link bends gently on its way to the server.
const link = (m) => `M${m.x} ${m.y} Q ${(m.x + server.x) / 2} ${m.y}, ${server.x} ${server.y}`
const outside = 'M402 118 C 402 146, 384 160, 346 162'
</script>

<!-- Data moves between the port's own systems and its server, and never leaves the port wall. -->
<template>
  <div class="relative aspect-[44/30] w-full" dir="ltr" aria-hidden="true">
    <!-- The port wall -->
    <div
      class="absolute rounded-[28px] border-2 border-navy/80 bg-white/25 shadow-[inset_0_0_0_6px_rgb(255_255_255/0.25)] dark:border-teal-light/50 dark:bg-white/5 dark:shadow-[inset_0_0_0_6px_rgb(255_255_255/0.04)]"
      :style="{ left: '3.6%', right: '21.8%', top: '9%', bottom: '3%' }"
    />
    <span
      class="atl-glass absolute flex -translate-y-1/2 items-center gap-1.5 rounded-full bg-navy/90 px-3 py-1 text-xs font-semibold whitespace-nowrap text-offwhite sm:text-sm"
      :style="{ left: '7%', top: '9%' }"
    >
      <AtlIcon name="lock" :size="14" />
      {{ t('landing.security.map.network') }}
    </span>

    <svg viewBox="0 0 440 300" class="absolute inset-0 size-full text-navy dark:text-offwhite">
      <defs>
        <filter id="atl-dot-glow" x="-1" y="-1" width="3" height="3">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      <path
        v-for="m in modules"
        :key="`l-${m.key}`"
        :d="link(m)"
        fill="none"
        stroke="var(--atl-mid-teal)"
        stroke-opacity="0.7"
        stroke-width="1.6"
      />
      <path
        :d="outside"
        fill="none"
        stroke="currentColor"
        stroke-opacity="0.3"
        stroke-width="1.6"
        stroke-dasharray="3 5"
      />
      <template v-if="!reduced">
        <g v-for="(m, i) in modules" :key="`d-${m.key}`">
          <circle r="5" fill="var(--atl-muted-gold)" filter="url(#atl-dot-glow)">
            <animateMotion
              :path="link(m)"
              dur="2.6s"
              :begin="`${i * 0.65}s`"
              repeatCount="indefinite"
              :keyPoints="i % 2 ? '0;1' : '1;0'"
              keyTimes="0;1"
              calcMode="linear"
            />
          </circle>
          <circle r="2.6" fill="#f6e2b8">
            <animateMotion
              :path="link(m)"
              dur="2.6s"
              :begin="`${i * 0.65}s`"
              repeatCount="indefinite"
              :keyPoints="i % 2 ? '0;1' : '1;0'"
              keyTimes="0;1"
              calcMode="linear"
            />
          </circle>
        </g>
        <circle r="3" fill="currentColor" fill-opacity="0.55">
          <animateMotion :path="outside" dur="2.4s" repeatCount="indefinite" />
          <animate
            attributeName="opacity"
            values="1;1;0"
            keyTimes="0;0.85;1"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </circle>
      </template>
    </svg>

    <!-- The port's systems, as glass tiles -->
    <span
      v-for="m in modules"
      :key="m.key"
      class="atl-glass atl-glass--light absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full py-1 ps-1 pe-3 text-xs font-semibold whitespace-nowrap text-navy sm:py-1.5 dark:text-offwhite sm:ps-1.5 sm:pe-4 sm:text-sm"
      :style="at(m.x, m.y)"
    >
      <span
        class="grid size-6 place-items-center rounded-full bg-navy text-offwhite sm:size-8 dark:bg-teal"
      >
        <AtlIcon :name="m.icon" :size="15" />
      </span>
      {{ t(`landing.security.map.${m.key}`) }}
    </span>

    <!-- The port server -->
    <span
      class="atl-glass absolute grid -translate-x-1/2 -translate-y-1/2 justify-items-center gap-1.5 rounded-2xl bg-navy/90 px-4 py-3 text-offwhite sm:px-5 sm:py-4"
      :style="at(server.x, server.y)"
    >
      <span class="relative">
        <AtlIcon name="server" :size="30" />
        <span
          class="absolute -end-2 -bottom-2 grid size-5 place-items-center rounded-full bg-gold text-navy"
        >
          <AtlIcon name="lock" :size="12" />
        </span>
      </span>
      <span class="text-[11px] font-semibold whitespace-nowrap sm:text-xs">
        {{ t('landing.security.map.server') }}
      </span>
    </span>

    <!-- Outside the wall: a request that is turned back -->
    <span
      class="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 text-xs font-semibold whitespace-nowrap text-navy/60 dark:text-offwhite/60"
      :style="at(402, 104)"
    >
      <AtlIcon name="globe" :size="14" />
      {{ t('landing.security.map.internet') }}
    </span>
    <span
      class="atl-glass atl-glass--light absolute grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[#b3412f]"
      :style="at(346, 162)"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
      >
        <path d="M2 2l8 8M10 2l-8 8" />
      </svg>
    </span>
  </div>
</template>
