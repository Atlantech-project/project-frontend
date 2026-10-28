<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const reduced =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const server = { x: 180, y: 160 }
// The port's own systems, each trading data with the server inside the wall.
const modules = [
  { key: 'berths', x: 82, y: 92 },
  { key: 'tugs', x: 278, y: 92 },
  { key: 'pilots', x: 82, y: 236 },
  { key: 'yard', x: 278, y: 236 },
]
const link = (m) => `M${m.x} ${m.y} L${server.x} ${server.y}`
</script>

<!-- Data moves between the port's own systems and its server, and never leaves the port wall. -->
<template>
  <svg viewBox="0 0 440 300" class="block w-full" direction="ltr" aria-hidden="true">
    <!-- The port wall -->
    <rect
      x="16"
      y="34"
      width="328"
      height="252"
      rx="28"
      fill="rgb(255 255 255 / 0.28)"
      stroke="var(--atl-deep-navy)"
      stroke-width="3"
    />
    <rect
      x="24"
      y="42"
      width="312"
      height="236"
      rx="22"
      fill="none"
      stroke="var(--atl-deep-navy)"
      stroke-opacity="0.25"
      stroke-dasharray="4 6"
    />
    <rect x="34" y="20" width="132" height="28" rx="14" fill="var(--atl-deep-navy)" />
    <text x="100" y="39" text-anchor="middle" font-size="13" font-weight="600" fill="#e5e1dd">
      {{ t('landing.security.map.network') }}
    </text>

    <!-- Links, with data moving along them -->
    <path
      v-for="m in modules"
      :key="`l-${m.key}`"
      :d="link(m)"
      stroke="var(--atl-mid-teal)"
      stroke-width="2"
      stroke-dasharray="3 5"
    />
    <template v-if="!reduced">
      <circle v-for="(m, i) in modules" :key="`d-${m.key}`" r="4" fill="var(--atl-muted-gold)">
        <animateMotion
          :path="link(m)"
          dur="2.4s"
          :begin="`${i * 0.6}s`"
          repeatCount="indefinite"
          :keyPoints="i % 2 ? '0;1' : '1;0'"
          keyTimes="0;1"
          calcMode="linear"
        />
      </circle>
    </template>

    <!-- Systems inside the port, drawn as glass tiles -->
    <g v-for="m in modules" :key="m.key">
      <rect
        :x="m.x - 50"
        :y="m.y - 18"
        width="100"
        height="36"
        rx="18"
        fill="rgb(255 255 255 / 0.7)"
        stroke="#fff"
        stroke-width="1.5"
      />
      <text
        :x="m.x"
        :y="m.y + 5"
        text-anchor="middle"
        font-size="13"
        font-weight="600"
        fill="var(--atl-deep-navy)"
      >
        {{ t(`landing.security.map.${m.key}`) }}
      </text>
    </g>

    <!-- The port server, locked -->
    <g :transform="`translate(${server.x - 34} ${server.y - 40})`">
      <rect width="68" height="80" rx="10" fill="var(--atl-deep-navy)" />
      <rect x="12" y="14" width="44" height="10" rx="3" fill="#e5e1dd" fill-opacity="0.18" />
      <rect x="12" y="32" width="44" height="10" rx="3" fill="#e5e1dd" fill-opacity="0.18" />
      <circle cx="18" cy="19" r="2" fill="var(--atl-light-teal)" class="atl-blink" />
      <circle
        cx="18"
        cy="37"
        r="2"
        fill="var(--atl-light-teal)"
        class="atl-blink atl-blink--late"
      />
      <circle cx="34" cy="62" r="11" fill="var(--atl-muted-gold)" />
      <path
        d="M29 62 h10 v7 h-10 z M31 62 v-3 a3 3 0 0 1 6 0 v3"
        fill="none"
        stroke="var(--atl-deep-navy)"
        stroke-width="1.8"
      />
    </g>
    <text
      :x="server.x"
      :y="server.y + 58"
      text-anchor="middle"
      font-size="12"
      font-weight="600"
      fill="var(--atl-deep-navy)"
    >
      {{ t('landing.security.map.server') }}
    </text>

    <!-- Outside the wall: a request that is turned back -->
    <text
      x="396"
      y="96"
      text-anchor="middle"
      font-size="12"
      font-weight="600"
      fill="var(--atl-deep-navy)"
      fill-opacity="0.6"
    >
      {{ t('landing.security.map.internet') }}
    </text>
    <path
      d="M396 110 C 396 140, 380 156, 350 160"
      fill="none"
      stroke="var(--atl-deep-navy)"
      stroke-opacity="0.35"
      stroke-width="2"
      stroke-dasharray="3 5"
    />
    <circle v-if="!reduced" r="4" fill="var(--atl-deep-navy)" fill-opacity="0.5">
      <animateMotion
        path="M396 110 C 396 140, 380 156, 350 160"
        dur="2.4s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="opacity"
        values="1;1;0"
        keyTimes="0;0.8;1"
        dur="2.4s"
        repeatCount="indefinite"
      />
    </circle>
    <path
      d="M346 152 l10 12 M356 152 l-10 12"
      stroke="#b3412f"
      stroke-width="2.5"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped>
.atl-blink {
  animation: atl-blink 1.6s steps(2, jump-none) infinite;
}

.atl-blink--late {
  animation-delay: 0.8s;
}

@keyframes atl-blink {
  50% {
    opacity: 0.25;
  }
}

@media (prefers-reduced-motion: reduce) {
  .atl-blink {
    animation: none;
  }
}
</style>
