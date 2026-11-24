<script setup>
// An icon from the app icon set (FE-018, Figma "Components" page). Decorative: give the button
// or link around it the accessible name. Left/right arrows point the other way in Arabic (RTL).
import { computed } from 'vue'
import { ICONS } from './icons'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 16 },
})

const MIRRORED = ['arrowleft', 'arrowright']

const icon = computed(() => ICONS[props.name] ?? [16, []])
// Figma draws the 16px icons with a 1.33px line and the 20px ones with 1.67px (grid / 12).
const strokeWidth = computed(() => +(icon.value[0] / 12).toFixed(2))
</script>

<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="`0 0 ${icon[0]} ${icon[0]}`"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    :class="{ 'rtl:-scale-x-100': MIRRORED.includes(name) }"
  >
    <path v-for="d in icon[1]" :key="d" :d="d" />
  </svg>
</template>
