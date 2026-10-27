<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  to: { type: Number, required: true },
  suffix: { type: String, default: '' },
  duration: { type: Number, default: 1600 },
})

// Counts from 0 to `to` the first time it scrolls into view.
const el = ref(null)
const value = ref(0)
let observer = null
let frame = 0

function run() {
  const start = performance.now()
  const step = (now) => {
    const t = Math.min(1, (now - start) / props.duration)
    value.value = Math.round(props.to * (1 - Math.pow(1 - t, 3)))
    if (t < 1) frame = requestAnimationFrame(step)
  }
  frame = requestAnimationFrame(step)
}

onMounted(() => {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduced || typeof IntersectionObserver === 'undefined') {
    value.value = props.to
    return
  }
  observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return
    observer.disconnect()
    run()
  })
  observer.observe(el.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  cancelAnimationFrame(frame)
})
</script>

<template>
  <span ref="el" class="tabular-nums">{{ value }}{{ suffix }}</span>
</template>
