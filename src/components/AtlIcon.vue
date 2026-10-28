<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 24 },
})

// Open, round-jointed line icons, as the brand asks. Replaced by the approved set in FE-018.
const ICONS = {
  ship: [
    'M3 17l2 4h14l2-4',
    'M5 17V11h14v6',
    'M8 11V7h8v4',
    'M12 3v4',
    'M2 21c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1',
  ],
  window: ['M3 4h18v16H3z', 'M3 9h18', 'M8 13h3', 'M8 16h6'],
  spark: [
    'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
    'M19 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z',
  ],
  anchor: [
    'M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    'M12 8v13',
    'M5 13a7 7 0 0 0 14 0',
    'M3 13h4',
    'M17 13h4',
  ],
  grid: ['M4 4h6v6H4z', 'M14 4h6v6h-6z', 'M4 14h6v6H4z', 'M14 14h6v6h-6z'],
  pulse: ['M3 12h4l3-7 4 14 3-7h4'],
  check: ['M20 6L9 17l-5-5'],
  shield: ['M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', 'M9 12l2 2 4-4'],
  arrow: ['M12 5v14', 'M6 13l6 6 6-6'],
  'arrow-up': ['M12 19V5', 'M6 11l6-6 6 6'],
  refresh: ['M20 11a8 8 0 1 0-2.3 5.7', 'M20 4v7h-7'],
  home: ['M3 11l9-7 9 7', 'M5 10v10h14V10', 'M10 20v-6h4v6'],
  server: ['M4 4h16v7H4z', 'M4 13h16v7H4z', 'M8 7.5h.01', 'M8 16.5h.01'],
  lock: ['M6 11h12v9H6z', 'M8.5 11V8a3.5 3.5 0 0 1 7 0v3'],
  mail: ['M3 5h18v14H3z', 'M3 6l9 7 9-7'],
  phone: [
    'M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z',
  ],
  linkedin: [
    'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z',
    'M2 9h4v12H2z',
    'M4 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  ],
  facebook: ['M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z'],
  x: ['M4 4l11.7 16H20L8.3 4z', 'M4 20l6.8-7.4', 'M20 4l-6.8 7.4'],
  github: [
    'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3.1-.4 6.4-1.5 6.4-7a5.4 5.4 0 0 0-1.5-3.8A5.1 5.1 0 0 0 19.9 1S18.7.7 16 2.5a13.4 13.4 0 0 0-7 0C6.3.7 5.1 1 5.1 1A5.1 5.1 0 0 0 5 4.8a5.4 5.4 0 0 0-1.5 3.8c0 5.4 3.3 6.6 6.4 7A3.4 3.4 0 0 0 9 18.1V22',
  ],
  globe: [
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
    'M3 12h18',
    'M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z',
  ],
}

const paths = computed(() => ICONS[props.name] ?? [])
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-for="d in paths" :key="d" :d="d" />
  </svg>
</template>
